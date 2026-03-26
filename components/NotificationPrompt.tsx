"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BellRing, X } from "lucide-react"
import { usePromptManager } from "@/hooks/use-floating-prompts" 

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  
  // نفتح القوس مرة واحدة ونجلب كل اللي محتاجينه هنا
  const { 
    activePrompts, 
    register, 
    unregister, 
    handleAutoPushRegistration 
  } = usePromptManager()
  
  const id = "push-notif"

  useEffect(() => {
    if (!("Notification" in window)) return

    if (Notification.permission !== "granted") {
      const isClosedInSession = sessionStorage.getItem("push-prompt-closed")
      if (isClosedInSession !== "true") {
        setIsVisible(true)
        register(id)
      }
    }

    return () => unregister(id)
  }, [register, unregister])

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setIsVisible(false)
        unregister(id)
        // بننادي على الدالة هنا مباشرة من غير ما نعرف unregister تاني
        await handleAutoPushRegistration() 
      }
    } catch (error) {
      console.error("Error requesting permission:", error)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    unregister(id)
    sessionStorage.setItem("push-prompt-closed", "true")
  }

  const index = activePrompts.indexOf(id)
  const bottomOffset = index !== -1 ? (index * 210) + 16 : 16

  if (!isVisible || index === -1) return null

  return (
    <div 
      style={{ bottom: `${bottomOffset}px` }}
      className="fixed left-4 right-4 z-[99] md:left-auto md:right-8 md:w-96 transition-all duration-500 ease-in-out"
    >
      <Card className="p-5 mb-4 shadow-2xl border-yellow-500/20 bg-background/95 backdrop-blur-md border-2 animate-in slide-in-from-bottom-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 text-right">
            <div className="bg-yellow-500/10 p-2 rounded-lg h-fit">
              <BellRing className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">فعل التنبيهات الذكية</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
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