import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <div className="container mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
