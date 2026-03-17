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
    debugLogs.push("1. بدء تشغيل API الإشعارات.");
    
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      debugLogs.push("❌ رفض: المستخدم ليس مديراً.");
      return NextResponse.json({ error: "Unauthorized", logs: debugLogs }, { status: 403 });
    }
    debugLogs.push("2. تم التحقق من صلاحيات المدير بنجاح.");

    const { title, message, audience } = await req.json();
    debugLogs.push(`3. استلام البيانات: الفئة [${audience}].`);

    const students = await getAllStudents();
    debugLogs.push(`4. تم جلب ${students.length} طالب من قاعدة البيانات.`);

    let targetUserIds: string[] = [];

    if (audience === "all") {
      targetUserIds = students.map(s => s.userId);
    } else {
      students.forEach(student => {
        const semesters = student.profile.semesters || [];
        const allRecords = semesters.flatMap((s: any) => s.courses);
        const effectiveRecords = getEffectiveRecords(allRecords);
        const { gpa, totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);

        if (audience === "risk" && gpa < 2.0 && totalCredits > 0) targetUserIds.push(student.userId);
        if (audience === "seniors" && totalCredits >= 130) targetUserIds.push(student.userId);
        if (audience === "level_0" && totalCredits < 32) targetUserIds.push(student.userId);
      });
    }

    debugLogs.push(`5. عدد الطلاب المطابقين للفئة: ${targetUserIds.length}`);

    let notificationsSent = 0;
    const payload = JSON.stringify({
      title: title || "تنبيه من الإدارة",
      body: message,
      url: "/"
    });

    for (const userId of targetUserIds) {
      const subscriptions: any[] = (await kv.get(`push-subscriptions-${userId}`)) || [];
      if (subscriptions.length > 0) {
        debugLogs.push(`- المستخدم ${userId}: تم العثور على ${subscriptions.length} جهاز/اشتراك.`);
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(sub, payload);
            notificationsSent++;
            debugLogs.push(`  ✔️ نجاح إرسال لجهاز تبع ${userId}`);
          } catch (err: any) {
            debugLogs.push(`  ❌ فشل إرسال لجهاز تبع ${userId} السبب: ${err.message}`);
          }
        }
      } else {
        debugLogs.push(`- المستخدم ${userId}: ليس لديه أي اشتراك إشعارات.`);
      }
    }

    debugLogs.push(`6. انتهت العملية. إجمالي الأجهزة المستلمة: ${notificationsSent}`);
    return NextResponse.json({ success: true, sentCount: notificationsSent, targetedUsers: targetUserIds.length, logs: debugLogs });

  } catch (error: any) {
    debugLogs.push(`❌ خطأ عام: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs: debugLogs }, { status: 500 });
  }
}