"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, AlertTriangle, CheckCircle2, XCircle, Lock, Plus, Trash2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { calculateGPA, checkCanTake, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses"; 
import { SemesterData, StudentCourseRecord, Grade } from "@/lib/types";

export default function SemesterTrackerPage() {
  // 1. نضيف حالة (State) لمعرفة قسم الطالب
  const [studentDept, setStudentDept] = useState<string>("");

  useEffect(() => {
    // نجيب قسم الطالب من الإعدادات
    const savedDept = localStorage.getItem("studentDepartment");
    if (savedDept) setStudentDept(savedDept);
  }, []);

  // 2. نعمل فلترة للمواد بناءً على قسم الطالب 
  const displayCatalog = useMemo(() => {
    return coursesCatalog.filter(c => 
      c.department === "General" || c.department === studentDept
    );
  }, [studentDept]);

  // مسميات الفصول الرسمية
  const officialSemesters = [
    "Level Zero - Term 1", "Level Zero - Term 2", "Level Zero - Summer",
    "Level One - Term 1", "Level One - Term 2", "Level One - Summer",
    "Level Two - Term 1", "Level Two - Term 2", "Level Two - Summer",
    "Level Three - Term 1", "Level Three - Term 2", "Level Three - Summer",
    "Level Four - Term 1", "Level Four - Term 2", "Level Four - Summer"
  ];

  const [semesters, setSemesters] = useState<SemesterData[]>([]);

  const allStudentRecords = useMemo(() => semesters.flatMap(sem => sem.courses), [semesters]);
  const effectiveRecords = useMemo(() => getEffectiveRecords(allStudentRecords), [allStudentRecords]);
  const { gpa: cgpa, totalCredits: completedCredits, failedCredits } = useMemo(() => 
    calculateGPA(effectiveRecords, coursesCatalog), [effectiveRecords]);

  const warnings = useMemo(() => {
    let count = 0;
    semesters.forEach(sem => {
      const stats = calculateGPA(sem.courses, coursesCatalog);
      if (stats.totalCredits > 0 && stats.gpa < 2.0) count++;
    });
    return count;
  }, [semesters]);

  const handleAddSemester = (name: string) => {
    if (semesters.find(s => s.name === name)) return alert("هذا الفصل مضاف بالفعل");
    setSemesters([...semesters, { name, semesterGpa: 0, semesterCredits: 0, courses: [] }]);
  };

  const handleGradeChange = (semIndex: number, courseId: string, newGrade: Grade) => {
    const updated = [...semesters];
    const course = updated[semIndex].courses.find(c => c.id === courseId);
    if (course) {
      course.grade = newGrade;
      setSemesters(updated);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* الإحصائيات العلوية (نفس الكود السابق مع تحديث الـ Hover) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... كروت الإحصائيات ... */}
      </div>

      <Tabs defaultValue="academic-summary" className="space-y-6 mt-8">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger value="academic-summary" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base transition-all">
            الملخص الأكاديمي
          </TabsTrigger>
          <TabsTrigger value="semesters-management" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base transition-all">
            إدارة الفصول الدراسية
          </TabsTrigger>
        </TabsList>
        
        {/* التابة الأولى: الملخص الأكاديمي (تصميم الترمات المثالية) */}
        <TabsContent value="academic-summary" className="space-y-8 animate-in fade-in-50">
          {officialSemesters.map(semName => (
            <div key={semName} className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 border-r-4 border-primary pr-3">
                {semName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayCatalog.filter(c => c.idealSemester === semName).map(course => {
                  const attempts = allStudentRecords.filter(r => r.courseCode === course.code);
                  const lastAttempt = attempts[attempts.length - 1];
                  const successAttempt = attempts.find(a => !['F', 'Fail', 'Taken', '-'].includes(a.grade));
                  const canTake = checkCanTake(course.prerequisites, allStudentRecords);

                  let cardStyle = "border-muted opacity-40"; 
                  let statusBadge = null;

                  if (successAttempt) {
                    cardStyle = "border-green-500/40 bg-green-500/5";
                    statusBadge = <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{successAttempt.grade} | {successAttempt.semester}</Badge>;
                  } else if (lastAttempt?.grade === 'Taken') {
                    cardStyle = "border-blue-500/50 bg-blue-500/10 animate-pulse";
                    statusBadge = <Badge className="bg-blue-500/20 text-blue-400">قيد الدراسة</Badge>;
                  } else if (lastAttempt?.grade === 'F' || lastAttempt?.grade === 'Fail') {
                    cardStyle = "border-red-500/40 bg-red-500/5";
                    statusBadge = <Badge variant="destructive">{lastAttempt.grade === 'F' ? 'راسب' : 'راسب لائحة'}</Badge>;
                  } else if (canTake) {
                    cardStyle = "border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_10px_rgba(234,179,8,0.1)]";
                    statusBadge = <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">متاحة للتسجيل</Badge>;
                  }

                  return (
                    <div key={course.code} className={`border p-4 rounded-lg flex flex-col justify-between transition-all ${cardStyle}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-sm">{course.arabicName}</div>
                        {statusBadge}
                      </div>
                      <div className="text-xs text-muted-foreground">{course.code} • {course.credits} ساعة</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* التابة الثانية: إدارة الفصول الدراسية */}
        <TabsContent value="semesters-management" className="space-y-6">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">اختر الفصل الدراسي الرسمي لإضافته إلى سجلك:</p>
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary"
              onChange={(e) => { handleAddSemester(e.target.value); e.target.value = ""; }}
            >
              <option value="">+ إضافة فصل دراسي...</option>
              {officialSemesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {semesters.map((sem, semIndex) => (
              <Card key={sem.name}>
                {/* ... كود عرض المادة داخل الترم (نفس السابق) مع تعديل الـ Logic للسماح بالـ F ... */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/10">
                  <CardTitle className="text-md">{sem.name}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => {
                    const up = [...semesters]; up.splice(semIndex,1); setSemesters(up);
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                   {/* قائمة اختيار مادة جديدة للترم */}
                   <select 
                    className="w-full h-9 rounded-md border px-3 text-sm mb-4"
                    onChange={(e) => {
                      const code = e.target.value;
                      const updated = [...semesters];
                      updated[semIndex].courses.push({
                        id: Math.random().toString(),
                        courseCode: code,
                        semester: sem.name,
                        grade: "Taken",
                        points: 0,
                        isRetake: allStudentRecords.some(r => r.courseCode === code)
                      });
                      setSemesters(updated);
                      e.target.value = "";
                    }}
                   >
                    <option value="">+ تسجيل مادة في هذا الترم</option>
                    {displayCatalog.map(c => {
                      const hasPassed = allStudentRecords.some(r => r.courseCode === c.code && !['F', 'Fail', 'Taken'].includes(r.grade));
                      const isAlreadyInSem = sem.courses.some(r => r.courseCode === c.code);
                      const canTake = checkCanTake(c.prerequisites, allStudentRecords);
                      
                      // لا تظهر المادة لو نجح فيها أو هي موجودة فعلاً في هذا الترم
                      if (hasPassed || isAlreadyInSem) return null;

                      return <option key={c.code} value={c.code} disabled={!canTake}>{c.arabicName} {!canTake ? '🔒' : ''}</option>
                    })}
                   </select>

                   {sem.courses.map(record => {
                     const c = coursesCatalog.find(x => x.code === record.courseCode);
                     return (
                       <div key={record.id} className="flex items-center justify-between p-2 border rounded-md">
                         <div className="text-sm font-medium">{c?.arabicName}</div>
                         <select 
                          className="h-8 border rounded px-1 text-xs"
                          value={record.grade}
                          onChange={(e) => handleGradeChange(semIndex, record.id, e.target.value as Grade)}
                         >
                           {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "Fail", "Taken"].map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                       </div>
                     )
                   })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}