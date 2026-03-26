"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface PromptContextType {
  activePrompts: string []
  register: (id: string) => void
  unregister: (id: string) => void
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

  return (
    <PromptContext.Provider value={{ activePrompts, register, unregister }}>
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