"use server"

import { kv } from "@vercel/kv"
import { Subject } from "./types"
import { auth } from "@clerk/nextjs/server" // إضافة مكتبة Clerk

// دالة لجلب البيانات من السحابة الخاصة بالمستخدم فقط
export async function getCloudData() {
  try {
    const { userId } = await auth(); 
    if (!userId) return null; 

    // جلب بيانات هذا المستخدم تحديداً
    const data = await kv.get<Subject[]>(`studyhub-cloud-data-${userId}`)
    
    // التعديل هنا: شلنا || [] عشان نرجع البيانات زي ما هي
    // لو مستخدم جديد هترجع null
    // لو مستخدم مسح مواده هترجع [] (لأن دالة الحفظ بتسجل المصفوفة الفاضية عادي)
    return data; 
  } catch (error) {
    console.error("Failed to fetch from cloud:", error)
    return null
  }
}

// دالة لحفظ البيانات في السحابة الخاصة بالمستخدم فقط
export async function saveCloudData(subjects: Subject[]) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // حفظ البيانات في صندوق خاص بهذا المستخدم
    await kv.set(`studyhub-cloud-data-${userId}`, subjects)
    return { success: true }
  } catch (error) {
    console.error("Failed to save to cloud:", error)
    return { success: false }
  }
}

// دالة لحفظ اشتراك المتصفح في الإشعارات الخاصة بالمستخدم
export async function savePushSubscription(sub: any) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const key = `push-subscriptions-${userId}`; // مفتاح إشعارات خاص بالمستخدم
    
    // نجلب الاشتراكات القديمة الخاصة بهذا المستخدم فقط
    const existingSubs: any[] = (await kv.get(key)) || [];
    
    // نمنع تكرار نفس الاشتراك
    const isDuplicate = existingSubs.find((s) => s.endpoint === sub.endpoint);
    if (!isDuplicate) {
      existingSubs.push(sub);
      await kv.set(key, existingSubs);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to save push subscription to cloud:", error);
    return { success: false };
  }
}
