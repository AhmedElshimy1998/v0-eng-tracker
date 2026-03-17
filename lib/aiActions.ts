"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAcademicProfile } from "./academicActions"; // المصدر الأساسي
import { coursesCatalog } from "./courses";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getSmartAnalysis() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. سحب البروفايل كامل (اللي فيه السيمسترات والمواد)
    const profile = await getAcademicProfile();
    if (!profile || !profile.semesters) return null;

    // 2. تجميع كل المواد من كل الأترام في مصفوفة واحدة "فلات"
    const allRecords = profile.semesters.flatMap(sem => sem.courses);

    // 3. تطبيق منطق النجاح والرسوب (نفس منطق الصفحة عندك)
    const normalize = (g: any) => g?.toString().trim();
    
    const passedCodes = new Set(
      allRecords.filter(r => !['F', 'Fail', 'Taken', '-'].includes(normalize(r.grade))).map(r => r.courseCode)
    );

    const currentlyTaking = allRecords.filter(r => normalize(r.grade) === 'Taken');

    // 4. تحليل حالة الكتالوج بالكامل
    const analyzedCatalog = coursesCatalog.map(course => {
      const record = allRecords.find(r => r.courseCode === course.code);
      const isPassed = passedCodes.has(course.code);
      const canTake = course.prerequisites.every(p => passedCodes.has(p));

      return {
        code: course.code,
        name: course.arabicName,
        status: isPassed ? 'passed' : (normalize(record?.grade) === 'Taken' ? 'taking' : (canTake ? 'open' : 'locked')),
        grade: record?.grade || null
      };
    });

    // 5. الـ Prompt دلوقتي بقى مبني على "واقع" الداتا بيز
    const prompt = `
      أنت المرشد الأكاديمي للطالب ${profile.name} في قسم ${profile.department}.
      
      بناءً على بياناته الحقيقية:
      - مواد نجح فيها: ${JSON.stringify(analyzedCatalog.filter(c => c.status === 'passed'))}
      - مواد يدرسها الآن (Taken): ${JSON.stringify(analyzedCatalog.filter(c => c.status === 'taking'))}
      - مواد "عنق زجاجة" مفتوحة له: ${JSON.stringify(analyzedCatalog.filter(c => c.status === 'open'))}
      
      المطلوب (رد JSON فقط):
      1. احسب نسبة الإنجاز بناءً على الساعات المعتمدة للمواد الناجحة.
      2. حلل أداء الطالب (مثلاً: "لديك تميز في الفيزياء و الميكانيكا لكن الرياضيات D تحتاج تركيز").
      3. BattlePlan: اقترح 5 مواد للترم القادم تضمن فك أكبر قدر من المواد المغلقة (Locked).
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().replace(/```json|```/g, ""));

  } catch (error) {
    console.error("AI Sync Error:", error);
    return null;
  }
}