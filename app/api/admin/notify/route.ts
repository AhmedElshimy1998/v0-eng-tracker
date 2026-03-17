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
    debugLogs.push("--- بدء معالجة الإرسال الفلتر ---");
    
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { title, message, filters } = await req.json();

    const students = await getAllStudents();
    debugLogs.push(`تم جلب ${students.length} طالب للفحص.`);

    let targetUserIds: string[] = [];

    students.forEach(student => {
      const profile = student.profile;
      const semesters = profile.semesters || [];
      const allRecords = semesters.flatMap((s: any) => s.courses);
      const effectiveRecords = getEffectiveRecords(allRecords);
      const { totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);

      const studentLevel = Math.floor(totalCredits / 32).toString();
      let isMatch = true;

      // 1. فلترة القسم (بناءً على الـ ID الحقيقي)
      if (filters.department !== "all" && profile.department !== filters.department) isMatch = false;

      // 2. فلترة المستوى
      if (isMatch && filters.level !== "all" && studentLevel !== filters.level) isMatch = false;

      // 3. فلترة الخريجين
      if (isMatch && filters.isSenior && totalCredits < 130) isMatch = false;

      // 4. فلترة المادة (فحص دقيق)
      if (isMatch && filters.courseName) {
        const searchStr = filters.courseName.toLowerCase();
        const hasCourse = allRecords.some(c => {
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

    for (const userId of targetUserIds) {
      const subs: any[] = (await kv.get(`push-subscriptions-${userId}`)) || [];
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

    return NextResponse.json({ 
      success: true, 
      sentCount: notificationsSent, 
      targetedUsers: targetUserIds.length, // التأكد من إرجاع هذا الاسم للـ Alert
      logs: debugLogs 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, logs: [error.message] }, { status: 500 });
  }
}