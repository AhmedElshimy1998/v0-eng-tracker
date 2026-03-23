"use client"

import { useEffect, useState } from "react"
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  togglePin,
  NewsItem,
  NewsType,
} from "@/lib/newsActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Loader2, Plus, Trash2, Pin, PinOff,
  Pencil, Save, X, Newspaper, AlertTriangle,
  GraduationCap, Bell,
} from "lucide-react"

// ─── Types & Config ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: NewsType; label: string; icon: React.ReactNode }[] = [
  { value: "general", label: "إشعار عام",      icon: <Bell className="h-4 w-4" /> },
  { value: "exam",    label: "جدول امتحانات", icon: <GraduationCap className="h-4 w-4" /> },
  { value: "warning", label: "تنبيه مهم",      icon: <AlertTriangle className="h-4 w-4" /> },
]

const TYPE_BADGE: Record<NewsType, string> = {
  general: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  exam:    "bg-orange-500/10 text-orange-500 border-orange-500/20",
  warning: "bg-red-500/10 text-red-500 border-red-500/20",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  title: string
  body: string
  type: NewsType
  pinned: boolean
}

const EMPTY_FORM: FormState = { title: "", body: "", type: "general", pinned: false }

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminNewsPage() {
  const [news, setNews]         = useState<NewsItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  // Form
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState<FormState>(EMPTY_FORM)
  const [error, setError]           = useState("")

  // Load
  async function load() {
    setLoading(true)
    setNews(await getNews())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError("")
    setShowForm(true)
  }

  function openEdit(item: NewsItem) {
    setEditingId(item.id)
    setForm({ title: item.title, body: item.body, type: item.type, pinned: item.pinned })
    setError("")
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError("")
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("العنوان مطلوب"); return }
    if (!form.body.trim())  { setError("المحتوى مطلوب"); return }

    setSaving(true)
    const result = editingId
      ? await updateNews(editingId, form)
      : await createNews(form)

    if (!result.success) {
      setError(result.error ?? "حدث خطأ")
      setSaving(false)
      return
    }
    closeForm()
    await load()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return
    await deleteNews(id)
    await load()
  }

  async function handleTogglePin(id: string) {
    await togglePin(id)
    await load()
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">إدارة الأخبار</h2>
            <p className="text-muted-foreground">إضافة وتعديل وحذف الأخبار والإشعارات</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          خبر جديد
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/40 shadow-lg">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="flex items-center justify-between">
              <span>{editingId ? "تعديل الخبر" : "إضافة خبر جديد"}</span>
              <Button variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">

            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع الخبر</label>
              <div className="flex flex-wrap gap-3">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      form.type === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:border-primary/50"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان</label>
              <Input
                placeholder="عنوان الخبر أو الإشعار..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className="text-sm font-medium">المحتوى</label>
              <Textarea
                placeholder="اكتب تفاصيل الخبر هنا..."
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="min-h-[140px]"
              />
            </div>

            {/* Pin toggle */}
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div
                onClick={() => setForm((f) => ({ ...f, pinned: !f.pinned }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  form.pinned ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    form.pinned ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="text-sm font-medium">تثبيت الخبر في الأعلى</span>
            </label>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Save className="h-4 w-4" />
                }
                {editingId ? "حفظ التعديلات" : "نشر الخبر"}
              </Button>
              <Button variant="outline" onClick={closeForm}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* News list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4 border rounded-lg border-dashed">
          <Newspaper className="h-12 w-12 opacity-30" />
          <p>لا توجد أخبار منشورة بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Card
              key={item.id}
              className={`transition-all ${item.pinned ? "border-primary/40 bg-primary/5" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.pinned && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs">
                          <Pin className="h-3 w-3" />
                          مثبت
                        </Badge>
                      )}
                      <Badge variant="outline" className={`gap-1 text-xs ${TYPE_BADGE[item.type]}`}>
                        {TYPE_OPTIONS.find((t) => t.value === item.type)?.icon}
                        {TYPE_OPTIONS.find((t) => t.value === item.type)?.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {item.body}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePin(item.id)}
                      title={item.pinned ? "إلغاء التثبيت" : "تثبيت"}
                      className={item.pinned ? "text-primary" : "text-muted-foreground"}
                    >
                      {item.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}