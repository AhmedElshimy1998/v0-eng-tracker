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
  ArrowLeftRight, 
  Briefcase,
  RefreshCw,
  Zap
} from "lucide-react"
import { getSmartAnalysis } from "@/lib/aiActions"
import { cn } from "@/lib/utils"

export default function AIMentorPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalysis = async () => {
    setLoading(true)
    const result = await getSmartAnalysis()
    setData(result)
    setLoading(false)
  }

  useEffect(() => {
    loadAnalysis()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <BrainCircuit className="h-16 w-16 text-cyan-500 animate-pulse" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-bounce" />
        </div>
        <p className="text-muted-foreground font-medium">جاري تحليل بياناتك الأكاديمية والمهنية...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 md:p-8 pb-12" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" /> المستشار الأكاديمي الذكي
          </h1>
          <p className="text-muted-foreground mt-1">تحليل ذكاء اصطناعي مخصص لمسارك في هندسة الميكاترونيات.</p>
        </div>
        <Button onClick={loadAnalysis} variant="outline" className="gap-2 border-cyan-500/50 hover:bg-cyan-500/10">
          <RefreshCw className="h-4 w-4" /> تحديث التحليل
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* كارت الرؤية الجوهرية (AI Insight) */}
        <Card className="md:col-span-2 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-500">
              <Sparkles className="h-5 w-5" /> ملخص الحالة الاستراتيجي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed font-medium text-slate-200">
              {data.careerInsight}
            </p>
          </CardContent>
        </Card>

        {/* كارت الأداء المهني (Career Readiness) */}
        <Card className="border-white/5 bg-black/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" /> الجاهزية لسوق العمل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>الأنظمة المدمجة (Embedded)</span>
                <span className="text-cyan-500">90%</span>
              </div>
              <Progress value={90} className="h-1.5 bg-white/5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>الأتمتة والـ PLC</span>
                <span className="text-blue-500">85%</span>
              </div>
              <Progress value={85} className="h-1.5 bg-white/5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>التحكم الآلي</span>
                <span className="text-purple-500">70%</span>
              </div>
              <Progress value={70} className="h-1.5 bg-white/5" />
            </div>
          </CardContent>
        </Card>

        {/* كارت خطة الترم القادم (Battle Plan) */}
        <Card className="md:col-span-3 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" /> خطة الهجوم المقترحة (الترم القادم)
            </CardTitle>
            <CardDescription>مواد تم اختيارها بعناية لتوازن بين التحصيل الدراسي وخبرتك العملية في AstraZeneca.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.battlePlan.map((item: any, index: number) => (
              <div key={index} className="group p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={cn(
                    "bg-opacity-20 border-none",
                    item.priority === 'High' ? "bg-red-500 text-red-400" : "bg-yellow-500 text-yellow-400"
                  )}>
                    {item.priority === 'High' ? 'أولوية قصوى' : 'موصى به'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.code}</span>
                </div>
                <h4 className="font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">{item.course}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.advice}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* كارت النصيحة المهنية (Industrial Insight) */}
        <Card className="md:col-span-3 border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Briefcase className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-yellow-500">نصيحة من واقع الصناعة</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                بما أنك تعمل في <b>AstraZeneca</b>، فإن تميزك في مادة "التحكم الآلي" سيجعلك قادراً على فهم منطق عمل خطوط الإنتاج الدوائية بشكل أعمق، مما قد يفتح لك فرصاً للانتقال من الجانب الفني إلى الجانب الهندسي التصميمي للأتمتة.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}