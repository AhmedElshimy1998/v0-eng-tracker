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
    // 1. أمر واحد لجلب كل المفاتيح
    // 1. أمر واحد لجلب كل المفاتيح (مُحسن باستخدام scan)
    let cursor = 0;
    const userKeys: string[] = [];
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: "studyhub-cloud-data-*", count: 1000 });
      userKeys.push(...keys);
      cursor = nextCursor;
    } while (cursor !== 0);

    if (!userKeys || userKeys.length === 0) {
      return NextResponse.json({ message: "No users data found" });
    }

    // 2. 🚀 جلب كل مواد الطلاب في (أمر واحد فقط)
    const allUsersSubjects = await kv.mget(...userKeys);

    const egyptTimeOptions = { timeZone: "Africa/Cairo" };
    const nowString = new Date().toLocaleString("en-US", egyptTimeOptions);
    const now = new Date(nowString);
    const currentDay = now.getDay();

    let notificationsSent = 0;
    const pendingNotifications: { userId: string, title: string, body: string, url: string }[] = [];

    // 3. الفحص المحلي السريع (صفر أوامر للداتا بيز)
    for (let i = 0; i < userKeys.length; i++) {
      const key = userKeys[i];
      const userId = key.replace("studyhub-cloud-data-", "");
      
      const subjects: any[] = allUsersSubjects[i] || [];
      if (subjects.length === 0) continue;

      for (const subject of subjects) {
        for (const schedule of subject.schedules || []) {
          if (schedule.dayOfWeek === currentDay && schedule.time) {
            const [classHours, classMinutes] = schedule.time.split(":").map(Number);
            
            const classTime = new Date(now);
            classTime.setHours(classHours, classMinutes, 0, 0);

            const diffInMinutes = Math.round((classTime.getTime() - now.getTime()) / 60000);

            if (diffInMinutes === 30 || diffInMinutes === 15) {
              pendingNotifications.push({
                userId,
                title: `تنبيه: ${subject.title}`,
                body: `المحاضرة ستبدأ خلال ${diffInMinutes} دقيقة! ${schedule.location ? '\nالمكان: ' + schedule.location : ''}`,
                url: "/"
              });
            }
          }
        }
      }
    }

    if (pendingNotifications.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No upcoming classes right now" });
    }

    // 4. 🚀 جلب اشتراكات الناس اللي هيبعتلهم بس في (أمر واحد فقط)
    const uniqueUserIds = [...new Set(pendingNotifications.map(n => n.userId))];
    const subKeys = uniqueUserIds.map(id => `push-subscriptions-${id}`);
    const allSubscriptions = await kv.mget(...subKeys);

    const subMap = new Map();
    for (let i = 0; i < uniqueUserIds.length; i++) {
      subMap.set(uniqueUserIds[i], allSubscriptions[i] || []);
    }

    // 5. إرسال الإشعارات
    for (const notif of pendingNotifications) {
      const userSubs = subMap.get(notif.userId);
      if (userSubs && userSubs.length > 0) {
        const payload = JSON.stringify({
          title: notif.title,
          body: notif.body,
          url: notif.url
        });

        for (const sub of userSubs) {
          try {
            await webpush.sendNotification(sub, payload);
            notificationsSent++;
          } catch (err) {
            console.error(`Failed to send to user ${notif.userId}:`, err);
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