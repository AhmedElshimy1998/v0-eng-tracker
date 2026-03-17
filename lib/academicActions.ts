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

// دالة جلب سجلات الطالب (المواد والتقديرات)
export async function getStudentRecords() {
  try {
    const { userId } = await auth(); // استدعاء الأيدي من Clerk
    if (!userId) return [];

    // هنا بنجيب البيانات من الداتابيز عندك
    // لو بتستخدم Prisma مثلاً، الكود هيكون شبه كده:
    /*
    const records = await prisma.studentRecord.findMany({
      where: { userId: userId }
    });
    return records;
    */

    // مؤقتاً عشان الـ Build يشتغل والصفحة تفتح، رجع مصفوفة فاضية
    // أو لو عندك متغير فيه البيانات، حطه هنا
    return []; 
  } catch (error) {
    console.error("Error fetching student records:", error);
    return [];
  }
}
