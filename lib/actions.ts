"use server"

import { kv } from "@vercel/kv"
import { Subject } from "./types"
import { auth } from "@/lib/auth-server"

export async function getCloudData() {
  try {
    const { userId, isOnboarded } = await auth(); 
    if (!userId) return undefined; 

    // بنسأل الداتا بيز: هل المستخدم ده رفع أي حاجة قبل كده؟
    const isKnownUser = await kv.get(`user-onboarded-${userId}`);
    const data = await kv.get<Subject[]>(`studyhub-cloud-data-${userId}`);
    
    return {
      subjects: data || [],
      // المستخدم جديد فقط لو ملوش بصمة في Clerk ومندوش بصمة في Upstash
      isNewUser: !(isOnboarded || isKnownUser) 
    };
  } catch (error) {
    return undefined;
  }
}

export async function saveCloudData(subjects: Subject[]) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // 1. حفظ المواد في السحابة فوراً
    await kv.set(`studyhub-cloud-data-${userId}`, subjects);

    // 2. وضع بصمة للمستخدم للأبد (حتى لو المصفوفة فاضية)
    await kv.set(`user-onboarded-${userId}`, true);

    return { success: true };
  } catch (error) {
    console.error("Failed to save to cloud:", error);
    return { success: false };
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