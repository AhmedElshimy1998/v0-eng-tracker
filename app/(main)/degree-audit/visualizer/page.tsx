"use client"

import React, { useMemo, useState } from 'react'
import { coursesCatalog } from "@/lib/courses"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, GitFork, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PrerequisitesVisualizer() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // بناء شجرة العلاقات
  const relations = useMemo(() => {
    const forward = new Map(); // المادة بتفتح إيه؟
    
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
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <GitFork className="text-cyan-500" /> مستكشف المسارات الأكاديمية
        </h2>
        <p className="text-muted-foreground">اضغط على أي مادة لتكتشف "المواد العنقودية" وما تفتحه من مسارات مستقبلاً.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قائمة المواد - مقسمة حسب المستويات */}
        <Card className="p-4 h-[70vh] overflow-y-auto bg-sidebar/50">
          <h3 className="font-bold mb-4 border-b pb-2">اختر المادة لتحليلها:</h3>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level}>
                <p className="text-xs font-bold text-cyan-500 mb-2">Level {level}</p>
                <div className="grid grid-cols-1 gap-2">
                  {coursesCatalog.filter(c => c.idealSemester.includes(`Level ${level}`)).map(course => (
                    <button
                      key={course.code}
                      onClick={() => setSelectedCourse(course.code)}
                      className={cn(
                        "text-right p-2 rounded-lg text-sm transition-all border",
                        selectedCourse === course.code 
                          ? "bg-cyan-500/20 border-cyan-500 text-white" 
                          : "bg-background hover:border-cyan-500/50"
                      )}
                    >
                      {course.arabicName}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* الشجرة التفاعلية (Visualizer) */}
        <Card className="lg:col-span-2 p-6 bg-grid-white/[0.02] relative overflow-hidden">
          {!selectedCourse ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <Info className="h-12 w-12 opacity-20" />
              <p>حدد مادة من القائمة اليمنى لعرض شجرة علاقاتها</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* القسم الأول: المتطلبات (ماذا تحتاج؟) */}
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs text-muted-foreground">متطلبات سابقة (Prerequisites)</span>
                <div className="flex flex-wrap justify-center gap-4">
                  {activeCourse?.prerequisites.length ? activeCourse.prerequisites.map(p => {
                    const pInfo = coursesCatalog.find(c => c.code === p);
                    return (
                      <div key={p} className="p-3 rounded-xl border bg-red-500/5 border-red-500/20 text-center min-w-[120px]">
                        <p className="text-xs font-bold">{pInfo?.arabicName || p}</p>
                        <Badge variant="outline" className="text-[9px] mt-1">{p}</Badge>
                      </div>
                    );
                  }) : <p className="text-sm text-green-500">لا توجد متطلبات (مادة بداية مسار)</p>}
                </div>
              </div>

              {/* القسم الأوسط: المادة المختارة */}
              <div className="flex justify-center relative">
                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                 </div>
                 <div className="z-10 p-6 rounded-2xl bg-cyan-600 shadow-[0_0_30px_rgba(6,182,212,0.4)] border-2 border-cyan-400 text-center min-w-[200px]">
                    <h4 className="font-black text-lg">{activeCourse?.arabicName}</h4>
                    <p className="text-xs opacity-80">{activeCourse?.code}</p>
                 </div>
              </div>

              {/* القسم الثالث: ما تفتحه المادة (Unlocks) */}
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs text-muted-foreground">تفتح لك هذه المواد مستقبلاً (Post-requisites)</span>
                <div className="flex flex-wrap justify-center gap-4">
                  {unlocks.length ? unlocks.map(u => {
                    const uInfo = coursesCatalog.find(c => c.code === u);
                    return (
                      <div key={u} className="p-3 rounded-xl border bg-green-500/5 border-green-500/20 text-center min-w-[120px]">
                        <p className="text-xs font-bold">{uInfo?.arabicName || u}</p>
                        <Badge variant="outline" className="text-[9px] mt-1">{u}</Badge>
                      </div>
                    );
                  }) : <p className="text-sm text-muted-foreground">هذه المادة هي نهاية مسارها الأكاديمي</p>}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}