"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStudentRecords, getAcademicProfile } from "./academicActions";
import { getAdvisingNotes } from "./adminActions"; 
import { coursesCatalog } from "./courses";
import { auth } from "@clerk/nextjs/server";

// تهيئة محرك الذكاء الاصطناعي
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getSmartAnalysis() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. جلب كافة البيانات من مصادرها المختلفة في الداتا بيز
    const [records, profile, advisorNotes] = await Promise.all([
      getStudentRecords(), // سجل درجاتك الحالية
      getAcademicProfile(), // بروفايلك الأكاديمي وقسمك
      getAdvisingNotes(userId) // ملاحظات المرشد الأكاديمي (الإدمن)
    ]);

    // 2. معالجة منطق المواد (مكتملة، مفتوحة، مغلقة) بناءً على المتطلبات
    const completedCodes = new Set(
      records.filter(r => r.grade !== 'F' && r.grade !== '-').map(r => r.courseCode)
    );

    const processedCatalog = coursesCatalog.map(course => {
      const isCompleted = completedCodes.has(course.code);
      // المادة تفتح فقط إذا اكتملت كافة متطلباتها السابقة
      const canOpen = course.prerequisites.every(p => completedCodes.has(p));
      
      return {
        code: course.code,
        name: course.arabicName,
        status: isCompleted ? 'completed' : (canOpen ? 'open' : 'locked'),
        prerequisites: course.prerequisites,
        credits: course.credits,
        currentGrade: records.find(r => r.courseCode === course.code)?.grade || null
      };
    });

    // 3. تجهيز سياق البيانات لـ AI
    const studentContext = {
      name: profile?.name || "طالب هندسة",
      department: profile?.department || "عام",
      targetPlan: profile?.semesters || [], // الخطة المثالية التي رتبتها بنفسك
      stats: {
        completed: processedCatalog.filter(c => c.status === 'completed'),
        available: processedCatalog.filter(c => c.status === 'open'),
        locked: processedCatalog.filter(c => c.status === 'locked')
      },
      advisorRemarks: advisorNotes // الملاحظات التي كتبها لك الإدمن
    };

    // 4. صياغة الـ Prompt الهندسي
    const prompt = `
      بصفتك المرشد الأكاديمي الذكي لمنصة هندسية، حلل بروفايل الطالب ${studentContext.name}:
      
      المعطيات:
      - القسم التخصصي: ${studentContext.department}
      - إنجاز الطالب: تم اجتياز ${studentContext.stats.completed.length} مادة من أصل ${coursesCatalog.length}.
      - المواد المتاحة للتسجيل فوراً: ${JSON.stringify(studentContext.stats.available)}
      - المواد المغلقة حالياً: ${JSON.stringify(studentContext.stats.locked)}
      - الخطة التي يطمح لها الطالب: ${JSON.stringify(studentContext.targetPlan)}
      - ملاحظات المرشد البشري: ${studentContext.advisorRemarks}

      المطلوب (رد بصيغة JSON فقط):
      1. احسب "نسبة الإنجاز" (completionRate) بناءً على الساعات المعتمدة.
      2. حدد "عنق الزجاجة" (bottleneckCourse): مادة مفتوحة حالياً لو تأخرت ستغلق خلفها مسارات كثيرة.
      3.AcademicAnalysis: تحليل لنقاط القوة (مثل التميز في مواد البرمجة أو الميكانيكا).
      4.BattlePlan: اقتراح لـ 5 مواد للترم القادم توازن بين الصعوبة وبين "الخطة المثالية" للطالب.
      5.CareerAdvice: نصيحة مهنية تربط بين مستواه الحالي وبين التطور في سوق العمل الهندسي.

      الرد بصيغة JSON:
      {
        "completionRate": 0-100,
        "bottleneckCourse": "اسم المادة",
        "academicAnalysis": "نص تحليلي",
        "battlePlan": [{ "code": "كود", "name": "اسم", "reason": "لماذا؟" }],
        "careerAdvice": "نصيحة مهنية"
      }
    `;

    // 5. استدعاء Gemini (استخدام النسخة المستقرة لعام 2026)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // استخراج الـ JSON بدقة لتجنب أخطاء الـ Parsing
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}') + 1;
    return JSON.parse(responseText.substring(start, end));

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      completionRate: 0,
      bottleneckCourse: "غير متوفر",
      academicAnalysis: "حدث خطأ أثناء الاتصال بالمرشد الذكي، يرجى المحاولة لاحقاً.",
      battlePlan: [],
      careerAdvice: "تأكد من إكمال سجلاتك الدراسية ليتمكن النظام من تحليلها."
    };
  }
}