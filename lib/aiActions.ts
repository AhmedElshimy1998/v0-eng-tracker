"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStudentRecords } from "./academicActions";
import { coursesCatalog } from "./courses";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getSmartAnalysis() {
  try {
    const records = await getStudentRecords();
    
    // 1. تحضير سياق البيانات لـ Gemini
    const studentData = {
      name: "أحمد عادل الشيمي",
      university: "Tanta University - Mechatronics Engineering",
      job: "Engineering Technician at AstraZeneca",
      interests: ["PLC", "Embedded Systems", "Automation"],
      passedCourses: records.map(r => {
        const course = coursesCatalog.find(c => c.code === r.courseCode);
        return { name: course?.arabicName, grade: r.grade, code: r.courseCode };
      }),
      remainingCourses: coursesCatalog
        .filter(c => !records.some(r => r.courseCode === c.code))
        .map(c => ({ name: c.arabicName, code: c.code, prereqs: c.prerequisites }))
    };

    // 2. تصميم الـ Prompt الاحترافي
    const prompt = `
      أنت مستشار أكاديمي خبير لطلاب الهندسة. حلل بيانات الطالب التالي:
      ${JSON.stringify(studentData)}

      المطلوب منك هو إرجاع رد بصيغة JSON فقط كالتالي:
      {
        "careerInsight": "نصيحة مهنية قصيرة تربط دراسته بعمله في AstraZeneca"،
        "skillsRadar": { "math": 0-100, "programming": 0-100, "mechanics": 0-100, "electronics": 0-100 },
        "battlePlan": [
          { "course": "اسم المادة", "code": "الكود", "priority": "High/Medium", "advice": "لماذا هذه المادة؟" }
        ]
      }
      اجعل النصيحة باللغة العربية، بأسلوب مهني ومشجع.
    `;

    // 3. استدعاء Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // تنظيف الرد من أي علامات Markdown إذا وجدت
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    // رد افتراضي في حالة الخطأ لضمان عدم توقف الصفحة
    return {
      careerInsight: "خطأ في الاتصال بالمستشار الذكي، حاول مرة أخرى.",
      skillsRadar: { math: 50, programming: 50, mechanics: 50, electronics: 50 },
      battlePlan: []
    };
  }
}