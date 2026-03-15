import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// تحديد المسارات المحمية (كل الموقع ما عدا صفحات معينة لو حابب)
const isProtectedRoute = createRouteMatcher([
  '/(.*)', // حماية كل المسارات
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect() // إجبار المستخدم على تسجيل الدخول
  }
})

export const config = {
  matcher: [
    // تخطي ملفات النظام والصور عشان الموقع يشتغل بسرعة
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // حماية مسارات الـ API
    '/(api|trpc)(.*)',
  ],
}
