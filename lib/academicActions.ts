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

export async function saveAcademicProfile(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };
    
    // مفتاح المستخدم في قاعدة البيانات
    const key = `studyhub-academic-profile-${userId}`; 
    
    // جلب الداتا الحالية من السيرفر (لو مفيش، بنعمل داتا فاضية)
    const existingData: any = (await kv.get(key)) || { name: "", phone: "", department: "", semesters: [], lastUpdated: 0 };
    
    // 🛡️ الدرع الجميل: المقارنة الزمنية (مين الأحدث؟)
    const serverTime = existingData.lastUpdated || 0;
    const incomingTime = data.lastUpdated || 0;

    // لو الداتا اللي متسجلة في السيرفر وقتها "أكبر/أحدث" من اللي جاية من المتصفح
    // يبقى المتصفح ده كان أوفلاين وجايب داتا قديمة.. نرفض التحديث فوراً!
    if (serverTime > incomingTime) {
       console.log("⚠️ تم رفض التحديث: بيانات السيرفر أحدث.");
       return { success: false, error: "Server data is newer" };
    }

    // ✅ لو وصلنا هنا، معناه إن الداتا اللي جاية "أحدث" (أو متساويين)
    // هننفذ كلامها هي ونعمل الاستبدال اللي بيحل مشكلة الحذف
    const newData = { 
        ...existingData, 
        ...data, // استبدال كامل للمصفوفة
        lastUpdated: incomingTime // تحديث وقت السيرفر للوقت الجديد
    };
    
    await kv.set(key, newData);
    return { success: true };
    
  } catch (error) {
    console.error("Failed to save academic profile:", error);
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