"use client"

import { useEffect, useState } from "react"
import { getNews, NewsItem, NewsType } from "@/lib/newsActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Newspaper, Pin, AlertTriangle, GraduationCap, Bell } from "lucide-react"

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NewsType, {
  label: string
  icon: React.ReactNode
  cardClass: string
  badgeClass: string
}> = {
  general: {
    label: "إشعار عام",
    icon: <Bell className="h-4 w-4" />,
    cardClass: "border-blue-500/30 bg-blue-500/5",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  exam: {
    label: "جدول امتحانات",
    icon: <GraduationCap className="h-4 w-4" />,
    cardClass: "border-orange-500/30 bg-orange-500/5",
    badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  warning: {
    label: "تنبيه مهم",
    icon: <AlertTriangle className="h-4 w-4" />,
    cardClass: "border-red-500/30 bg-red-500/5",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
  },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<NewsType | "all">("all")

  useEffect(() => {
    getNews().then((data) => {
      setNews(data)
      setLoading(false)
    })
  }, [])

  const filtered = filter === "all" ? news : news.filter((n) => n.type === filter)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-24 gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-muted-foreground text-lg">جاري تحميل الأخبار...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Newspaper className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الأخبار والإشعارات</h2>
          <p className="text-muted-foreground">آخر الأخبار والإعلانات الهامة من الإدارة</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "general", "exam", "warning"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              filter === type
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-input hover:border-primary/50"
            }`}
          >
            {type === "all" ? "الكل" : TYPE_CONFIG[type].label}
            <span className="mr-2 opacity-60">
              ({type === "all" ? news.length : news.filter((n) => n.type === type).length})
            </span>
          </button>
        ))}
      </div>

      {/* News list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4 border rounded-lg border-dashed">
          <Newspaper className="h-12 w-12 opacity-30" />
          <p className="text-lg">لا توجد أخبار حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const config = TYPE_CONFIG[item.type]
            return (
              <Card
                key={item.id}
                className={`transition-all ${config.cardClass} ${
                  item.pinned ? "ring-1 ring-primary/30" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.pinned && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                          <Pin className="h-3 w-3" />
                          مثبت
                        </Badge>
                      )}
                      <Badge variant="outline" className={`gap-1 ${config.badgeClass}`}>
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}