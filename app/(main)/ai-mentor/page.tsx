"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Briefcase,
  RefreshCw,
  Zap,
  AlertTriangle,
  Lock // أضفنا أيقونة القفل
} from "lucide-react"
import { getSmartAnalysis } from "@/lib/aiActions"
import { cn } from "@/lib/utils"

export default function AIMentorPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      const result = await getSmartAnalysis()
      
      // فحص إذا تم الوصول للحد الأقصى (24 ساعة)
      if (result?.isLimitReached) {
        setData({ limitMessage: result.message }); 
        return;
      }

      // لو البيانات رجعت بنجاح
      if (result) {
        setData(result)
      } else {
        // لو الـ Backend رجع null بسبب خطأ
        setData(null)
      }
    } catch (error) {
      // لو حصل Timeout أو خطأ في الاتصال
      console.error("Failed to load analysis:", error);
      setData(null);
    } finally {
      // إيقاف اللودينج في جميع الحالات (نجاح أو فشل)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalysis()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <BrainCircuit className="h-16 w-16 text-cyan-500 animate-pulse" />
        <p className="text-muted-foreground animate-bounce">جاري استشارة المرشد الذكي...</p>
      </div>
    )
  }

  // 1. عرض رسالة القيد (لو ممرش 24 ساعة)
  if (data?.limitMessage) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center space-y-6" dir="rtl">
        <div className="bg-yellow-500/10 p-6 rounded-full border border-yellow-500/20">
          <Lock className="h-12 w-12 text-yellow-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-arabic">المستشار في استراحة قصيرة</h2>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {data.limitMessage}
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => window.history.back()} className="border-white/10 hover:bg-white/5">العودة للرئيسية</Button>
        </div>
      </div>
    )
  }

  // 2. معالجة حالة الخطأ العادية (لو البيانات ناقصة)
  if (!data || data.completionRate === undefined) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center p-6">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <p>لم نتمكن من الحصول على تحليل دقيق. تأكد من إكمال سجلاتك الدراسية أولاً.</p>
        <Button onClick={loadAnalysis}>إعادة المحاولة</Button>
      </div>
    )
  }

  // 3. عرض لوحة البيانات (Dashboard) في حالة النجاح
  return (
    <div className="space-y-8 p-4 md:p-8 pb-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" /> المستشار الأكاديمي الذكي
          </h1>
          <p className="text-muted-foreground mt-1">تحليل مخصص بناءً على سجلاتك في قاعدة البيانات.</p>
        </div>
        <Button onClick={loadAnalysis} variant="outline" className="gap-2 border-cyan-500/50 hover:bg-cyan-500/10">
          <RefreshCw className="h-4 w-4" /> تحديث التحليل
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* كارت نسبة الإنجاز */}
        <Card className="md:col-span-3 border-none bg-gradient-to-l from-cyan-900/20 to-transparent">
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-bold">نسبة إنجازك في اللائحة</h3>
              <span className="text-3xl font-black text-cyan-500">{data.completionRate}%</span>
            </div>
            <Progress value={data.completionRate} className="h-3 bg-white/5" />
          </CardContent>
        </Card>

        {/* كارت ملخص الحالة الاستراتيجي */}
        <Card className="md:col-span-2 border-cyan-500/20 bg-cyan-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-500">
              <Sparkles className="h-5 w-5" /> ملخص الحالة الاستراتيجي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-slate-200">
              {data.academicAnalysis}
            </p>
            {data.bottleneckCourse && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm"><b>تنبيه عنق الزجاجة:</b> ركز على مادة <b>{data.bottleneckCourse}</b> لأنها تفتح مسارات هامة.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* كارت الرؤية المهنية */}
        <Card className="border-white/5 bg-black/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-yellow-500" /> الرؤية المهنية
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-xs text-slate-300 leading-relaxed italic">
               {data.careerRoadmap || "استكمل بياناتك المهنية للحصول على نصيحة مخصصة."}
             </p>
          </CardContent>
        </Card>

        {/* كارت خطة الهجوم (Battle Plan) */}
        <Card className="md:col-span-3 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" /> المواد المقترحة للترم القادم
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.battlePlan?.map((item: any, index: number) => (
              <div key={index} className="p-4 rounded-xl border border-white/5 bg-white/5 group hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="text-cyan-500 border-cyan-500/30">{item.code}</Badge>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    item.priority === 'High' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                  )}>{item.priority}</span>
                </div>
                <h4 className="font-bold mb-1">{item.name}</h4>
                <p className="text-[10px] text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}