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
    // 1. جلب البيانات والاشتراكات من السحابة
    const subjects: any[] = (await kv.get("studyhub-cloud-data")) || [];
    const subscriptions: any[] = (await kv.get("push-subscriptions")) || [];

    if (subscriptions.length === 0 || subjects.length === 0) {
      return NextResponse.json({ message: "No data or subscriptions found" });
    }

    // 2. ضبط الوقت على توقيت مصر لتجنب اختلاف توقيت سيرفرات Vercel
    const egyptTimeOptions = { timeZone: "Africa/Cairo" };
    const nowString = new Date().toLocaleString("en-US", egyptTimeOptions);
    const now = new Date(nowString);
    
    const currentDay = now.getDay();
    let notificationsSent = 0;

    // 3. فحص جميع المواد والمحاضرات
    for (const subject of subjects) {
      for (const schedule of subject.schedules || []) {
        if (schedule.dayOfWeek === currentDay) {
          const [classHours, classMinutes] = schedule.time.split(":").map(Number);
          
          const classTime = new Date(now);
          classTime.setHours(classHours, classMinutes, 0, 0);

          // حساب الفرق بالدقائق
          const diffInMinutes = Math.round((classTime.getTime() - now.getTime()) / 60000);

          // إذا كان متبقي 30 أو 15 دقيقة (أو في نطاق دقيقة بسبب أي تأخير طفيف)
          if (diffInMinutes === 30 || diffInMinutes === 15) {
            const payload = JSON.stringify({
              title: `تنبيه: ${subject.title}`,
              body: `المحاضرة ستبدأ خلال ${diffInMinutes} دقيقة! ${schedule.location ? '\\nالمكان: ' + schedule.location : ''}`,
              url: "/"
            });

            // إرسال الإشعار لكل الأجهزة المسجلة
            for (const sub of subscriptions) {
              try {
                await webpush.sendNotification(sub, payload);
                notificationsSent++;
              } catch (err) {
                console.error("Failed to send to a subscription", err);
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