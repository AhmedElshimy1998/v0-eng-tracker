export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import webpush from "web-push";
import { checkIsAdmin } from "@/lib/adminActions";

webpush.setVapidDetails(
  "mailto:admin@studyhub.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(req: Request) {
  const debugLogs: string[] = [];
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { title, message, audience } = await req.json();
    debugLogs.push(`1. استلام طلب إرسال لـ: ${audience}`);

    // --- الطريقة المضمونة: البحث عن الاشتراكات مباشرة مثل الكود الشغال عندك ---
    const subscriptionKeys = await kv.keys("push-subscriptions-*");
    debugLogs.push(`2. تم العثور على ${subscriptionKeys.length} مفتاح اشتراك في الداتا بيز.`);

    let sentCount = 0;
    const payload = JSON.stringify({
      title: title || "تنبيه Engineering Tracker",
      body: message,
      url: "/"
    });

    for (const key of subscriptionKeys) {
      const userId = key.replace("push-subscriptions-", "");
      
      // هنا ممكن نضيف فلترة الـ audience لو حبيت، بس خلينا نجرب نبعت لـ "الكل" الأول عشان نتأكد
      // لو audience === "all" هنبعت للكل فعلاً
      
      const subscriptions: any[] = (await kv.get(key)) || [];
      
      if (subscriptions.length > 0) {
        debugLogs.push(`- جاري الإرسال للمستخدم ${userId} (${subscriptions.length} جهاز)`);
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(sub, payload);
            sentCount++;
          } catch (err: any) {
            debugLogs.push(`  ❌ فشل لجهاز ${userId}: ${err.message}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true, sentCount, logs: debugLogs });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, logs: [error.message] }, { status: 500 });
  }
}