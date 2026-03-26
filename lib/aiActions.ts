"use server"


import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAcademicProfile } from "./academicActions"; // المصدر الوحيد للداتا
import { coursesCatalog } from "./courses";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv"; // الإضافة الجديدة للتحكم في الوقت

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getSmartAnalysis() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    // --- منطق قيد الـ 24 ساعة ---
    const cooldownKey = `last_ai_analysis:${userId}`;
    const lastAnalysis = await kv.get<number>(cooldownKey);
    const now = Date.now();
    const cooldownTime = 24 * 60 * 60 * 1000; // 24 ساعة بالمللي ثانية

    if (lastAnalysis && (now - lastAnalysis < cooldownTime)) {
      const remainingTime = cooldownTime - (now - lastAnalysis);
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

      return {
        isLimitReached: true,
        message: `المستشار في استراحة حالياً! يمكنك طلب تحليل جديد بعد ${hours} ساعة و ${minutes} دقيقة.`,
        remainingTime
      };
    }
    // ----------------------------

    // 1. جلب البروفايل اللي فيه كل الأترام والمواد
    const profile = await getAcademicProfile();
    
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

    // 3. تحديد المواد الناجحة
    const isPassed = (grade: string) => {
      const g = grade?.trim();
      return g && !['F', 'Fail', 'Taken', '-'].includes(g);
    };

    // 4. تصنيف المواد بناءً على الكتالوج وحالة الطالب
    const analyzedCatalog = coursesCatalog.map(course => {
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
        "careerRoadmap": ""
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}') + 1;
    const finalData = JSON.parse(responseText.substring(start, end));

    // --- تحديث الطابع الزمني بعد نجاح التحليل فقط ---
    await kv.set(cooldownKey, now);

    return finalData;

  } catch (error) {
    console.error("AI Sync Error:", error);
    return null;
  }
}