"use server"

import { kv } from "@vercel/kv"
import { Subject } from "./types"

const KV_KEY = "studyhub-cloud-data"

// دالة لجلب البيانات من السحابة
export async function getCloudData() {
  try {
    const data = await kv.get<Subject[]>(KV_KEY)
    return data
  } catch (error) {
    console.error("Failed to fetch from cloud:", error)
    return null
  }
}

// دالة لحفظ البيانات في السحابة
export async function saveCloudData(subjects: Subject[]) {
  try {
    await kv.set(KV_KEY, subjects)
    return { success: true }
  } catch (error) {
    console.error("Failed to save to cloud:", error)
    return { success: false }
  }
}

// دالة لحفظ اشتراك المتصفح في الإشعارات
export async function savePushSubscription(sub: any) {
  try {
    // نجلب الاشتراكات القديمة (لو فاتح الموقع من الموبايل واللاب توب مع بعض)
    const existingSubs: any[] = (await kv.get("push-subscriptions")) || [];
    
    // نمنع تكرار نفس الاشتراك
    const isDuplicate = existingSubs.find((s) => s.endpoint === sub.endpoint);
    if (!isDuplicate) {
      existingSubs.push(sub);
      await kv.set("push-subscriptions", existingSubs);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to save push subscription to cloud:", error);
    return { success: false };
  }
}