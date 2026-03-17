"use client"
import { usePathname } from "next/navigation"
import { ClerkProvider } from '@clerk/nextjs'
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner"
import { ProfileGuard } from "@/components/profile-guard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  // المتغير ده بيحدد إحنا في صفحة عامة ولا جوه النظام
  const hideNavigation = isLandingPage || isAuthPage;

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-background">
        {!hideNavigation && <AppSidebar />}
          
        <main className={!hideNavigation ? "md:pl-64 pt-16 md:pt-0 transition-all duration-300" : ""}>
          
          {/* الحل هنا: الشرط ده بيمنع تشغيل الحارس في صفحات الهبوط وتسجيل الدخول */}
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