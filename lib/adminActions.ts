"use server"

import { kv } from "@vercel/kv"
import { auth } from "@/lib/auth-server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AcademicProfile } from "./academicActions"
import legacyUsers from "@/lib/legacy-users.json" // 👈 ضفنا ملف الخريطة هنا
import { unstable_cache, revalidateTag } from 'next/cache';

const getSupabaseAdmin = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
}

// 🪄 السحر هنا: دالة بتحول الـ ID الجديد للقديم عشان الإدمن يشوف الداتا الصح
const getResolvedId = (email: string | undefined, currentId: string) => {
  if (!email) return currentId;
  const userMap = legacyUsers as Record<string, string>;
  return userMap[email] || currentId;
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth(); 
    if (!userId) return false;

    let admins = await kv.get<string[]>('site-admins');
    
    if (!admins || admins.length === 0) {
      admins = [userId];
      await kv.set('site-admins', admins);
      return true;
    }

    return admins.includes(userId);
  } catch (error) {
    return false;
  }
}



// 1. الدالة المكيشة (بتستخدم الدالة النظيفة اللي مفيهاش كوكيز)
const getCachedAllStudents = unstable_cache(
  async () => {
    // 👈 السحر هنا: بنستخدم العميل اللي مبيسألش على الكوكيز
    const pureAdmin = getPureSupabaseAdmin(); 
    
    const { data: { users }, error } = await pureAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 500
    });

    if (error) throw error;
    if (!users || users.length === 0) return [];

    const studentsData: any[] = [];
    const chunkSize = 100;

    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      
      const resolvedIds = chunk.map(user => getResolvedId(user.email, user.id));
      const profileKeys = resolvedIds.map(id => `academic-profile-${id}`);
      const notesKeys = resolvedIds.map(id => `advising-notes-${id}`);

      const [profiles, advisingNotes] = await Promise.all([
        profileKeys.length > 0 ? kv.mget(...profileKeys) : Promise.resolve([]),
        notesKeys.length > 0 ? kv.mget(...notesKeys) : Promise.resolve([])
      ]);

      chunk.forEach((user, index) => {
        const profile = profiles[index] as AcademicProfile | null;
        const note = advisingNotes[index] as string | null;

        studentsData.push({
          userId: user.id,
          advisingNotes: note || "",
          profile: {
            name: profile?.name || user.user_metadata?.full_name || user.email || "مستخدم بدون اسم",
            phone: profile?.phone || user.phone || "لا يوجد هاتف",
            department: profile?.department || "لم يكمل الإعدادات",
            semesters: profile?.semesters || []
          }
        });
      });
    }

    return studentsData;
  },
  ['admin-all-students-cache'],
  { tags: ['admin-students-data'], revalidate: 86400 } 
);


export async function getAllStudents() {
  try {
    // التحقق من الصلاحيات بيحصل بره الكاش (عادي يستخدم كوكيز هنا)
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // 🚀 زيرو استهلاك: الرد بييجي من الرامات!
    return await getCachedAllStudents();
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function toggleAdminStatus(targetUserId: string, makeAdmin: boolean) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabaseAdmin = await getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    const resolvedId = getResolvedId(user?.email, targetUserId);

    let admins = await kv.get<string[]>('site-admins') || [];
    
    if (makeAdmin && !admins.includes(resolvedId)) {
      admins.push(resolvedId);
    } else if (!makeAdmin) {
      admins = admins.filter(id => id !== resolvedId);
    }

    await kv.set('site-admins', admins);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getSiteAdmins(): Promise<string[]> {
  try {
    return await kv.get<string[]>('site-admins') || [];
  } catch (error) {
    return [];
  }
}

export async function deleteUserAccount(targetUserId: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("غير مصرح لك بإجراء هذا التعديل");

    const supabaseAdmin = await getSupabaseAdmin();
    
    // نجيب بيانات المستخدم عشان نعرف إيميله والـ ID القديم قبل الحذف
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    const resolvedId = getResolvedId(user?.email, targetUserId);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (deleteError) throw deleteError;

    // الحذف من الداتا بيز بيتم بناءً على الـ ID الصح
    await Promise.all([
      kv.del(`academic-profile-${resolvedId}`),
      kv.del(`student_records:${resolvedId}`),
      kv.del(`studyhub-cloud-data-${resolvedId}`),
      kv.del(`push-subscriptions-${resolvedId}`),
      kv.del(`advising-notes-${resolvedId}`),
      kv.del(`last_ai_analysis:${resolvedId}`)
    ]);

    let admins = await kv.get<string[]>('site-admins') || [];
    if (admins.includes(resolvedId)) {
      admins = admins.filter(id => id !== resolvedId);
      await kv.set('site-admins', admins);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdvisingNotes(studentId: string): Promise<string> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return "";

    const supabaseAdmin = await getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(studentId);
    const resolvedId = getResolvedId(user?.email, studentId);

    return await kv.get<string>(`advising-notes-${resolvedId}`) || "";
  } catch (error) {
    return "";
  }
}

// 🚀 دالة جديدة نظيفة تماماً من الكوكيز (للاستخدام داخل الكاش فقط)
const getPureSupabaseAdmin = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] }, // بنقوله مفيش كوكيز
        setAll() {}
      }
    }
  )
}

export async function saveAdvisingNotes(studentId: string, notes: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabaseAdmin = await getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(studentId);
    const resolvedId = getResolvedId(user?.email, studentId);

    await kv.set(`advising-notes-${resolvedId}`, notes);
    
    // 💥 السطر العبقري: بندمر الكاش! 
    // أول ما تفتح صفحة الإدمن من التليفون أو الكمبيوتر بعد التعديل، هيجيب الداتا الجديدة الفريش
    revalidateTag('admin-students-data');

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}