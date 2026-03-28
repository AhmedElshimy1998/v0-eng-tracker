import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(req: NextRequest) {
 let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const path = req.nextUrl.pathname;

  // نظفنا الـ Regex لأن الماتشر هيتولى مهمة استبعاد الـ api وملفات الـ PWA
  const isPublicPattern = /^\/(?:sign-in|sign-up|news|icon|logo|auth|$)/;
  const isPublic = isPublicPattern.test(path);
  const isHomePage = path === '/';

  // حالة 1: مستخدم مش مسجل وبيحاول يدخل صفحة خاصة (هيرجع للرئيسية)
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // حالة 2: مستخدم مسجل دخول وراح للرئيسية أو صفحة الدخول (هيروح للداشبورد)
  if (user && (isHomePage || path.startsWith('/sign-in') || path.startsWith('/sign-up'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return response
}

export const config = {
  matcher: [
    // الكود ده معناه: اشتغل على كل مسارات الموقع، "ما عدا":
    // 1. مسار الـ api/ بالكامل (عشان الـ CRON jobs والـ webhooks تاخد راحتها)
    // 2. ملفات الـ PWA (manifest, sw.js)
    // 3. ملفات النظام بتاعة Next.js
    // 4. الصور والملفات الثابتة
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};