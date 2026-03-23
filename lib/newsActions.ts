"use server"

import { kv } from "@vercel/kv"
import { checkIsAdmin } from "@/lib/adminActions"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type NewsType = "general" | "exam" | "warning"

export interface NewsItem {
  id: string
  title: string
  body: string
  type: NewsType
  pinned: boolean
  createdAt: string   // ISO string
  updatedAt: string   // ISO string
}

// ─── Keys ──────────────────────────────────────────────────────────────────────

const NEWS_KEY = "global-news"

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function readAll(): Promise<NewsItem[]> {
  const data = await kv.get<NewsItem[]>(NEWS_KEY)
  return data ?? []
}

async function writeAll(items: NewsItem[]): Promise<void> {
  await kv.set(NEWS_KEY, items)
}

// ─── Public (students) ─────────────────────────────────────────────────────────

/**
 * جلب كل الأخبار مرتبة: المثبتة أولاً ثم الأحدث
 */
export async function getNews(): Promise<NewsItem[]> {
  const items = await readAll()
  return items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

// ─── Admin only ────────────────────────────────────────────────────────────────

export async function createNews(
  data: Pick<NewsItem, "title" | "body" | "type" | "pinned">
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: "غير مصرح" }

  const items = await readAll()
  const now = new Date().toISOString()

  const newItem: NewsItem = {
    id: `news_${Date.now()}`,
    title: data.title.trim(),
    body: data.body.trim(),
    type: data.type,
    pinned: data.pinned,
    createdAt: now,
    updatedAt: now,
  }

  await writeAll([newItem, ...items])
  return { success: true }
}

export async function updateNews(
  id: string,
  data: Partial<Pick<NewsItem, "title" | "body" | "type" | "pinned">>
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: "غير مصرح" }

  const items = await readAll()
  const index = items.findIndex((i) => i.id === id)
  if (index === -1) return { success: false, error: "الخبر مش موجود" }

  items[index] = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await writeAll(items)
  return { success: true }
}

export async function deleteNews(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: "غير مصرح" }

  const items = await readAll()
  await writeAll(items.filter((i) => i.id !== id))
  return { success: true }
}

export async function togglePin(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: "غير مصرح" }

  const items = await readAll()
  const item = items.find((i) => i.id === id)
  if (!item) return { success: false, error: "الخبر مش موجود" }

  return updateNews(id, { pinned: !item.pinned })
}