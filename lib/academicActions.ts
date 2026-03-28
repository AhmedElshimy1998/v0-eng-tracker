"use server"

import { kv } from "@vercel/kv"
import { auth } from "@/lib/auth-server"
import { SemesterData } from "@/lib/types" 
import legacyUsers from "@/lib/legacy-users.json"
import { unstable_cache, revalidateTag } from "next/cache";

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

// أ - الدالة المساعدة اللي بتخزن الداتا في الكاش
const getCachedProfile = unstable_cache(
  async (userId: string) => {
    const data = await kv.get<AcademicProfile>(`academic-profile-${userId}`);
    return data || null;
  },
  ['academic-profile-cache'],
  { tags: ['academic-profile'] } // 👈 التاج ده مهم جداً عشان هنمسح بيه الكاش بعدين
);

// ب - الدالة الأساسية اللي ملفاتك كلها بتناديها (مش هتغير اسمها عشان متبوظش ملفاتك)
export async function getAcademicProfile() {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    
    // بدل ما نكلم Upstash كل مرة، بنكلم الكاش بتاع السيرفر!
    return await getCachedProfile(userId);
  } catch (error) {
    return null;
  }
}

export async function saveAcademicProfile(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };
    
    // 🚨 تنبيه مهم: تأكد إن المفتاح ده هو نفس اللي بتستخدمه في دالة getAcademicProfile
    const key = `academic-profile-${userId}`; 
    
    const existingData: any = (await kv.get(key)) || { name: "", phone: "", department: "", semesters: [], lastUpdated: 0 };
    
    const serverTime = existingData.lastUpdated || 0;
    const incomingTime = data.lastUpdated; // هنا ممكن تكون undefined لو جاية من كود قديم

    // 🛡️ الدرع الذكي: يرفض بس لو فيه وقت مبعوت وكان فعلاً أقدم من السيرفر
    if (incomingTime !== undefined && serverTime > incomingTime) {
       console.log("⚠️ تم رفض التحديث: بيانات السيرفر أحدث.");
       return { success: false, error: "Server data is newer" };
    }

    // ⏱️ لو مفيش وقت مبعوت (زي في صفحة 16)، السيرفر هياخد وقت اللحظة دي ويختم بيه
    const finalTime = incomingTime !== undefined ? incomingTime : Date.now();

    // الاستبدال الكامل عشان الحذف يشتغل
    const newData = { 
        ...existingData, 
        ...data, 
        lastUpdated: finalTime
    };
    
    await kv.set(key, newData);
    revalidateTag('academic-profile');
    revalidateTag('admin-students-data');
    return { success: true };
    
  } catch (error) {
    console.error("Failed to save academic profile:", error);
    return { success: false };
  }
}

// دوال إدارة الأقسام للإدمن
export const getDepartments = unstable_cache(
  async () => {
    try {
      const data = await kv.get<DepartmentItem[]>('global-departments');
      return data || defaultDepartments;
    } catch (error) {
      return defaultDepartments;
    }
  },
  ['global-departments-cache'], // اسم الكاش في الميموري
  { revalidate: 86400, tags: ['departments'] } // 86400 ثانية = 24 ساعة!
);

export async function saveDepartments(departments: DepartmentItem[]) {
  try {
    await kv.set('global-departments', departments);
    revalidateTag('departments');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}