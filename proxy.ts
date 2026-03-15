import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/', 
    '/sign-in(.*)', 
      '/sign-up(.*)', 
        '/api(.*)' 
        ]);

        export default clerkMiddleware(async (auth, req: NextRequest) => {
          const { userId } = await auth();

            if (!userId && !isPublicRoute(req)) {
                return NextResponse.redirect(new URL('/', req.url));
                  }

                    return NextResponse.next();
                    });

                    export const config = {
                      matcher: [
                          '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
                              '/(api|trpc)(.*)',
                                ],
                                };
                                