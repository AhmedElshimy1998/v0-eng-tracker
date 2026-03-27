// مسار الملف: lib/auth-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import legacyUsers from "@/lib/legacy-users.json" 

export async function auth() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { userId: null, userEmail: null, isOnboarded: false }
  }

  const userEmail = user.email!;
  const userMap = legacyUsers as Record<string, string>;
  
  const resolvedUserId = userMap[userEmail] || user.id;

  // 🛡️ تحديد حالة المستخدم:
  // لو موجود في الجيسون (طالب مهاجر) -> يبقى أكيد Onboarded (قديم)
  // لو جديد -> بنشوف الـ metadata بتاعته في سوبابيس
  const isOnboarded = !!userMap[userEmail] || !!user.user_metadata?.onboarded;

  return { 
    userId: resolvedUserId,
    userEmail: userEmail,
    isOnboarded // 👈 الميزة الجديدة اللي هتحمينا من مسح الداتا
  }
}