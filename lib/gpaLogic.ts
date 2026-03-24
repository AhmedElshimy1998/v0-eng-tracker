import { Grade, StudentCourseRecord, Course } from "./types";

// 1. قاموس التقديرات والنقاط (Grade Points Dictionary)
export const gradePoints: Record<Grade, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0,
  'F': 0.0, 'Fail': 0.0, 
  'Taken': 0.0, '-': 0.0
};

// 2. دالة التحقق من المتطلبات (Can Take Logic)
// بترجع true لو الطالب يقدر يسجل المادة، و false لو لسه مقفولة
export function checkCanTake(
  prerequisites: string[], 
  studentRecords: any[], // استخدم الـ Type بتاعك (StudentCourseRecord)
  completedCredits: number = 0, // ضفنا ده عشان نقارن بيه شرط الساعات
  requireAny: boolean = false   // ضفنا ده عشان يفعل نظام (أو) للكروت الوهمية
): boolean {
  // لو المادة ملهاش متطلبات، افتحها فوراً
  if (!prerequisites || prerequisites.length === 0) return true;

  // دالة داخلية صغيرة بتفحص متطلب واحد (سواء كان عدد ساعات أو مادة)
  const checkSinglePrereq = (prereqCode: string) => {
    // 1. فحص هل المتطلب ده عبارة عن عدد ساعات؟ (بيدور على رقم جوه النص)
    const creditMatch = prereqCode.match(/Completion of (\d+) credits/i);
    if (creditMatch) {
      const requiredCredits = parseInt(creditMatch[1], 10);
      return completedCredits >= requiredCredits; // بيفتح لو ساعات الطالب مساوية أو أكتر
    }

    // 2. لو المتطلب عبارة عن مادة عادية، نطبق اللوجيك بتاعك
    const attempts = studentRecords.filter(r => r.courseCode === prereqCode);
    
    // لو مسجلهاش خالص، تبقى لسه مقفولة
    if (attempts.length === 0) return false;

    // اللوجيك بتاعك: الـ F الأكاديمي بيفتح المادة اللي بعدها عادي
    // لكن الـ Fail (حرمان/غياب) أو الـ Taken (لسه بيمتحنها) مبيفتحوش المادة
    return attempts.some(attempt => 
      attempt.grade !== 'Fail' && 
      attempt.grade !== 'Taken' && 
      attempt.grade !== '-'
    );
  };

  // 3. التطبيق النهائي: (أو) للكارت الوهمي، و (و) للمواد الطبيعية
  if (requireAny) {
    return prerequisites.some(checkSinglePrereq);
  } else {
    return prerequisites.every(checkSinglePrereq);
  }
}

// 3. دالة معالجة الإعادة (Retake Logic)
// بتاخد كل سجلات الطالب، وتفلترهم عشان تخلي "أعلى تقدير" بس لكل مادة عشان حساب التراكمي
export function getEffectiveRecords(records: StudentCourseRecord[]): StudentCourseRecord[] {
  const effectiveRecordsMap = new Map<string, StudentCourseRecord>();

  records.forEach(record => {
    const existing = effectiveRecordsMap.get(record.courseCode);
    
    if (!existing) {
      effectiveRecordsMap.set(record.courseCode, record);
    } else {
      // لو مسجل المادة قبل كده، بنقارن النقط وبناخد التقدير الأعلى
      // ده بيضمن إن الـ F القديمة تتمسح من التراكمي وتتحدث بالتقدير الجديد
      const currentPoints = gradePoints[record.grade];
      const existingPoints = gradePoints[existing.grade];
      
      if (currentPoints > existingPoints) {
        effectiveRecordsMap.set(record.courseCode, record);
      }
    }
  });

  return Array.from(effectiveRecordsMap.values());
}

// 4. دالة حساب الـ GPA (لترم معين أو للتراكمي الكلي)
export function calculateGPA(
  records: StudentCourseRecord[], 
  coursesCatalog: Course[]
): { gpa: number; totalCredits: number; failedCredits: number } {
  let totalPoints = 0;
  let totalCredits = 0;
  let failedCredits = 0;

  records.forEach(record => {
    // بنجيب بيانات المادة من الكتالوج عشان نعرف عدد ساعاتها
    const courseInfo = coursesCatalog.find(c => c.code === record.courseCode);
    if (!courseInfo) return;

    // بنتجاهل المواد اللي ساعاتها صفر (زي القضايا المجتمعية) 
    // وبنتجاهل المواد اللي لسه Taken أو -
    if (courseInfo.credits === 0 || record.grade === 'Taken' || record.grade === '-') {
      return;
    }

    const points = gradePoints[record.grade];
    
    // تجميع الساعات والنقاط
    totalCredits += courseInfo.credits;
    totalPoints += (points * courseInfo.credits);

    // تجميع ساعات الرسوب
    if (record.grade === 'F' || record.grade === 'Fail') {
      failedCredits += courseInfo.credits;
    }
  });

  // تجنب القسمة على صفر
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  return {
    gpa: Number(gpa.toFixed(3)), // تقريب لـ 3 أرقام عشرية
    totalCredits,
    failedCredits
  };
}