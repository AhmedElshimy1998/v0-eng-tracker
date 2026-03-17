"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { coursesCatalog } from "@/lib/courses"
import { getStudentRecords } from "@/lib/academicActions" // تأكد من وجود هذه الدالة عندك
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitFork, Info, CheckCircle2, Lock, PlayCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PrerequisitesVisualizer() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب بيانات الطالب الحقيقية عند التحميل
  useEffect(() => {
    const loadData = async () => {
      const records = await getStudentRecords();
      setStudentRecords(records || []);
      setLoading(false);
    };
    loadData();
  }, []);

  // 2. بناء "خريطة العلاقات" (مين بيفتح مين)
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

  // 3. دالة تحديد حالة المادة للطالب الحالي
  const getCourseStatus = (courseCode: string) => {
    const record = studentRecords.find(r => r.courseCode === courseCode);
    if (record && record.grade !== 'F' && record.grade !== '-') return 'completed'; // ناجح
    
    const course = coursesCatalog.find(c => c.code === courseCode);
    if (!course) return 'locked';

    const hasPrereqs = course.prerequisites.every(p => {
      const pr = studentRecords.find(r => r.courseCode === p);
      return pr && pr.grade !== 'F' && pr.grade !== '-';
    });

    return hasPrereqs ? 'available' : 'locked';
  };

  const activeCourse = selectedCourse ? coursesCatalog.find(c => c.code === selectedCourse) : null;
  const unlocks = selectedCourse ? (relations.get(selectedCourse) || []) : [];

  if (loading) return <div className="p-20 text-center text-cyan-500 animate-pulse">جاري فحص سجلاتك الأكاديمية...</div>;

  return (
    <div className="space-y-8 p-4 md:p-8" dir="rtl">
      {/* Header مع إحصائية سريعة */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <Zap className="text-yellow-500 fill-yellow-500 h-8 w-8" /> رادار المسارات الذكي
          </h2>
          <p className="text-muted-foreground text-sm mt-1">حلل موقفك الأكاديمي الحالي واعرف المواد اللي "واقفة في زور" مستقبلك.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
        {/* قائمة المواد - ملونة حسب حالتك */}
        <Card className="lg:col-span-1 p-4 overflow-y-auto bg-black/40 border-white/5 custom-scrollbar">
          <div className="space-y-6">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground/50 pr-2">المستوى {level}</p>
                <div className="grid grid-cols-1 gap-1">
                  {coursesCatalog.filter(c => c.idealSemester.includes(`Level ${level}`)).map(course => {
                    const status = getCourseStatus(course.code);
                    return (
                      <button
                        key={course.code}
                        onClick={() => setSelectedCourse(course.code)}
                        className={cn(
                          "text-right p-2.5 rounded-lg text-xs transition-all border flex items-center justify-between group",
                          selectedCourse === course.code ? "ring-2 ring-cyan-500 border-transparent" : "border-transparent",
                          status === 'completed' ? "bg-green-500/10 text-green-500" :
                          status === 'available' ? "bg-yellow-500/10 text-yellow-500" : "bg-white/5 text-muted-foreground opacity-60"
                        )}
                      >
                        <span className="truncate">{course.arabicName}</span>
                        {status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : 
                         status === 'available' ? <PlayCircle className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* مساحة التحليل الديناميكي */}
        <Card className="lg:col-span-3 bg-[#0a0a0a] border-white/5 relative overflow-hidden flex items-center justify-center p-4">
          {!selectedCourse ? (
            <div className="text-center space-y-4">
               <GitFork className="h-16 w-16 mx-auto text-white/5" />
               <p className="text-muted-foreground">اختر مادة من القائمة اليمنى لعرض شجرتها وموقفك منها</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col md:flex-row items-center justify-between px-4 relative z-10 gap-8">
              
              {/* 1. المتطلبات (اليمين) */}
              <div className="flex flex-col gap-3 w-full md:w-1/4">
                <span className="text-[10px] text-center font-bold text-red-500 uppercase">عشان تفتحها لازم تخلص:</span>
                {activeCourse?.prerequisites.length ? activeCourse.prerequisites.map(p => {
                  const pInfo = coursesCatalog.find(c => c.code === p);
                  const pStatus = getCourseStatus(p);
                  return (
                    <div key={p} className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      pStatus === 'completed' ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5 animate-pulse"
                    )}>
                      <p className="text-xs font-bold">{pInfo?.arabicName || p}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                         {pStatus === 'completed' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Lock className="h-3 w-3 text-red-500" />}
                         <span className="text-[9px]">{p}</span>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-green-500 text-center italic">مادة انطلاق (بدون متطلبات)</p>}
              </div>

              {/* 2. المادة المركزية */}
              <div className="relative group">
                <div className={cn(
                  "p-8 rounded-3xl border-4 text-center min-w-[220px] transition-all duration-500 shadow-2xl",
                  getCourseStatus(activeCourse!.code) === 'completed' ? "bg-green-600 border-green-400 shadow-green-500/20" :
                  getCourseStatus(activeCourse!.code) === 'available' ? "bg-yellow-600 border-yellow-400 shadow-yellow-500/20" : "bg-zinc-800 border-zinc-600 shadow-white/5"
                )}>
                  <h4 className="font-black text-xl text-white mb-1">{activeCourse?.arabicName}</h4>
                  <p className="text-xs opacity-80 font-mono tracking-tighter">{activeCourse?.code}</p>
                  <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-bold">
                    حالتك الحالية: {
                      getCourseStatus(activeCourse!.code) === 'completed' ? "✅ تم الاجتياز" :
                      getCourseStatus(activeCourse!.code) === 'available' ? "⚡ جاهزة للتسجيل" : "🔒 مغلقة"
                    }
                  </div>
                </div>
              </div>

              {/* 3. المواد اللي هتفتح (اليسار) */}
              <div className="flex flex-col gap-3 w-full md:w-1/4">
                <span className="text-[10px] text-center font-bold text-green-500 uppercase">لما تخلصها هتفتح لك:</span>
                {unlocks.length ? unlocks.map(u => {
                  const uInfo = coursesCatalog.find(c => c.code === u);
                  return (
                    <div key={u} className="p-3 rounded-xl border border-white/10 bg-black/40 text-center hover:border-cyan-500 transition-colors">
                      <p className="text-xs font-bold truncate">{uInfo?.arabicName || u}</p>
                      <Badge variant="outline" className="text-[9px] mt-1">{u}</Badge>
                    </div>
                  );
                }) : <p className="text-xs text-muted-foreground text-center italic">نهاية مسار أكاديمي</p>}
              </div>

            </div>
          )}
        </Card>
      </div>
    </div>
  )
}