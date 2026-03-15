export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import webpush from "web-push";

// إعداد مفاتيح التشفير للتواصل مع المتصفح
webpush.setVapidDetails(
  "mailto:admin@studyhub.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function GET(request: Request) {
  try {
    // 1. البحث عن كل مفاتيح المستخدمين المسجلين في قاعدة البيانات
    const userKeys = await kv.keys("studyhub-cloud-data-*");

    if (!userKeys || userKeys.length === 0) {
      return NextResponse.json({ message: "No users data found" });
    }

    // 2. ضبط الوقت على توقيت مصر
    const egyptTimeOptions = { timeZone: "Africa/Cairo" };
    const nowString = new Date().toLocaleString("en-US", egyptTimeOptions);
    const now = new Date(nowString);
    const currentDay = now.getDay();

    let notificationsSent = 0;

    // 3. الدوران على كل مستخدم لفحص مواده
    for (const key of userKeys) {
      // استخراج كود المستخدم (userId) من اسم المفتاح
      const userId = key.replace("studyhub-cloud-data-", "");
      
      // جلب مواد هذا المستخدم تحديداً
      const subjects: any[] = (await kv.get(key)) || [];
      if (subjects.length === 0) continue;

      // فحص المحاضرات
      for (const subject of subjects) {
        for (const schedule of subject.schedules || []) {
          if (schedule.dayOfWeek === currentDay) {
            const [classHours, classMinutes] = schedule.time.split(":").map(Number);
            
            const classTime = new Date(now);
            classTime.setHours(classHours, classMinutes, 0, 0);

            const diffInMinutes = Math.round((classTime.getTime() - now.getTime()) / 60000);

            // إذا كان متبقي 30 أو 15 دقيقة
            if (diffInMinutes === 30 || diffInMinutes === 15) {
              
              // جلب "اشتراكات الإشعارات" الخاصة بهذا المستخدم فقط
              const subscriptions: any[] = (await kv.get(`push-subscriptions-${userId}`)) || [];
              
              if (subscriptions.length > 0) {
                const payload = JSON.stringify({
                  title: `تنبيه: ${subject.title}`,
                  body: `المحاضرة ستبدأ خلال ${diffInMinutes} دقيقة! ${schedule.location ? '\nالمكان: ' + schedule.location : ''}`,
                  url: "/"
                });

                // إرسال الإشعار لكل أجهزة هذا المستخدم (موبايل، لابتوب، الخ)
                for (const sub of subscriptions) {
                  try {
                    await webpush.sendNotification(sub, payload);
                    notificationsSent++;
                  } catch (err) {
                    console.error(`Failed to send to user ${userId}:`, err);
                  }
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, sent: notificationsSent });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}