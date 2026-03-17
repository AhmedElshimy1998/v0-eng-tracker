"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAcademicProfile } from "./academicActions"; // المصدر الوحيد للداتا
import { coursesCatalog } from "./courses";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getSmartAnalysis() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. جلب البروفايل اللي فيه كل الأترام والمواد
    const profile = await getAcademicProfile();
    
    // لو البروفايل فاضي أو مفيش أترام، نرجع بيانات افتراضية بدل Null عشان الـ UI ما يضربش
    if (!profile || !profile.semesters || profile.semesters.length === 0) {
      return {
        completionRate: 0,
        academicAnalysis: "ابدأ بإضافة فصول دراسية وتجربة تسجيل المواد في صفحة التتبع الأكاديمي أولاً.",
        battlePlan: [],
        careerRoadmap: "بمجرد إضافة موادك، سأقوم بتحليل مسارك المهني هنا."
      };
    }

    // 2. تجميع كل المحاولات من كل الأترام (Flattening)
    const allStudentRecords = profile.semesters.flatMap(sem => sem.courses);

    // 3. تحديد المواد الناجحة (نفس منطق الكود بتاعك بالظبط)
    const isPassed = (grade: string) => {
      const g = grade?.trim();
      return g && !['F', 'Fail', 'Taken', '-'].includes(g);
    };

    // 4. تصنيف المواد بناءً على الكتالوج وحالة الطالب
    const analyzedCatalog = coursesCatalog.map(course => {
      // بنجيب آخر محاولة للمادة دي
      const attempts = allStudentRecords.filter(r => r.courseCode === course.code);
      const lastAttempt = attempts[attempts.length - 1];
      
      const passed = attempts.some(r => isPassed(r.grade));
      const taking = lastAttempt?.grade === 'Taken';
      const canOpen = course.prerequisites.every(p => 
        allStudentRecords.some(r => r.courseCode === p && isPassed(r.grade))
      );

      return {
        code: course.code,
        name: course.arabicName,
        status: passed ? 'passed' : (taking ? 'taking' : (canOpen ? 'open' : 'locked')),
        grade: lastAttempt?.grade || null,
        credits: course.credits
      };
    });

    // 5. حساب النسبة المئوية للساعات المنجزة
    const totalCredits = coursesCatalog.reduce((sum, c) => sum + c.credits, 0);
    const completedCredits = analyzedCatalog
      .filter(c => c.status === 'passed')
      .reduce((sum, c) => sum + c.credits, 0);
    
    const completionRate = Math.round((completedCredits / totalCredits) * 100);

    // 6. الـ Prompt "المرشد الحريف"
    const prompt = `
      أنت المرشد الأكاديمي لـ ${profile.name} في قسم ${profile.department}.
      
      بناءً على سجلاته الحقيقية:
      - مواد نجح فيها: ${JSON.stringify(analyzedCatalog.filter(c => c.status === 'passed'))}
      - مواد يدرسها الآن: ${JSON.stringify(analyzedCatalog.filter(c => c.status === 'taking'))}
      - مواد مفتوحة (Open): ${JSON.stringify(analyzedCatalog.filter(c => c.status === 'open'))}
      - مواد مغلقة (Locked): ${JSON.stringify(analyzedCatalog.filter(c => c.status === 'locked'))}

      المطلوب (رد JSON فقط):
      {
        "completionRate": ${completionRate},
        "academicAnalysis": "تحليل للأداء الأكاديمي والدرجات (مثل الـ D في الرياضيات والـ Fail في الرسم)",
        "bottleneckCourse": "أهم مادة مفتوحة حالياً يجب تسجيلها لفتح مواد مغلقة",
        "battlePlan": [
          { "code": "كود", "name": "اسم المادة", "priority": "High/Medium", "reason": "لماذا؟" }
        ],
        "careerRoadmap": "نصيحة مهنية تربط دراسته بعمله كفني هندسي في AstraZeneca"
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}') + 1;
    return JSON.parse(responseText.substring(start, end));

  } catch (error) {
    console.error("AI Sync Error:", error);
    return null;
  }
}