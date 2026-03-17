"use server"

import { kv } from "@vercel/kv"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { AcademicProfile } from "./academicActions"

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

    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 500 });

    const studentsData = await Promise.all(
      clerkUsers.data.map(async (user) => {
        const profile = await kv.get<AcademicProfile>(`academic-profile-${user.id}`);
        // جلب النوتس المحفوظة من الداتا بيز
        const advisingNotes = await kv.get<string>(`advising-notes-${user.id}`) || ""; 
        
        const fallbackName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || "مستخدم بدون اسم";
        const fallbackPhone = user.phoneNumbers[0]?.phoneNumber || "لا يوجد هاتف";

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

// 5. الحذف النهائي للمستخدم (من Clerk ومن Upstash)
export async function deleteUserAccount(targetUserId: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("غير مصرح لك بإجراء هذا التعديل");

    // 1. الحذف من نظام التوثيق Clerk
    const client = await clerkClient();
    await client.users.deleteUser(targetUserId);

    // 2. مسح كل الداتا بتاعته من قاعدة بيانات Upstash
    await kv.del(`academic-profile-${targetUserId}`);
    await kv.del(`studyhub-cloud-data-${targetUserId}`); // داتا المذاكرة
    await kv.del(`push-subscriptions-${targetUserId}`);  // داتا الإشعارات
    await kv.del(`advising-notes-${targetUserId}`); // مسح النوتس كمان

    // 3. لو كان أدمن، نمسحه من مصفوفة الأدمنز
    let admins = await kv.get<string[]>('site-admins') || [];
    if (admins.includes(targetUserId)) {
      admins = admins.filter(id => id !== targetUserId);
      await kv.set('site-admins', admins);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
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