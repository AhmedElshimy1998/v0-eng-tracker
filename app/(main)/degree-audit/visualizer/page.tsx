"use client"

import React, { useMemo, useState } from 'react'
import { coursesCatalog } from "@/lib/courses"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitFork, Info, ArrowLeft, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PrerequisitesVisualizer() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // 1. بناء منطق العلاقات
  const relations = useMemo(() => {
    const forward = new Map();
    coursesCatalog.forEach(course => {
      course.prerequisites.forEach(prereq => {
        if (!forward.has(prereq)) forward.set(prereq, []);
        forward.get(prereq).push(course.code);
      });
    });
    return forward;
  }, []);

  const activeCourse = selectedCourse ? coursesCatalog.find(c => c.code === selectedCourse) : null;
  const unlocks = selectedCourse ? (relations.get(selectedCourse) || []) : [];

  return (
    <div className="space-y-8 p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <GitFork className="text-cyan-500 h-8 w-8" /> مستكشف المسارات الأكاديمية
          </h2>
          <p className="text-muted-foreground text-sm">حلل "المواد العنقودية" وشوف مستقبلك الدراسي بيفتح فين.</p>
        </div>
        {selectedCourse && (
          <Badge variant="outline" className="text-cyan-500 border-cyan-500/50 bg-cyan-500/5 px-4 py-2">
            جاري تحليل: {activeCourse?.arabicName}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
        {/* قائمة المواد (الجانبية) */}
        <Card className="lg:col-span-1 p-4 overflow-y-auto bg-black/40 border-white/5 custom-scrollbar">
          <h3 className="font-bold text-sm mb-4 border-b border-white/10 pb-2 text-cyan-500">اختر المادة لتحليلها:</h3>
          <div className="space-y-6">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 pr-2">Level {level}</p>
                <div className="grid grid-cols-1 gap-1">
                  {coursesCatalog.filter(c => c.idealSemester.includes(`Level ${level}`)).map(course => (
                    <button
                      key={course.code}
                      onClick={() => setSelectedCourse(course.code)}
                      className={cn(
                        "text-right p-2.5 rounded-lg text-xs transition-all border flex items-center justify-between group",
                        selectedCourse === course.code 
                          ? "bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <span>{course.arabicName}</span>
                      <span className="text-[9px] opacity-40 group-hover:opacity-100">{course.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* مساحة الرسم (الوسطى) */}
        <Card className="lg:col-span-3 bg-[#0a0a0a] border-white/5 relative overflow-hidden flex items-center justify-center p-4">
          {!selectedCourse ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 animate-pulse">
              <div className="h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <Info className="h-10 w-10 opacity-20" />
              </div>
              <p className="text-sm">حدد مادة من القائمة اليمنى لعرض شجرة علاقاتها</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-between px-8 relative z-10">
              
              {/* خيوط الربط الخلفية (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" opacity="0.5" />
                  </marker>
                </defs>
                {/* هنا ممكن إضافة منطق رسم الخطوط لو العناصر ليها IDs ثابتة */}
              </svg>

              {/* 1. المتطلبات السابقة (اليمين) */}
              <div className="flex flex-col gap-4 items-center w-1/4">
                <Badge variant="secondary" className="mb-2 bg-red-500/10 text-red-500 border-none">متطلبات سابقة</Badge>
                {activeCourse?.prerequisites.length ? activeCourse.prerequisites.map(p => {
                  const pInfo = coursesCatalog.find(c => c.code === p);
                  return (
                    <div key={p} className="w-full p-3 rounded-xl border bg-black border-red-500/30 text-center relative group">
                      <p className="text-xs font-bold truncate">{pInfo?.arabicName || p}</p>
                      <span className="text-[9px] text-muted-foreground">{p}</span>
                      <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-red-500/30"></div>
                    </div>
                  );
                }) : <p className="text-[10px] text-muted-foreground italic">لا توجد متطلبات</p>}
              </div>

              {/* سهم اتجاهي */}
              <div className="flex-1 flex justify-center">
                <div className="h-[2px] w-full max-w-[100px] bg-gradient-to-l from-red-500/20 via-cyan-500 to-green-500/20 relative">
                   <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <ArrowLeft className="h-4 w-4 text-cyan-500" />
                   </div>
                </div>
              </div>

              {/* 2. المادة المختارة (المركز) */}
              <div className="w-1/3 flex flex-col items-center">
                <div className="p-8 rounded-2xl bg-cyan-600/10 border-2 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] text-center relative group animate-in zoom-in-95">
                  <Lightbulb className="absolute -top-3 -right-3 h-8 w-8 text-cyan-400 bg-[#0a0a0a] rounded-full p-1 border border-cyan-500/50" />
                  <h4 className="font-black text-lg text-white mb-1">{activeCourse?.arabicName}</h4>
                  <Badge className="bg-cyan-500 text-white hover:bg-cyan-500">{activeCourse?.code}</Badge>
                  <p className="text-[10px] text-cyan-300 mt-2 font-medium">{activeCourse?.credits} ساعات معتمدة</p>
                </div>
              </div>

              {/* سهم اتجاهي */}
              <div className="flex-1 flex justify-center">
                <div className="h-[2px] w-full max-w-[100px] bg-gradient-to-l from-cyan-500/20 to-green-500/20"></div>
              </div>

              {/* 3. ما تفتحه المادة (اليسار) */}
              <div className="flex flex-col gap-4 items-center w-1/4">
                <Badge variant="secondary" className="mb-2 bg-green-500/10 text-green-500 border-none">المواد المستفيدة</Badge>
                {unlocks.length ? unlocks.map(u => {
                  const uInfo = coursesCatalog.find(c => c.code === u);
                  return (
                    <div key={u} className="w-full p-3 rounded-xl border bg-black border-green-500/30 text-center relative">
                      <p className="text-xs font-bold truncate">{uInfo?.arabicName || u}</p>
                      <span className="text-[9px] text-muted-foreground">{u}</span>
                      <div className="absolute -right-4 top-1/2 w-4 h-[1px] bg-green-500/30"></div>
                    </div>
                  );
                }) : <p className="text-[10px] text-muted-foreground italic text-center">لا تفتح مواد أخرى (نهاية مسار)</p>}
              </div>

            </div>
          )}
          
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none"></div>
        </Card>
      </div>
    </div>
  )
}