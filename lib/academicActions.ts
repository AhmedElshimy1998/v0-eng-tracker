"use server"

import { kv } from "@vercel/kv"
import { auth } from "@clerk/nextjs/server"
import { SemesterData } from "@/lib/types" 

export interface AcademicProfile {
  name: string;
  phone: string;
  department: string;
  semesters: SemesterData[];
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
    const existingData = (await kv.get<AcademicProfile>(key)) || { name: "", phone: "", department: "", semesters: [] };
    const newData = { ...existingData, ...data };
    await kv.set(key, newData);
    return { success: true };
  } catch (error) {
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
    // التأكد من أن الإدمن هو اللي بيعدل (ممكن تضيف فحص للصلاحيات هنا مستقبلاً)
    await kv.set('global-departments', departments);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}


export async function getStudentRecords() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    // جلب البيانات من Upstash
    const records = await kv.get(`student_records:${userId}`);
    return (records as any[]) || [];
  } catch (error) {
    console.error("Upstash KV Error:", error);
    return [];
  }
}

// 2. 

export async function saveStudentRecord(courseCode: string, grade: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existingRecords: any[] = await getStudentRecords();
    const updatedRecords = [
      ...existingRecords.filter(r => r.courseCode !== courseCode),
      { courseCode, grade, updatedAt: new Date().toISOString() }
    ];

    await kv.set(`student_records:${userId}`, updatedRecords);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

