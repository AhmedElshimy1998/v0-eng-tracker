import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// 1. حدد المسارات اللي "أي حد" يشوفها
const isPublicRoute = createRouteMatcher([
  '/', 
    '/sign-in(.*)', 
      '/sign-up(.*)', 
        '/api(.*)',
        '/news(.*)',
        '/icon(.*)',
        '/logo(.*)',
        '/manifest.json', 
        '/manifest.webmanifest',
        '/sw.js',
        '/workbox-(.*)'
        ]);

        // 2. إعداد الـ Proxy (البديل للميدل وير)
        const proxyHandler = clerkMiddleware(async (auth, req: NextRequest) => {
          const { userId } = await auth();
            const isPublic = isPublicRoute(req);
              const isHomePage = req.nextUrl.pathname === '/';

                // حالة 1: مستخدم مش مسجل وبيحاول يدخل صفحة خاصة
                  if (!userId && !isPublic) {
                      return NextResponse.redirect(new URL('/', req.url));
                        }

                          // حالة 2: مستخدم مسجل دخول وراح للرئيسية بالصدفة
                            if (userId && isHomePage) {
                                return NextResponse.redirect(new URL('/dashboard', req.url));
                                  }

                                    // حالة 3: أي حالة تانية سيبه يمر بسلام
                                      return NextResponse.next();
                                      });

                                      // تصدير البروكسي بالطريقة اللي بيقبلها Next.js 16
                                      export default proxyHandler;
                                      export { proxyHandler as proxy };

                                      export const config = {
                                        matcher: [
                                            '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
                                                '/(api|trpc)(.*)',
                                                  ],
                                                  };

