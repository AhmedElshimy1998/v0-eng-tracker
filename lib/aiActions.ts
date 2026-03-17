"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStudentRecords } from "./academicActions";
import { coursesCatalog } from "./courses";
import { currentUser } from "@clerk/nextjs/server";
import { kv } from "@upstash/kv";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getSmartAnalysis() {
  try {
    // 1. جلب بيانات المستخدم الحالية من Clerk (دايناميك)
    const user = await currentUser();
    if (!user) throw new Error("User not found");

    const studentName = user.firstName || "طالب هندسة";
    const userId = user.id;

    // 2. جلب سجلات المواد من Upstash KV
    const records: any[] = await getStudentRecords();

    // 3. جلب بيانات "البروفايل المهني" لو الطالب مسجلها (اختياري)
    const userProfile: any = await kv.get(`user_profile:${userId}`) || {};

    // 4. تحضير سياق البيانات التقني
    const studentData = {
      fullName: studentName,
      records: records, // المواد اللي خلصها ودرجاته
      jobTitle: userProfile.jobTitle || "طالب منتظم", 
      interests: userProfile.interests || ["الهندسة العامة"],
      totalCatalogCount: coursesCatalog.length,
      passedCount: records.length
    };

    // 5. الـ Prompt العام (Generic Prompt)
    // لاحظ إننا هنا مش بنذكر اسمك ولا شركتك، الـ AI بياخدهم من المتغيرات
    const prompt = `
      بصفتك مستشاراً أكاديمياً ذكياً لمنصة هندسية، قم بتحليل بروفايل الطالب التالي:
      بيانات الطالب: ${JSON.stringify(studentData)}
      قائمة المواد المتاحة: ${JSON.stringify(coursesCatalog)}

      المطلوب تحليل دقيق وحيادي يشمل:
      1. حساب نسبة الإنجاز الكلية بناءً على الساعات المعتمدة.
      2. تحديد "المسار الحرج": ما هي المواد المتبقية التي تفتح أكبر قدر من المتطلبات اللاحقة؟
      3. تحليل نقاط القوة: بناءً على درجاته في المواد التي اجتازها، ما هي مهاراته التقنية؟
      4. نصيحة التسجيل: اقترح قائمة مواد للترم القادم تضمن أسرع طريق للتخرج مع موازنة صعوبة المواد.

      يجب أن يكون الرد بصيغة JSON حصراً بهذا التنسيق:
      {
        "completionRate": 0-100,
        "academicAnalysis": "تحليل تقني لنقاط القوة والضعف",
        "battlePlan": [
          { "course": "اسم المادة", "code": "الكود", "priority": "High/Medium", "reason": "السبب الأكاديمي" }
        ],
        "careerAdvice": "نصيحة تربط مستواه الأكاديمي بأهدافه المهنية المذكورة في البروفايل"
      }
      اللغة: العربية. الأسلوب: مهني، عملي، ومختصر.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // استخراج الـ JSON بدقة
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}') + 1;
    return JSON.parse(responseText.substring(start, end));

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      completionRate: 0,
      academicAnalysis: "لا يمكن إتمام التحليل حالياً، تأكد من إدخال درجاتك أولاً.",
      battlePlan: [],
      careerAdvice: "استكمل بيانات بروفايلك للحصول على نصيحة مهنية مخصصة."
    };
  }
}