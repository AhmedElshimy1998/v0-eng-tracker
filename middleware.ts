import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// 1. حدد المسارات اللي "أي حد" يشوفها
const isPublicRoute = createRouteMatcher([
  '/', 
    '/sign-in(.*)', 
      '/sign-up(.*)', 
        '/api(.*)'
        ]);

        export default clerkMiddleware(async (auth, req: NextRequest) => {
          const { userId } = await auth();
            const isPublic = isPublicRoute(req);
              const isHomePage = req.nextUrl.pathname === '/';

                // حالة 1: مستخدم مش مسجل وبيحاول يدخل صفحة خاصة (زي المواد أو الإعدادات)
                  if (!userId && !isPublic) {
                      // نطرده للرئيسية بس نستخدم رابط صريح
                          return NextResponse.redirect(new URL('/', req.url));
                            }

                              // حالة 2: مستخدم مسجل دخول وراح للرئيسية بالصدفة
                                if (userId && isHomePage) {
                                    // نحوله للداشبورد عشان ميفضلش في صفحة الشرح
                                        return NextResponse.redirect(new URL('/dashboard', req.url));
                                          }

                                            // حالة 3: أي حالة تانية (زي مسجل ورايح لصفحة المواد) سيبه يمر بسلام
                                              return NextResponse.next();
                                              });

                                              export const config = {
                                                // الـ Matcher ده هو اللي بيعرف الميدل وير يشتغل على أي صفحات
                                                  matcher: [
                                                      '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
                                                          '/(api|trpc)(.*)',
                                                            ],
                                                            };
