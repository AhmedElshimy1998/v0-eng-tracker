import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// 1. حدد المسارات العامة بدقة
const isPublicRoute = createRouteMatcher([
  '/', 
    '/sign-in(.*)', 
      '/sign-up(.*)', 
        '/api(.*)' // عشان الـ Cron Job ميتمنعش
        ]);

        export default clerkMiddleware(async (auth, req: NextRequest) => {
          const { userId } = await auth();
            const isPublic = isPublicRoute(req);

              // 2. لو المستخدم مش مسجل وبيحاول يدخل مسار خاص -> اطرده للرئيسية
                if (!userId && !isPublic) {
                    const signInUrl = new URL('/', req.url);
                        return NextResponse.redirect(signInUrl);
                          }

                            // 3. لو مسجل دخول وفاتح الصفحة الرئيسية -> حوله للداشبورد فوراً (عشان ميبقاش فيه تعارض)
                              if (userId && req.nextUrl.pathname === '/') {
                                  const dashboard = new URL('/dashboard', req.url);
                                      return NextResponse.redirect(dashboard);
                                        }
                                          
                                            return NextResponse.next();
                                            });

                                            export const config = {
                                              matcher: [
                                                  '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
                                                      '/(api|trpc)(.*)',
                                                        ],
                                                        };
