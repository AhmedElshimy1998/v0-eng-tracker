"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Newspaper, Pin, AlertTriangle, GraduationCap, Bell, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSmartNews } from "@/hooks/useSmartNews" // 🚀 استدعاء الهوك السحري

// ─── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  general: {
    label: "إشعار عام",
    icon: <Bell className="h-3 w-3" />,
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  exam: {
    label: "امتحانات",
    icon: <GraduationCap className="h-3 w-3" />,
    className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  warning: {
    label: "تنبيه",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ar-EG", {
    month: "short",
    day: "numeric",
  }).format(date)
}

export function NewsWidget() {
  // 🚀 السحر هنا: بنقول للهوك إحنا "الكارد"، فبيعتمد على الكاش لمدة ساعة (أو بياخد الفريش من الصفحة)
  const { news, isLoading } = useSmartNews("card")

  // ترتيب الأخبار: المثبت أولاً، ثم الأحدث
  const sortedNews = [...news].sort((a: any, b: any) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // عرض آخر 4 أخبار فقط داخل الكارد (عشان نحافظ على شكل الداشبورد)
  const displayNews = sortedNews.slice(0, 4);

  return (
    <Card className="flex flex-col h-full border-muted-foreground/20 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Newspaper className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-lg">أحدث الإشعارات</CardTitle>
        </div>
        <Link href="/student/news">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-primary">
            عرض الكل
            <ArrowLeft className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-3 flex-1 flex flex-col gap-2 overflow-y-auto">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">جاري التحديث...</p>
          </div>
        ) : displayNews.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4 border-2 border-dashed rounded-lg border-muted">
            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">لا توجد إشعارات حالياً</p>
          </div>
        ) : (
          displayNews.map((item) => {
            const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.general
            
            return (
              <Link key={item.id} href={`/student/news`}>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent transition-colors cursor-pointer">
                  {/* Icon */}
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${config.className}`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {item.pinned && (
                        <Pin className="h-3 w-3 text-primary shrink-0" />
                      )}
                      <Badge variant="outline" className={`text-[10px] py-0 gap-1 ${config.className}`}>
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground mr-auto">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}