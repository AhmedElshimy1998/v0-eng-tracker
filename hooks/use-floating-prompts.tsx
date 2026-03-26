"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
// استيراد دالة التسجيل من السيرفس الخاص بك
import { registerServiceWorker } from '@/lib/notification-service' 

interface PromptContextType {
  activePrompts: string[]
  register: (id: string) => void
  unregister: (id: string) => void
  handleAutoPushRegistration: () => Promise<void> 
}

const PromptContext = createContext<PromptContextType | undefined>(undefined)

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [activePrompts, setActivePrompts] = useState<string[]>([])

  const register = useCallback((id: string) => {
    setActivePrompts((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const unregister = useCallback((id: string) => {
    setActivePrompts((prev) => prev.filter((p) => p !== id))
  }, [])

  // ⭐ استخدام الدالة الجاهزة من السيرفس الخاص بك
  const handleAutoPushRegistration = useCallback(async () => {
    if (typeof window !== "undefined" && Notification.permission === "granted") {
      console.log("[PromptProvider] Initiating auto-registration...");
      await registerServiceWorker(); // هتعمل الـ subscribe وتحفظ في الـ KV أوتوماتيك
    }
  }, []);

  // تشغيل التسجيل تلقائياً بمجرد توفر الصلاحية
  useEffect(() => {
    handleAutoPushRegistration();
  }, [handleAutoPushRegistration]);

  return (
    <PromptContext.Provider value={{ activePrompts, register, unregister, handleAutoPushRegistration }}>
      {children}
    </PromptContext.Provider>
  )
}

export function usePromptManager() {
  const context = useContext(PromptContext)
  if (context === undefined) {
    throw new Error('usePromptManager must be used within a PromptProvider')
  }
  return context
}