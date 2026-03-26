"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Download } from "lucide-react"

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 1. التأكد أن المستخدم مش فاتح من الـ PWA فعلاً
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // 2. التأكد أن المستخدم مقفلش النافذة في الجلسة الحالية (Session)
    const isClosedInSession = sessionStorage.getItem("pwa-prompt-closed")
    if (isClosedInSession === "true") return

    // 3. الإمساك بحدث التثبيت
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    // حفظ حالة الإغلاق في السيشين فقط (تروح لما يقفل التابة/المتصفح)
    sessionStorage.setItem("pwa-prompt-closed", "true")
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96 animate-in slide-in-from-bottom-10 duration-500">
      <Card className="p-4 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="bg-primary/10 p-2 rounded-lg h-fit">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">تثبيت StudyHub</h3>
              <p className="text-xs text-muted-foreground mt-1">
                ثبت التطبيق على جهازك للوصول السريع والمذاكرة أوفلاين.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="w-full text-xs h-9" onClick={handleInstall}>
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