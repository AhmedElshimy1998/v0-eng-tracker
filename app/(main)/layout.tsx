"use client"
import { usePathname } from "next/navigation"
import { ClerkProvider } from '@clerk/nextjs'
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner"
import { ProfileGuard } from "@/components/profile-guard";
import { useEffect } from "react";
import { saveAcademicProfile } from "@/lib/academicActions";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/news");

  // المتغير ده بيحدد إحنا في صفحة عامة ولا جوه النظام
  const hideNavigation = isLandingPage || isAuthPage;

  // --- مراقب المزامنة الذكي للبيانات الأكاديمية (Sync Engine) ---
  useEffect(() => {
    const handleOnline = async () => {
      // نتأكد الأول إن فيه تعديلات اتعملت أوفلاين ومحتاجة تترفع
      const needsSync = localStorage.getItem("academic-needs-sync");
      
      if (needsSync === "true") {
        try {
          const localStr = localStorage.getItem("studyhub-academic-profile");
          if (localStr) {
            const profileObj = JSON.parse(localStr);
            
            // رفع الفصول الدراسية والتحديث الزمني للسيرفر
            await saveAcademicProfile({ 
              semesters: profileObj.semesters, 
              lastUpdated: profileObj.lastUpdated || Date.now() 
            });
            
            // لو الرفع نجح، نلغي علامة المزامنة
            localStorage.setItem("academic-needs-sync", "false");
            console.log("Academic data synced successfully after reconnecting!");
          }
        } catch(e) {
          console.error("Academic background sync failed, will retry later.");
        }
      }
    };

    // تشغيل الدالة فوراً عند لقط الإنترنت
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  // --------------------------------------------------------------

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-background">
        {!hideNavigation && <AppSidebar />}
          
        <main className={!hideNavigation ? "md:pl-64 pt-16 md:pt-0 transition-all duration-300" : ""}>
          
          {/* الشرط ده بيمنع تشغيل الحارس في صفحات الهبوط وتسجيل الدخول */}
          {hideNavigation ? (
            children
          ) : (
            <div className="container mx-auto max-w-7xl p-6 lg:p-8">
              <ProfileGuard>
                {children}
              </ProfileGuard>
            </div>
          )}
          
        </main>

        <Toaster richColors position="top-right" />
      </div>
    </ClerkProvider>
  )
}