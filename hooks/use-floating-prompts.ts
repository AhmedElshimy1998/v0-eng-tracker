import { create } from 'zustand' // لو مش عندك zustand ممكن نستخدم State عادية في الـ Context

// ده مخزن بسيط عشان الكروت تعرف بعضها
interface PromptStore {
  activePrompts: string[]
  register: (id: string) => void
  unregister: (id: string) => void
}

import { create as createStore } from 'zustand'

export const usePromptManager = createStore<PromptStore>((set) => ({
  activePrompts: [],
  register: (id) => set((state) => ({ 
    activePrompts: state.activePrompts.includes(id) ? state.activePrompts : [...state.activePrompts, id] 
  })),
  unregister: (id) => set((state) => ({ 
    activePrompts: state.activePrompts.filter(p => p !== id) 
  })),
}))