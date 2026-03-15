import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server"; // أضفنا NextRequest هنا

// تحديد المسارات العامة
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => { // حددنا النوع هنا req: NextRequest
  const { userId } = await auth();

    // لو المستخدم مش مسجل دخول وبيحاول يدخل مسار خاص
      if (!userId && !isPublicRoute(req)) {
          const url = req.nextUrl.clone();
              url.pathname = '/';
                  return NextResponse.redirect(url);
                    }
                    });

                    export const config = {
                      matcher: [
                          '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
                              '/(api|trpc)(.*)',
                                ],
                                };
                                