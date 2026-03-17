export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import webpush from "web-push";
import { checkIsAdmin, getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

// إعداد مفاتيح التشفير للتواصل مع المتصفح
webpush.setVapidDetails(
  "mailto:admin@studyhub.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(req: Request) {
  try {
    console.log("=== بداية إرسال إشعارات الإدارة ===");
    
    // 1. التحقق من الصلاحيات
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      console.log("رفض: المستخدم ليس مديراً");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. استلام البيانات
    const { title, message, audience } = await req.json();
    console.log(`البيانات المستلمة - العنوان: ${title}, الفئة: ${audience}`);

    const students = await getAllStudents();
    let targetUserIds: string[] = [];

    // 3. فلترة الطلاب (نفس الفكرة بتاعتك بس على مستوى الأدمن)
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

    console.log(`تم العثور على عدد (${targetUserIds.length}) مستخدم مطابق للفئة (${audience})`);

    let notificationsSent = 0;
    
    // شكل الـ payload اللي بيستقبله ملف sw.js بتاعك بالظبط
    const payload = JSON.stringify({
      title: title || "تنبيه من الإدارة",
      body: message,
      url: "/"
    });

    // 4. الدوران على كل مستخدم وإرسال الإشعار
    for (const userId of targetUserIds) {
      console.log(`جاري فحص اشتراكات المستخدم: ${userId}`);
      
      // جلب "اشتراكات الإشعارات" الخاصة بهذا المستخدم فقط
      const subscriptions: any[] = (await kv.get(`push-subscriptions-${userId}`)) || [];
      
      if (subscriptions.length > 0) {
        console.log(`تم العثور على ${subscriptions.length} اشتراك للمستخدم ${userId}`);
        
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(sub, payload);
            console.log(`✅ نجاح: تم إرسال الإشعار لجهاز المستخدم ${userId}`);
            notificationsSent++;
          } catch (err) {
            console.error(`❌ فشل: خطأ أثناء الإرسال للمستخدم ${userId}:`, err);
          }
        }
      } else {
        console.log(`لم يتم العثور على اشتراكات (أجهزة مفعلة) للمستخدم ${userId}`);
      }
    }

    console.log(`=== انتهاء: تم إرسال ${notificationsSent} إشعار بنجاح ===`);
    return NextResponse.json({ success: true, sentCount: notificationsSent, targetedUsers: targetUserIds.length });

  } catch (error: any) {
    console.error("خطأ عام في API الإشعارات:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}