import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import webpush from "web-push";
import { checkIsAdmin, getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

// نفس إعدادات مفاتيح التشفير بتاعتك بالظبط
webpush.setVapidDetails(
  "mailto:admin@studyhub.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

// هنا استخدمنا POST عشان هنستقبل داتا من صفحة الأدمن (العنوان، الرسالة، الفئة)
export async function POST(req: Request) {
  try {
    // 1. التأكد إن اللي بيبعت الإشعار ده أدمن فعلاً
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // 2. استلام بيانات الإشعار من صفحة الأدمن
    const { title, message, audience } = await req.json();
    const students = await getAllStudents();
    let targetUserIds: string[] = [];

    // 3. فلترة الطلاب بناءً على اختيارك (الكل، المنذرين، الخريجين، المستوى الصفري)
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

    let sentCount = 0;
    const payload = JSON.stringify({ title: title, body: message, url: "/" });

    // 4. الدوران على الفئة المستهدفة وإرسال الإشعار
    for (const uid of targetUserIds) {
      // بنستخدم نفس المفتاح بتاعك اللي الطلبة متسجلين بيه
      const subs: any[] = (await kv.get(`push-subscriptions-${uid}`)) || [];
      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub, payload);
          sentCount++;
        } catch (e) {
          console.error(`Push error for ${uid}:`, e);
        }
      }
    }

    return NextResponse.json({ success: true, sentCount, targetedUsers: targetUserIds.length });
  } catch (error) {
    console.error("Admin Notify Error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}