"use server"

import { kv } from "@vercel/kv"
import { auth } from "@/lib/auth-server" // تأكد من المسار
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AcademicProfile } from "./academicActions"

// دالة مساعدة لإنشاء عميل Supabase بصلاحيات الإدمن (Service Role)
// ⚠️ ملاحظة مهمة: هتحتاج تضيف المفتاح ده في ملف .env.local
const getSupabaseAdmin = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // مفتاح الإدمن السري
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
}

// 1. فحص هل المستخدم الحالي أدمن؟
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    let admins = await kv.get<string[]>('site-admins');
    
    // لو مفيش أي أدمن في الموقع خالص، أول واحد يدخل هيبقى هو الأدمن الرئيسي (عشانك إنت)
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

// 2. جلب كل الطلاب المسجلين (متضمنة النوتس من الداتا بيز)
export async function getAllStudents() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabaseAdmin = await getSupabaseAdmin();
    
    // جلب قائمة المستخدمين من Supabase (يعادل clerkClient.users.getUserList)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 500
    });

    if (error) throw error;

    const studentsData = await Promise.all(
      users.map(async (user) => {
        const profile = await kv.get<AcademicProfile>(`academic-profile-${user.id}`);
        // جلب النوتس المحفوظة من الداتا بيز
        const advisingNotes = await kv.get<string>(`advising-notes-${user.id}`) || ""; 
        
        // محاولة استخراج الاسم من البيانات الوصفية أو استخدام الإيميل
        const fallbackName = user.user_metadata?.full_name || user.email || "مستخدم بدون اسم";
        const fallbackPhone = user.phone || "لا يوجد هاتف";

        return {
          userId: user.id,
          advisingNotes, // إرسال النوتس للشاشة
          profile: {
            name: profile?.name || fallbackName,
            phone: profile?.phone || fallbackPhone,
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

// 3. إدارة الأدمنز (إضافة/إزالة)
export async function toggleAdminStatus(targetUserId: string, makeAdmin: boolean) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    let admins = await kv.get<string[]>('site-admins') || [];
    
    if (makeAdmin && !admins.includes(targetUserId)) {
      admins.push(targetUserId);
    } else if (!makeAdmin) {
      admins = admins.filter(id => id !== targetUserId);
    }

    await kv.set('site-admins', admins);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 4. جلب قائمة الـ IDs الخاصة بالمديرين
export async function getSiteAdmins(): Promise<string[]> {
  try {
    return await kv.get<string[]>('site-admins') || [];
  } catch (error) {
    return [];
  }
}

// 5. الحذف النهائي للمستخدم (من Supabase ومن Upstash)
export async function deleteUserAccount(targetUserId: string) {
  try {
    // 1. فحص صلاحيات الإدمن قبل البدء
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("غير مصرح لك بإجراء هذا التعديل");

    // 2. الحذف من نظام التوثيق Supabase (عشان يقفل حسابه تماماً)
    const supabaseAdmin = await getSupabaseAdmin();
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    
    if (deleteError) throw deleteError;

    // 3. مسح كافة السجلات المرتبطة بالـ ID في Upstash KV
    await Promise.all([
      kv.del(`academic-profile-${targetUserId}`),
      kv.del(`student_records:${targetUserId}`),
      kv.del(`studyhub-cloud-data-${targetUserId}`),
      kv.del(`push-subscriptions-${targetUserId}`),
      kv.del(`advising-notes-${targetUserId}`),
      kv.del(`last_ai_analysis:${targetUserId}`)
    ]);

    // 4. إذا كان المستخدم مديراً، يتم حذفه من قائمة الـ Admins
    let admins = await kv.get<string[]>('site-admins') || [];
    if (admins.includes(targetUserId)) {
      admins = admins.filter(id => id !== targetUserId);
      await kv.set('site-admins', admins);
    }

    console.log(`[Success] User ${targetUserId} and all associated data have been deleted.`);
    return { success: true };

  } catch (error: any) {
    console.error("Error during full user deletion:", error);
    return { 
      success: false, 
      error: error.message || "حدث خطأ غير متوقع أثناء عملية الحذف الشامل." 
    };
  }
}

// 6. جلب ملاحظات المرشد الأكاديمي لطالب معين
export async function getAdvisingNotes(studentId: string): Promise<string> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return "";
    return await kv.get<string>(`advising-notes-${studentId}`) || "";
  } catch (error) {
    return "";
  }
}

// 7. حفظ ملاحظات المرشد الأكاديمي
export async function saveAdvisingNotes(studentId: string, notes: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");
    await kv.set(`advising-notes-${studentId}`, notes);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}