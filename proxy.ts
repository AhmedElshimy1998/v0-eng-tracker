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

  const isPublicPattern = /^\/(?:sign-in|sign-up|api|news|icon|logo|manifest\.json|sw\.js|auth|$)/;
  const isPublic = isPublicPattern.test(req.nextUrl.pathname);
  const isHomePage = req.nextUrl.pathname === '/';

  // حالة 1: مستخدم مش مسجل وبيحاول يدخل صفحة خاصة
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // حالة 2: مستخدم مسجل دخول وراح للرئيسية أو صفحة الدخول
  if (user && (isHomePage || req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}