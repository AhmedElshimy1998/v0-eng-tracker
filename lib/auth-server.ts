// مسار الملف: lib/auth-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import legacyUsers from "@/lib/legacy-users.json" // 👈 استيراد خريطة المستخدمين

export async function auth() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // لو مفيش مستخدم مسجل دخول
  if (!user) {
    return { userId: null, userEmail: null }
  }

  // 🔄 السحر بتاعك هنا: التحويل الذكي للـ ID
  const userEmail = user.email!;
  const userMap = legacyUsers as Record<string, string>;
  
  // لو الإيميل موجود في الخريطة، استخدم الـ ID القديم (Clerk)
  // لو مش موجود (طالب جديد)، استخدم الـ ID الجديد (Supabase)
  const resolvedUserId = userMap[userEmail] || user.id;

  return { 
    userId: resolvedUserId, // 👈 كل دوال المشروع هتاخد ده وتشتغل بيه فوراً!
    userEmail: userEmail 
  }
}