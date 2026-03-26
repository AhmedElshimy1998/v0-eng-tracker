"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, X, BellRing } from "lucide-react"

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // 1. التأكد أن المتصفح يدعم الإشعارات
    if (!("Notification" in window)) {
      setIsSupported(false)
      return
    }

    // 2. فحص الحالة: لو "default" يعني لسه مسألناهوش، لو "denied" يعني رافض
    // إحنا عايزينه يظهر لو مش "granted" (يعني مش مفعل)
    if (Notification.permission !== "granted") {
      // فحص لو قفل النافذة في الجلسة الحالية (عشان متبقاش مزعجة جداً أثناء التنقل)
      const isClosedInSession = sessionStorage.getItem("push-prompt-closed")
      if (isClosedInSession !== "true") {
        setIsVisible(true)
      }
    }
  }, [])

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setIsVisible(false)
        console.log("✅ تم تفعيل الإشعارات بنجاح!")
        // هنا المكون اللي إنت عامله (NotificationManager) هيكمل شغل التسجيل
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem("push-prompt-closed", "true")
  }

  if (!isVisible || !isSupported) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[99] md:left-auto md:right-8 md:bottom-32 md:w-96 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card className="p-4 shadow-2xl border-yellow-500/20 bg-background/95 backdrop-blur-md border-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg h-fit">
              <BellRing className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-right">فعل التنبيهات الذكية</h3>
              <p className="text-xs text-muted-foreground mt-1 text-right leading-relaxed">
                لا تفوت محاضراتك! فعل الإشعارات لتصلك تنبيهات قبل الموعد بـ 30 و 15 دقيقة.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full shrink-0" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button 
            className="w-full text-xs h-9 font-bold bg-yellow-600 hover:bg-yellow-700 text-white" 
            onClick={handleEnable}
          >
            تفعيل الآن
          </Button>
          <Button variant="outline" className="w-full text-xs h-9" onClick={handleClose}>
            ليس الآن
          </Button>
        </div>
      </Card>
    </div>
  )
}