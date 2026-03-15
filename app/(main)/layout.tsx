"use client"
import { usePathname } from "next/navigation"
import { ClerkProvider } from '@clerk/nextjs'
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  return (
      <ClerkProvider>
          <div className="min-h-screen bg-background">
                {!isLandingPage && <AppSidebar />}
                      
                            {/* الـ Padding اليساري pl-64 يطبق فقط إذا لم تكن صفحة الهبوط */}
                                  <main className={!isLandingPage ? "pl-64" : ""}>
                                          <div className="container mx-auto max-w-7xl p-6 lg:p-8">
                                                    {children}
                                                            </div>
                                                                  </main>

                                                                        <Toaster richColors position="top-right" />
                                                                            </div>
                                                                              </ClerkProvider>
                                                                              )
                                                                              
  )
}
