export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import webpush from "web-push";
import { checkIsAdmin, getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/academic-logic";
import { coursesCatalog } from "@/lib/courses";

webpush.setVapidDetails(
  "mailto:admin@studyhub.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(req: Request) {
  const debugLogs: string[] = [];
  try {
    debugLogs.push("--- بدء معالجة الإرسال الفلتر ---");
    
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { title, message, filters } = await req.json();

    // ⚠️ ملاحظة هامة: تأكد إن دالة getAllStudents في ملف adminActions متعدلة لـ mget زي ما اتفقنا قبل كده
    const students = await getAllStudents();
    debugLogs.push(`تم جلب ${students.length} طالب للفحص.`);

    let targetUserIds: string[] = [];

    // الفلترة السريعة محلياً
    students.forEach(student => {
      const profile = student.profile;
      const semesters = profile.semesters || [];
      const allRecords = semesters.flatMap((s: any) => s.courses);
      const effectiveRecords = getEffectiveRecords(allRecords);
      const { gpa: cgpa, totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);

      let isMatch = true;

      // 1. فلتر المعدل
      if (filters.gpaStatus === "atRisk" && cgpa >= 2.0) isMatch = false;
      if (filters.gpaStatus === "safe" && cgpa < 2.0) isMatch = false;

      // 2. فلتر المستوى
      if (filters.level !== "all") {
        const levelNum = Math.floor(totalCredits / 32);
        const levelName = ["المستوى الصفري", "المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع"][Math.min(levelNum, 4)];
        if (filters.level !== levelName) isMatch = false;
      }

      // 3. فلتر البحث
      if (filters.search && filters.search.trim() !== "") {
        const searchStr = filters.search.toLowerCase();
        const hasCourse = allRecords.some((c: any) => {
          const courseInfo = coursesCatalog.find(cat => cat.code === c.courseCode);
          return c.courseCode.toLowerCase().includes(searchStr) || 
                 (courseInfo?.arabicName || "").includes(searchStr);
        });
        if (!hasCourse) isMatch = false;
      }

      if (isMatch) targetUserIds.push(student.userId);
    });

    debugLogs.push(`الطلاب المطابقين للشروط: ${targetUserIds.length}`);

    let notificationsSent = 0;
    const payload = JSON.stringify({
      title: title || "تنبيه من الإدارة",
      body: message,
      url: "/"
    });

    // 🚀 التعديل السحري: جلب كل اشتراكات الطلاب المستهدفين في (أمر واحد فقط) بدل Loop!
    if (targetUserIds.length > 0) {
      const subscriptionKeys = targetUserIds.map(id => `push-subscriptions-${id}`);
      const allSubscriptions = await kv.mget(...subscriptionKeys);

      for (let i = 0; i < targetUserIds.length; i++) {
        const userId = targetUserIds[i];
        const subs: any[] = allSubscriptions[i] || [];

        if (subs.length > 0) {
          for (const sub of subs) {
            try {
              await webpush.sendNotification(sub, payload);
              notificationsSent++;
            } catch (err: any) {
              debugLogs.push(`فشل الإرسال لـ ${userId}: ${err.message}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: notificationsSent, 
      logs: debugLogs 
    });

  } catch (error: any) {
    debugLogs.push(`حدث خطأ غير متوقع: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs: debugLogs }, { status: 500 });
  }
}