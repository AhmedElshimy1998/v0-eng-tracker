"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, BookOpen, Calendar, Sun, Moon, GraduationCap, Settings, Shield, Map, Calculator, Menu, X , BrainCircuit, Newspaper} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { checkIsAdmin } from "@/lib/adminActions"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, prefetch: true },
  { name: "Subjects", href: "/subjects", icon: BookOpen, prefetch: true },
  { name: "Calendar", href: "/calendar", icon: Calendar, prefetch: true },
  { name: "Semester Tracker", href: "/semester-tracker", icon: GraduationCap, prefetch: true },
  { name: "AI Smart Advisor", href: "/ai-mentor", icon: BrainCircuit, prefetch: true },
  { name: "Degree Audit (الخريطة)", href: "/degree-audit", icon: Map, prefetch: true }, 
  { name: "GPA Simulator (المحاكاة)", href: "/simulator", icon: Calculator, prefetch: true }, 
  { name: "الأخبار والإشعارات", href: "/news", icon: Newspaper, prefetch: true },
  { name: "Settings", href: "/settings", icon: Settings, prefetch: true },
  { name: "Admin Dashboard", href: "/admin", icon: Shield, adminOnly: true, prefetch: false }, 
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  
  // حالة الموبايل
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    checkIsAdmin().then(setIsAdmin);
  }, []);

  // قفل القائمة أوتوماتيك لما تروح لصفحة جديدة على الموبايل
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* زرار الـ 3 شرط بيظهر على الموبايل بس */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background shadow-sm border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* خلفية شفافة لما القائمة تفتح في الموبايل (عشان لو دسنا برا تقفل) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* القائمة نفسها */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full" 
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6 mt-14 md:mt-0">
            {/* ضفنا mt-14 عشان في الموبايل الزرار ميكونش فوق اللوجو */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-l font-semibold text-sidebar-foreground truncate">Engineering Tracker</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              if (item.adminOnly && !isAdmin) return null;

              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={item.prefetch} /* <--- السطر السحري هنا */
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 shrink-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 shrink-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="ml-5">Toggle Theme</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}