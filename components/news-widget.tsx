"use client"

import { useEffect, useState } from "react"
import { getNews, NewsItem, NewsType } from "@/lib/newsActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Newspaper, Pin, AlertTriangle, GraduationCap, Bell, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSmartNews } from "@/hooks/useSmartNews"


// ─── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NewsType, { label: string; icon: React.ReactNode; className: string }> = {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG", {
    month: "short",
    day: "numeric",
  })
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function NewsWidget() {


const { news, isLoading: loading } = useSmartNews("card");
  return (
    <Card dir="rtl">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Newspaper className="h-5 w-5" />
          آخر الأخبار
        </CardTitle>
        <Link href="/news">
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
            عرض الكل
            <ArrowLeft className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
          </div>
        ) : news.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد أخبار حالياً
          </p>
        ) : (
          news.map((item) => {
            const config = TYPE_CONFIG[item.type]
            return (
              <Link key={item.id} href="/news">
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