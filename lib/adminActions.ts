"use server"

import { kv } from "@vercel/kv"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { AcademicProfile } from "./academicActions"
import { checkIsAdmin } from "./adminActions"


export async function purgeOrphanedData() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("غير مصرح لك");

    // 1. جلب قائمة كل الـ IDs النشطة من Clerk حالياً
    const client = await clerkClient();
    const activeUsers = await client.users.getUserList({ limit: 500 });
    const activeUserIds = new Set(activeUsers.data.map(u => u.id));

    // 2. البحث عن كل المفاتيح التي تبدأ بـ "student_records"
    // ملاحظة: kv.keys ممكن تتطلب إعدادات معينة في Upstash، لو منفعش نستخدم scan
    const allRecordKeys = await kv.keys('student_records:*');
    const allProfileKeys = await kv.keys('academic-profile-*');
    
    const keysToDelete: string[] = [];

    // فحص سجلات الدرجات
    allRecordKeys.forEach(key => {
      const id = key.split(':')[1];
      if (!activeUserIds.has(id)) {
        keysToDelete.push(key);
      }
    });

    // فحص البروفايلات
    allProfileKeys.forEach(key => {
      const id = key.replace('academic-profile-', '');
      if (!activeUserIds.has(id)) {
        keysToDelete.push(key);
        // إضافة باقي المفاتيح المرتبطة بهذا الـ ID المفقود
        keysToDelete.push(`studyhub-cloud-data-${id}`);
        keysToDelete.push(`push-subscriptions-${id}`);
        keysToDelete.push(`advising-notes-${id}`);
        keysToDelete.push(`last_ai_analysis:${id}`);
      }
    });

    if (keysToDelete.length === 0) {
      return { success: true, message: "لا توجد داتا يتيمة، قاعدة البيانات نظيفة تماماً." };
    }

    // 3. التنفيذ الفعلي للحذف الشامل
    await Promise.all(keysToDelete.map(key => kv.del(key)));

    return { 
      success: true, 
      message: `تم بنجاح حذف ${keysToDelete.length} مفتاح داتا يتيمة كانت مسببة لمشاكل.` 
    };

  } catch (error: any) {
    console.error("Purge Error:", error);
    return { success: false, error: error.message };
  }
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
    // 1. فحص صلاحيات الإدمن قبل البدء
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("غير مصرح لك بإجراء هذا التعديل");

    // 2. الحذف من نظام التوثيق Clerk (عشان يقفل حسابه تماماً)
    const client = await clerkClient();
    await client.users.deleteUser(targetUserId);

    // 3. مسح كافة السجلات المرتبطة بالـ ID في Upstash KV
    // تم تجميع كافة المفاتيح التي اكتشفناها لضمان الحذف الكامل
    await Promise.all([
      kv.del(`academic-profile-${targetUserId}`),    // البروفايل والأترام
      kv.del(`student_records:${targetUserId}`),     // سجل الدرجات التاريخي (كان ناقصاً)
      kv.del(`studyhub-cloud-data-${targetUserId}`), // داتا الـ Tracker والمذاكرة
      kv.del(`push-subscriptions-${targetUserId}`),  // اشتراكات الإشعارات
      kv.del(`advising-notes-${targetUserId}`),      // ملاحظات الإرشاد الأكاديمي
      kv.del(`last_ai_analysis:${targetUserId}`)     // توقيت تحليل الـ AI (لتصفير العداد)
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