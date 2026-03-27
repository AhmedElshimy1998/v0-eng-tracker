"use server"

import { kv } from "@vercel/kv"
import { Subject } from "./types" // تأكد إن المسار ده صح عندك
import { auth } from "@/lib/auth-server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// دالة لجلب البيانات من السحابة ومعرفة هل المستخدم جديد؟
export async function getCloudData() {
  try {
    const { userId, isOnboarded } = await auth(); 
    if (!userId) return undefined; 

    const data = await kv.get<Subject[]>(`studyhub-cloud-data-${userId}`)
    
    return {
      subjects: data || [], // لو الداتا فاضية نرجع مصفوفة
      isNewUser: !isOnboarded // لو مش Onboarded يبقى جديد
    };
  } catch (error) {
    return undefined;
  }
}

// دالة لحفظ البيانات في السحابة
export async function saveCloudData(subjects: Subject[]) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await kv.set(`studyhub-cloud-data-${userId}`, subjects)
    return { success: true }
  } catch (error) {
    console.error("Failed to save to cloud:", error)
    return { success: false }
  }
}

// 🎯 الدالة الجديدة: بتختم على باسبور المستخدم في سوبابيس إنه مبقاش جديد
export async function markAsOnboarded() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )
    
    await supabase.auth.updateUser({
      data: { onboarded: true }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// دالة لحفظ اشتراك الإشعارات
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