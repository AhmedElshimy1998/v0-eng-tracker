"use server"

import { kv } from "@vercel/kv"
import { Subject } from "./types"
import { auth } from "@/lib/auth-server"

export async function getCloudData() {
  try {
    const { userId } = await auth(); 
    if (!userId) return undefined; 

    // 💡 بنسأل الداتا بيز: هل المستخدم ده رفع أي حاجة قبل كده؟
    const isKnownUser = await kv.get(`user-onboarded-${userId}`);
    const data = await kv.get<Subject[]>(`studyhub-cloud-data-${userId}`);
    
    return {
      subjects: data || [],
      isNewUser: !isKnownUser // لو ملوش بصمة يبقى جديد
    };
  } catch (error) {
    return undefined;
  }
}

export async function saveCloudData(subjects: Subject[]) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // 1. حفظ المواد في السحابة
    await kv.set(`studyhub-cloud-data-${userId}`, subjects)

    // 2. وضع بصمة للمستخدم عشان السيستم يعرف إنه مبقاش جديد
    // البصمة دي سريعة جداً ومبتعملش مشاكل في الكوكيز
    if (subjects.length > 0) {
      await kv.set(`user-onboarded-${userId}`, true);
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to save to cloud:", error)
    return { success: false }
  }
}

export async function savePushSubscription(sub: any) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const key = `push-subscriptions-${userId}`; 
    const existingSubs: any[] = (await kv.get(key)) || [];
    
    const isDuplicate = existingSubs.find((s) => s.endpoint === sub.endpoint);
    if (!isDuplicate) {
      existingSubs.push(sub);
      await kv.set(key, existingSubs);
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}