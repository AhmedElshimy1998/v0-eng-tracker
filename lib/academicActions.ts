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
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };
    
    const key = `academic-profile-${userId}`;
    const existingData = (await kv.get<AcademicProfile>(key)) || { name: "", phone: "", department: "", semesters: [], lastUpdated: 0 };
    
    let mergedSemesters = [...existingData.semesters];

    if (data.semesters) {
      data.semesters.forEach((newSem) => {
        const existingSemIndex = mergedSemesters.findIndex(s => s.name === newSem.name);
        
        if (existingSemIndex > -1) {
          // دمج المواد داخل الفصل الموجود
          const existingCourses = [...mergedSemesters[existingSemIndex].courses];
          const newCourses = newSem.courses;
          
          newCourses.forEach(nc => {
            const courseIndex = existingCourses.findIndex(ec => ec.id === nc.id);
            
            if (courseIndex > -1) {
              // ⭐ التعديل الجوهري: تحديث المادة الموجودة بالدرجة الجديدة
              existingCourses[courseIndex] = { ...existingCourses[courseIndex], ...nc };
            } else {
              // إضافة مادة جديدة تماماً
              existingCourses.push(nc);
            }
          });
          
          mergedSemesters[existingSemIndex].courses = existingCourses;
        } else {
          // إضافة فصل دراسي جديد بالكامل
          mergedSemesters.push(newSem);
        }
      });
    }

    const newData = { 
        ...existingData, 
        ...data,
        semesters: mergedSemesters,
        lastUpdated: Date.now() 
    };
    
    await kv.set(key, newData);
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