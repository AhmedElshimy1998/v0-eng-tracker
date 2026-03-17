export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import webpush from "web-push";
import { checkIsAdmin, getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

webpush.setVapidDetails(
  "mailto:admin@studyhub.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(req: Request) {
  const debugLogs: string[] = [];
  try {
    debugLogs.push("1. بدء تشغيل API الإشعارات المطور.");
    
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      debugLogs.push("❌ رفض: المستخدم ليس مديراً.");
      return NextResponse.json({ error: "Unauthorized", logs: debugLogs }, { status: 403 });
    }

    // استلام البيانات والفلاتر الجديدة
    const { title, message, filters } = await req.json();
    debugLogs.push(`2. استلام الفلاتر: القسم[${filters.department}], المستوى[${filters.level}], خريج[${filters.isSenior}], مادة[${filters.courseName}]`);

    const students = await getAllStudents();
    debugLogs.push(`3. تم جلب ${students.length} طالب من قاعدة البيانات.`);

    let targetUserIds: string[] = [];

    // --- منطق الفلترة الذكي بناءً على كودك ---
    students.forEach(student => {
      const profile = student.profile;
      const semesters = profile.semesters || [];
      const allRecords = semesters.flatMap((s: any) => s.courses);
      const effectiveRecords = getEffectiveRecords(allRecords);
      const { gpa, totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);

      // حساب المستوى
      const studentLevel = Math.floor(totalCredits / 32).toString();

      // فحص الشروط واحد تلو الآخر
      let isMatch = true;

      // فلترة القسم
      if (filters.department !== "all" && profile.department !== filters.department) isMatch = false;

      // فلترة المستوى
      if (isMatch && filters.level !== "all" && studentLevel !== filters.level) isMatch = false;

      // فلترة الخريجين
      if (isMatch && filters.isSenior && totalCredits < 130) isMatch = false;

      // فلترة المادة (البحث في اسم المادة أو كودها)
      if (isMatch && filters.courseName) {
        const hasCourse = allRecords.some(c => {
          const courseInfo = coursesCatalog.find(cat => cat.code === c.courseCode);
          return c.courseCode.toLowerCase().includes(filters.courseName.toLowerCase()) || 
                 (courseInfo?.arabicName || "").includes(filters.courseName);
        });
        if (!hasCourse) isMatch = false;
      }

      if (isMatch) targetUserIds.push(student.userId);
    });

    debugLogs.push(`4. عدد الطلاب المطابقين للفلاتر: ${targetUserIds.length}`);

    let notificationsSent = 0;
    const payload = JSON.stringify({
      title: title || "تنبيه من الإدارة",
      body: message,
      url: "/"
    });

    // --- عملية الإرسال المضمونة التي جربتها ---
    for (const userId of targetUserIds) {
      const subscriptions: any[] = (await kv.get(`push-subscriptions-${userId}`)) || [];
      if (subscriptions.length > 0) {
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(sub, payload);
            notificationsSent++;
          } catch (err: any) {
            debugLogs.push(`  ❌ فشل إرسال للمستخدم ${userId}: ${err.message}`);
          }
        }
      }
    }

    debugLogs.push(`5. انتهت العملية بنجاح. إجمالي الإشعارات: ${notificationsSent}`);
    return NextResponse.json({ 
      success: true, 
      sentCount: notificationsSent, 
      targetedUsers: targetUserIds.length, 
      logs: debugLogs 
    });

  } catch (error: any) {
    debugLogs.push(`❌ خطأ عام: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs: debugLogs }, { status: 500 });
  }
}