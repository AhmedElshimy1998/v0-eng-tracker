"use server"

import { kv } from "@vercel/kv"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { AcademicProfile } from "./academicActions"

// 1. فحص هل المستخدم الحالي أدمن؟
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    let admins = await kv.get<string[]>('site-admins');
    
    // لو مفيش أي أدمن في الموقع خالص، أول واحد يدخل هيبقى هو الأدمن الرئيسي (عشانك إنت)
    if (!admins || admins.length === 0) {
      admins = [userId];
      await kv.set('site-admins', admins);
      return true;
    }

    return admins.includes(userId);
  } catch (error) {
    return false;
  }
}

// 2. جلب كل الطلاب المسجلين
export async function getAllStudents() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // جلب كل المفاتيح اللي بتبدأ بـ academic-profile
    const keys = await kv.keys('academic-profile-*');
    if (keys.length === 0) return [];

    // جلب بيانات كل المفاتيح
    const studentsData = await Promise.all(keys.map(key => kv.get<AcademicProfile>(key)));
    
    // استخراج الـ ID من اسم المفتاح ودمجه مع البيانات
    return studentsData.map((data, index) => ({
      userId: keys[index].replace('academic-profile-', ''),
      profile: data
    })).filter(s => s.profile !== null);
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

// 3. إدارة الأدمنز (إضافة/إزالة)
export async function toggleAdminStatus(targetUserId: string, makeAdmin: boolean) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    let admins = await kv.get<string[]>('site-admins') || [];
    
    if (makeAdmin && !admins.includes(targetUserId)) {
      admins.push(targetUserId);
    } else if (!makeAdmin) {
      admins = admins.filter(id => id !== targetUserId);
    }

    await kv.set('site-admins', admins);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}