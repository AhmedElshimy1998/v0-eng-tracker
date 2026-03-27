"use server"

import { kv } from "@vercel/kv"
import { auth } from "@/lib/auth-server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AcademicProfile } from "./academicActions"
import legacyUsers from "@/lib/legacy-users.json" // 👈 ضفنا ملف الخريطة هنا

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

export async function getAllStudents() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabaseAdmin = await getSupabaseAdmin();
    
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 500
    });

    if (error) throw error;

    const studentsData = await Promise.all(
      users.map(async (user) => {
        // 🔄 قراءة الـ ID القديم (لو موجود) بدل الجديد
        const resolvedId = getResolvedId(user.email, user.id);

        // 📥 جلب الداتا باستخدام الـ ID الصح
        const profile = await kv.get<AcademicProfile>(`academic-profile-${resolvedId}`);
        const advisingNotes = await kv.get<string>(`advising-notes-${resolvedId}`) || ""; 
        
        return {
          userId: user.id, // بنبعت الآي دي بتاع سوبابيس للواجهة عشان الحذف والتعديل يشتغل صح
          advisingNotes,
          profile: {
            name: profile?.name || user.user_metadata?.full_name || user.email || "مستخدم بدون اسم",
            phone: profile?.phone || user.phone || "لا يوجد هاتف",
            department: profile?.department || "لم يكمل الإعدادات",
            semesters: profile?.semesters || []
          }
        };
      })
    );

    return studentsData;
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

export async function saveAdvisingNotes(studentId: string, notes: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabaseAdmin = await getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(studentId);
    const resolvedId = getResolvedId(user?.email, studentId);

    await kv.set(`advising-notes-${resolvedId}`, notes);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}