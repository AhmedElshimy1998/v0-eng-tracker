"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellRing, CalendarDays, Loader2, BookOpen } from "lucide-react";
import { useSmartNews } from "@/hooks/useSmartNews"; // 🚀 استدعاء الهوك الجديد

export default function NewsPage() {
  // 🚀 سطر واحد جاب الداتا، وحط حالة التحميل، وطبق نظام الكاش (5 دقايق للصفحة)
  const { news, isLoading } = useSmartNews("page");

  // ترتيب الأخبار من الأحدث للأقدم (عشان لو مش مترتبة من السيرفر)
  const sortedNews = [...news].sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">جاري جلب أحدث الأخبار...</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mb-4">
          <BellRing className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-bold">لا توجد أخبار حالياً</h2>
        <p className="text-muted-foreground max-w-md">
          لم تقم الإدارة بنشر أي إشعارات أو أخبار جديدة حتى الآن. يرجى العودة لاحقاً.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">لوحة الإعلانات والأخبار</h1>
          <p className="text-muted-foreground text-lg">
            تابع أحدث القرارات، الجداول، والإشعارات الأكاديمية الهامة.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit text-sm px-3 py-1">
          {news.length} إعلانات
        </Badge>
      </div>

      {/* قائمة الأخبار */}
      <div className="grid gap-6">
        {sortedNews.map((item) => {
          // تنسيق التاريخ والوقت
          const dateObj = new Date(item.createdAt);
          const formattedDate = dateObj.toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <Card key={item.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
              <CardHeader className={`${item.type === 'alert' ? 'bg-red-500/5 pb-4' : item.type === 'event' ? 'bg-blue-500/5 pb-4' : 'bg-muted/30 pb-4'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl md:text-2xl leading-relaxed">
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground pt-1">
                      <CalendarDays className="h-4 w-4 mr-1 ml-2 inline" />
                      <span>{formattedDate} - {formattedTime}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={item.type === 'alert' ? "destructive" : item.type === 'event' ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {item.type === 'alert' ? 'هام جداً' : item.type === 'event' ? 'فعالية' : 'إعلان عام'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardDescription className="text-base md:text-lg text-foreground leading-loose whitespace-pre-wrap">
                  {item.content}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}