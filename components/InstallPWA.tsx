"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Download } from "lucide-react"
import { usePromptManager } from "@/hooks/use-floating-prompts" // استيراد المنظم الخاص بك

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  // استخدام المنظم لترتيب الكروت
  const { activePrompts, register, unregister } = usePromptManager()
  const id = "pwa-install"

  useEffect(() => {
    // 1. التأكد أن المستخدم مش فاتح من الـ PWA فعلاً
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // 2. فحص السيشين (لو قفلها قبل كدة في نفس الجلسة)
    const isClosedInSession = sessionStorage.getItem("pwa-prompt-closed")
    if (isClosedInSession === "true") return

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
      register(id) // تسجيل الكرت عند ظهوره
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      unregister(id) // تنظيف السجل عند مغادرة الصفحة
    }
  }, [register, unregister])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsVisible(false)
      unregister(id) // حذف الكرت من المنظم بعد التثبيت بنجاح
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    unregister(id) // إبلاغ المنظم بالحذف فوراً لإعادة ترتيب الكروت الأخرى
    sessionStorage.setItem("pwa-prompt-closed", "true")
  }

  // حساب الموقع الديناميكي (Index * الارتفاع التقريبي + المسافة الأصلية)
  const index = activePrompts.indexOf(id)
  const bottomOffset = index !== -1 ? (index * 170) + 16 : 16

  if (!isVisible || index === -1) return null

  return (
    <div 
      style={{ bottom: `${bottomOffset}px` }}
      className="fixed left-4 right-4 z-[100] md:left-auto md:right-8 md:w-96 transition-all duration-500 ease-in-out"
    >
      <Card className="p-4 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md animate-in slide-in-from-bottom-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="bg-primary/10 p-2 rounded-lg h-fit">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-right">تثبيت Eng-Tracker</h3>
              <p className="text-xs text-muted-foreground mt-1 text-right leading-relaxed">
                ثبت التطبيق على جهازك للوصول السريع والمذاكرة أوفلاين.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full shrink-0" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="w-full text-xs h-9 font-bold" onClick={handleInstall}>
            تثبيت الآن
          </Button>
          <Button variant="outline" className="w-full text-xs h-9" onClick={handleClose}>
            ليس الآن
          </Button>
        </div>
      </Card>
    </div>
  )
}