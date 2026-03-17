"use server"

import { kv } from "@vercel/kv"
import { auth } from "@clerk/nextjs/server"
import { SemesterData } from "@/lib/types" // تأكد من المسار

// هيكل بيانات البروفايل الأكاديمي
export interface AcademicProfile {
  name: string;
  phone: string;
  department: string;
  semesters: SemesterData[];
}

// 1. جلب البيانات الأكاديمية
export async function getAcademicProfile() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    // بنستخدم مفتاح جديد تماماً لمنع التضارب
    const data = await kv.get<AcademicProfile>(`academic-profile-${userId}`);
    return data || null;
  } catch (error) {
    console.error("Failed to fetch academic profile:", error);
    return null;
  }
}

// 2. حفظ وتحديث البيانات الأكاديمية
export async function saveAcademicProfile(data: Partial<AcademicProfile>) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const key = `academic-profile-${userId}`;
    
    // نجلب الداتا القديمة عشان منمسحش حاجة بالغلط (لو بنعمل Update جزئي)
    const existingData = (await kv.get<AcademicProfile>(key)) || {
      name: "", phone: "", department: "", semesters: []
    };

    const newData = { ...existingData, ...data };

    await kv.set(key, newData);
    return { success: true };
  } catch (error) {
    console.error("Failed to save academic profile:", error);
    return { success: false };
  }
}