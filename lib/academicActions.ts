"use server"

import { kv } from "@vercel/kv"
import { auth } from "@clerk/nextjs/server"
import { SemesterData } from "@/lib/types" 

export interface AcademicProfile {
  name: string;
  phone: string;
  department: string;
  semesters: SemesterData[];
  lastUpdated?: number; // الطابع الزمني للمزامنة الذكية
}

export interface DepartmentItem {
  id: string;
  name: string;
}

// الدالة الافتراضية للأقسام
const defaultDepartments: DepartmentItem[] = [
  { id: "General", name: "المواد العامة (جامعة/كلية)" },
  { id: "Mechatronics", name: "هندسة الميكاترونيات" },
  { id: "Energy", name: "هندسة الطاقة والنظم الكهربية" }
];

export async function getAcademicProfile() {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    const data = await kv.get<AcademicProfile>(`academic-profile-${userId}`);
    return data || null;
  } catch (error) {
    return null;
  }
}

export async function saveAcademicProfile(data: Partial<AcademicProfile>) {
  try {
    const { userId } = await auth(); // التحقق من هوية المستخدم عبر Clerk
    if (!userId) return { success: false, error: "Unauthorized" };
    
    const key = `academic-profile-${userId}`;
    const existingData = (await kv.get<AcademicProfile>(key)) || { name: "", phone: "", department: "", semesters: [], lastUpdated: 0 };
    
    // 1. منطق دمج الفصول الدراسية (Semesters Merge)
    let mergedSemesters = [...existingData.semesters];

    if (data.semesters) {
      data.semesters.forEach((newSem) => {
        const existingSemIndex = mergedSemesters.findIndex(s => s.name === newSem.name);
        
        if (existingSemIndex > -1) {
          // أ. لو الفصل موجود، ندمج المواد اللي جواه (Courses Merge)
          const existingCourses = mergedSemesters[existingSemIndex].courses;
          const newCourses = newSem.courses;
          
          // دمج المواد بناءً على الـ ID أو الكود لمنع التكرار
          const mergedCourses = [...existingCourses];
          newCourses.forEach(nc => {
            if (!mergedCourses.find(ec => ec.id === nc.id || (ec.courseCode === nc.courseCode && ec.semester === nc.semester))) {
              mergedCourses.push(nc);
            }
          });
          
          mergedSemesters[existingSemIndex].courses = mergedCourses;
        } else {
          // ب. لو الفصل مش موجود أصلاً، نضيفه بالكامل
          mergedSemesters.push(newSem);
        }
      });
    }

    // 2. تجميع البيانات النهائية
    const newData = { 
        ...existingData, 
        ...data,
        semesters: mergedSemesters, // النسخة المدمجة
        lastUpdated: Date.now() // تحديث طابع الوقت
    };
    
    await kv.set(key, newData); // حفظ البيانات في Vercel KV
    return { success: true };
  } catch (error) {
    console.error("Failed to merge & save academic profile:", error);
    return { success: false };
  }
}

// دوال إدارة الأقسام للإدمن
export async function getDepartments(): Promise<DepartmentItem[]> {
  try {
    const data = await kv.get<DepartmentItem[]>('global-departments');
    return data || defaultDepartments;
  } catch (error) {
    return defaultDepartments;
  }
}

export async function saveDepartments(departments: DepartmentItem[]) {
  try {
    await kv.set('global-departments', departments);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}