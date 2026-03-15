import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. تحديد المسارات المسموح الدخول ليها بدون تسجيل (لو هتعمل صفحة هبوط مثلاً)
// حالياً هنخلي كل حاجة مقفولة ما عدا مسارات Clerk الداخلية
// أضفنا '/' عشان نسمح بزيارة الصفحة الرئيسية
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);


export default clerkMiddleware(async (auth, req) => {
  // 2. جلب بيانات المستخدم (هل هو مسجل دخول ولا لأ؟)
  const { userId, redirectToSignIn } = await auth();

  // 3. لو مش مسجل دخول، وبيحاول يفتح صفحة مقفولة -> اطرده لصفحة اللوجن
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // تخطي ملفات النظام والصور
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // حماية مسارات الـ API
    '/(api|trpc)(.*)',
  ],
};

