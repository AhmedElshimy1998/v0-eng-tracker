// lib/academic-logic.ts

import { Grade, StudentCourseRecord, Course } from "./types";

// ==========================================
// 1. الثوابت الأكاديمية (Constants)
// ==========================================

export const TOTAL_GRADUATION_CREDITS = 160;

export const gradePoints: Record<Grade, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0,
  'F': 0.0, 'Fail': 0.0, 
  'Taken': 0.0, '-': 0.0
};

// ==========================================
// 2. دوال الفحص الأساسية (Validation Helpers)
// ==========================================

/**
 * فحص هل التقدير يعتبر "نجاح" ويضاف لساعات التخرج أم لا
 * تم تجميعها من صفحات التتبع والـ AI لضمان توحيد النتيجة
 */
export function isPassed(grade?: string | null): boolean {
  if (!grade) return false;
  const g = grade.trim();
  return !['F', 'Fail', 'Taken', '-'].includes(g);
}

/**
 * تحديد مستوى الطالب بناءً على الساعات المنجزة
 */
export function getStudentLevel(credits: number) {
  if (credits < 32) return { label: "Level 0", color: "bg-blue-500/10 text-blue-500" };
  if (credits < 64) return { label: "Level 1", color: "bg-cyan-500/10 text-cyan-500" };
  if (credits < 96) return { label: "Level 2", color: "bg-green-500/10 text-green-500" };
  if (credits < 128) return { label: "Level 3", color: "bg-yellow-500/10 text-yellow-500" };
  return { label: "Level 4", color: "bg-purple-500/10 text-purple-500" };
}

// ==========================================
// 3. المنطق الأكاديمي الرئيسي (Core Academic Logic)
// ==========================================

/**
 * فحص هل الطالب يقدر يسجل المادة بناءً على المتطلبات
 * (نفس اللوجيك بتاعك بالظبط: الـ F بيفتح المادة، لكن الحرمان أو Taken لأ)
 */
export function checkCanTake(
  prerequisites: string[], 
  studentRecords: StudentCourseRecord[], 
  completedCredits: number = 0, 
  requireAny: boolean = false   
): boolean {
  if (!prerequisites || prerequisites.length === 0) return true;

  const checkSinglePrereq = (prereqCode: string) => {
    const creditMatch = prereqCode.match(/Completion of (\d+) credits/i);
    if (creditMatch) {
      const requiredCredits = parseInt(creditMatch[1], 10);
      return completedCredits >= requiredCredits; 
    }

    const attempts = studentRecords.filter(r => r.courseCode === prereqCode);
    if (attempts.length === 0) return false;

    // تم الحفاظ على شرطك الصارم هنا
    return attempts.some(attempt => 
      attempt.grade !== 'Fail' && 
      attempt.grade !== 'Taken' && 
      attempt.grade !== '-'
    );
  };

  if (requireAny) {
    return prerequisites.some(checkSinglePrereq);
  } else {
    return prerequisites.every(checkSinglePrereq);
  }
}

/**
 * معالجة الإعادة (تصفية السجلات للحصول على التقدير الأعلى فقط للتراكمي)
 */
export function getEffectiveRecords(records: StudentCourseRecord[]): StudentCourseRecord[] {
  const effectiveRecordsMap = new Map<string, StudentCourseRecord>();

  records.forEach(record => {
    const existing = effectiveRecordsMap.get(record.courseCode);
    
    if (!existing) {
      effectiveRecordsMap.set(record.courseCode, record);
    } else {
      const currentPoints = gradePoints[record.grade] || 0;
      const existingPoints = gradePoints[existing.grade] || 0;
      
      if (currentPoints > existingPoints) {
        effectiveRecordsMap.set(record.courseCode, record);
      }
    }
  });

  return Array.from(effectiveRecordsMap.values());
}

/**
 * حساب المعدل التراكمي (GPA) وساعات الرسوب
 */
export function calculateGPA(
  records: StudentCourseRecord[], 
  coursesCatalog: Course[]
): { gpa: number; totalCredits: number; failedCredits: number } {
  let totalPoints = 0;
  let totalCredits = 0;
  let failedCredits = 0;

  records.forEach(record => {
    const courseInfo = coursesCatalog.find(c => c.code === record.courseCode);
    if (!courseInfo) return;

    if (courseInfo.credits === 0 || record.grade === 'Taken' || record.grade === '-') {
      return;
    }

    const points = gradePoints[record.grade] || 0;
    
    totalCredits += courseInfo.credits;
    totalPoints += (points * courseInfo.credits);

    if (record.grade === 'F' || record.grade === 'Fail') {
      failedCredits += courseInfo.credits;
    }
  });

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  return {
    gpa: Number(gpa.toFixed(3)), 
    totalCredits,
    failedCredits
  };
}