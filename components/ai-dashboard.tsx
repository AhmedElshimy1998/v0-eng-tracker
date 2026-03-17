"use client"

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit, Target, Briefcase, AlertCircle, Sparkles } from "lucide-react";
import { getSmartAnalysis } from "@/lib/aiActions";

export function AIDashboard() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSmartAnalysis().then(data => {
      setAnalysis(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <BrainCircuit className="h-12 w-12 text-cyan-500 animate-pulse" />
      <p className="text-muted-foreground animate-bounce">الذكاء الاصطناعي يحلل ملفك الأكاديمي الآن...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4" dir="rtl">
      
      {/* Widget 1: التحليل المهني */}
      <Card className="border-cyan-500/20 bg-cyan-500/5 lg:col-span-2">
        <CardHeader className="flex flex-row items-center gap-3">
          <Sparkles className="text-cyan-500 h-6 w-6" />
          <CardTitle className="text-xl">رؤية المستشار الذكي</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-slate-300 italic">"{analysis.careerInsight}"</p>
        </CardContent>
      </Card>

      {/* Widget 2: رادار المهارات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-red-500" /> توزيع القوى التقنية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkillBar label="البرمجة" value={analysis.skillsRadar.programming} color="bg-cyan-500" />
          <SkillBar label="الرياضيات" value={analysis.skillsRadar.math} color="bg-blue-500" />
          <SkillBar label="الإلكترونيات" value={analysis.skillsRadar.electronics} color="bg-purple-500" />
        </CardContent>
      </Card>

      {/* Widget 3: خطة التسجيل المقترحة */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-yellow-500" /> خطة الهجوم للترم القادم
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.battlePlan.map((item: any) => (
            <div key={item.code} className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-cyan-400">{item.course}</span>
                <Badge className="bg-red-500/20 text-red-400 border-none">{item.priority}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.advice}</p>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}

function SkillBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}