"use client";

import { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, AlertTriangle, CheckCircle2, XCircle, Lock, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// استيراد الدوال والأنواع من ملفات اللوجيك
import { calculateGPA, checkCanTake, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses"; 
import { SemesterData, StudentCourseRecord, Grade } from "@/lib/types";

export default function SemesterTrackerPage() {
  // حالة (State) بتحتفظ بسجل الطالب بالكامل
  const [semesters, setSemesters] = useState<SemesterData[]>([
    {
      name: "Level Zero - Term 1",
      semesterGpa: 0,
      semesterCredits: 0,
      courses: [
        { id: "1", courseCode: "EMP 011", semester: "Level Zero - Term 1", grade: "A", points: 4, isRetake: false },
        { id: "2", courseCode: "HUM 011", semester: "Level Zero - Term 1", grade: "C-", points: 1.7, isRetake: false },
      ]
    }
  ]);

  // تجميع كل المواد اللي الطالب سجلها في مصفوفة واحدة
  const allStudentRecords = useMemo(() => {
    return semesters.flatMap(sem => sem.courses);
  }, [semesters]);

  // حساب السجلات الفعالة (إلغاء تأثير الـ F القديمة في حالة الإعادة)
  const effectiveRecords = useMemo(() => {
    return getEffectiveRecords(allStudentRecords);
  }, [allStudentRecords]);

  // حساب التراكمي الكلي (CGPA) والساعات
  const { gpa: cgpa, totalCredits: completedCredits, failedCredits } = useMemo(() => {
    return calculateGPA(effectiveRecords, coursesCatalog);
  }, [effectiveRecords]);

  // حساب الإنذارات (عدد الترمات اللي معدلها أقل من 2.0)
  const warnings = useMemo(() => {
    let count = 0;
    semesters.forEach(sem => {
      const semStats = calculateGPA(sem.courses, coursesCatalog);
      // بنحسب الإنذار لو الترم فيه مواد مسجلة ومعدله أقل من 2
      if (semStats.totalCredits > 0 && semStats.gpa < 2.0) count++;
    });
    return count;
  }, [semesters]);

  // دوال التفاعل مع الواجهة
  const handleAddSemester = () => {
    const newSemName = prompt("أدخل اسم الفصل الدراسي (مثال: Level One - Term 1):");
    if (!newSemName) return;
    setSemesters([...semesters, { name: newSemName, semesterGpa: 0, semesterCredits: 0, courses: [] }]);
  };

  const handleDeleteSemester = (semIndex: number) => {
    if(confirm("هل أنت متأكد من حذف هذا الفصل الدراسي بالكامل؟")) {
      const updated = [...semesters];
      updated.splice(semIndex, 1);
      setSemesters(updated);
    }
  };

  const handleAddCourseToSemester = (semIndex: number, courseCode: string) => {
    if (!courseCode) return;
    const updated = [...semesters];
    updated[semIndex].courses.push({
      id: Math.random().toString(),
      courseCode,
      semester: updated[semIndex].name,
      grade: "Taken", // الافتراضي أول ما يضيفها
      points: 0,
      isRetake: false
    });
    setSemesters(updated);
  };

  const handleGradeChange = (semIndex: number, courseId: string, newGrade: Grade) => {
    const updated = [...semesters];
    const courseIndex = updated[semIndex].courses.findIndex(c => c.id === courseId);
    if (courseIndex > -1) {
      updated[semIndex].courses[courseIndex].grade = newGrade;
      setSemesters(updated);
    }
  };

  const handleDeleteCourse = (semIndex: number, courseId: string) => {
    const updated = [...semesters];
    updated[semIndex].courses = updated[semIndex].courses.filter(c => c.id !== courseId);
    setSemesters(updated);
  };

  // لستة التقديرات عشان الـ Dropdown
  const gradesList: Grade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "Fail", "Taken"];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">التتبع الأكاديمي</h2>
          <p className="text-muted-foreground">تابع تقدمك، خطط لموادك، وحلل معدلك التراكمي.</p>
        </div>
      </div>

      {/* شريط الإحصائيات العلوي */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المعدل التراكمي (CGPA)</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cgpa >= 2.0 ? 'text-green-500' : 'text-red-500'}`}>
              {cgpa.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">من أصل 4.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الساعات المنجزة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCredits}</div>
            <p className="text-xs text-muted-foreground">ساعة معتمدة بنجاح</p>
          </CardContent>
        </Card>

        <Card className="relative group cursor-pointer hover:border-red-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ساعات الرسوب</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCredits}</div>
            <p className="text-xs text-muted-foreground">مرر الماوس لمعرفة المواد</p>
          </CardContent>
          <div className="absolute top-full mt-2 left-0 w-full z-50 hidden group-hover:block">
            <div className="bg-popover text-popover-foreground border shadow-lg rounded-md p-3 text-sm flex flex-col gap-2">
              {failedCredits > 0 ? (
                effectiveRecords.filter(r => r.grade === 'F' || r.grade === 'Fail').map(r => {
                  const cInfo = coursesCatalog.find(c => c.code === r.courseCode);
                  return (
                    <div key={r.id} className="flex justify-between items-center text-red-500 border-b border-border/50 pb-1 last:border-0">
                      <span>{cInfo?.arabicName || r.courseCode}</span>
                      <span>{cInfo?.credits} ساعة</span>
                    </div>
                  )
                })
              ) : (
                <span className="text-green-500 text-center">لا يوجد مواد رسوب! 🎉</span>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة الإنذارات</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${warnings > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${warnings > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {warnings}
            </div>
            <p className="text-xs text-muted-foreground">
              {warnings === 0 ? 'وضع أكاديمي مستقر' : 'تحذير أكاديمي!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="academic-summary" className="space-y-6 mt-8">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="academic-summary" 
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base transition-all"
          >
            الملخص الأكاديمي
          </TabsTrigger>
          <TabsTrigger 
            value="semesters-management" 
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base transition-all"
          >
            إدارة الفصول الدراسية
          </TabsTrigger>
        </TabsList>
        
        {/* التابة الأولى: الملخص الأكاديمي */}
        <TabsContent value="academic-summary" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle>نظرة عامة على مسارك الأكاديمي</CardTitle>
              <CardDescription>المواد المتاحة للتسجيل باللون الذهبي، والمواد المغلقة باللون الرمادي.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coursesCatalog.map(course => {
                    const attempts = allStudentRecords.filter(r => r.courseCode === course.code);
                    const isPassed = attempts.some(a => !['F', 'Fail', 'Taken', '-'].includes(a.grade));
                    const canTake = checkCanTake(course.prerequisites, allStudentRecords);
                    const highestAttempt = attempts.sort((a, b) => b.points - a.points)[0];

                    let cardStyle = "border-muted opacity-60"; // مقفولة (Default)
                    if (isPassed) cardStyle = "border-green-500/30 bg-green-500/5"; // نجح فيها
                    else if (canTake) cardStyle = "border-yellow-500/50 bg-yellow-500/5"; // جاهزة للتسجيل (ذهبي)

                    return (
                      <div key={course.code} className={`border p-4 rounded-lg flex flex-col justify-between transition-all ${cardStyle}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className={`font-semibold ${isPassed ? 'text-green-600 dark:text-green-400' : canTake ? 'text-yellow-600 dark:text-yellow-500' : 'text-muted-foreground'}`}>
                            {course.arabicName}
                          </div>
                          {isPassed && highestAttempt && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              {highestAttempt.grade} 
                            </Badge>
                          )}
                          {!canTake && <Lock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{course.code} • {course.credits} ساعات</div>
                      </div>
                    )
                  })}
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التابة التانية: إدارة الفصول الدراسية */}
        <TabsContent value="semesters-management" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="flex justify-end">
            <Button onClick={handleAddSemester} className="gap-2">
              <Plus className="h-4 w-4" /> إضافة فصل دراسي
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {semesters.map((sem, semIndex) => {
              // حساب الـ GPA الخاص بالترم ده بس
              const semStats = calculateGPA(sem.courses, coursesCatalog);

              return (
                <Card key={semIndex} className="relative overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{sem.name}</CardTitle>
                        <CardDescription className="mt-1">
                          المعدل الفصلي: <span className={`font-bold ${semStats.gpa >= 2 ? 'text-green-500' : 'text-red-500'}`}>{semStats.gpa.toFixed(2)}</span> 
                          <span className="mx-2">|</span> 
                          الساعات: {semStats.totalCredits}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSemester(semIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {sem.courses.map(courseRecord => {
                      const courseInfo = coursesCatalog.find(c => c.code === courseRecord.courseCode);
                      return (
                        <div key={courseRecord.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors border">
                          <div className="flex-1 truncate">
                            <p className="text-sm font-medium truncate">{courseInfo?.arabicName || courseRecord.courseCode}</p>
                            <p className="text-xs text-muted-foreground">{courseInfo?.code} • {courseInfo?.credits} ساعات</p>
                          </div>
                          
                          {/* قائمة اختيار التقدير (Native Select for styling safety) */}
                          <select 
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:ring-1 focus:ring-primary w-24"
                            value={courseRecord.grade}
                            onChange={(e) => handleGradeChange(semIndex, courseRecord.id, e.target.value as Grade)}
                          >
                            {gradesList.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>

                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteCourse(semIndex, courseRecord.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}

                    {/* زرار وقائمة إضافة مادة للترم */}
                    <div className="pt-2">
                      <select 
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        onChange={(e) => {
                          handleAddCourseToSemester(semIndex, e.target.value);
                          e.target.value = ""; // Reset after selection
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>+ إضافة مادة...</option>
                        {coursesCatalog.map(course => {
                          // التأكد هل المادة دي متسجلة أصلاً في الترم ده؟
                          const isAlreadyInSem = sem.courses.some(c => c.courseCode === course.code);
                          if (isAlreadyInSem) return null;

                          const canTake = checkCanTake(course.prerequisites, allStudentRecords);
                          
                          return (
                            <option key={course.code} value={course.code} disabled={!canTake}>
                              {course.code} - {course.arabicName} {!canTake && '(مغلقة)'}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {semesters.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                لم تقم بإضافة أي فصول دراسية بعد. ابدأ بإضافة فصل دراسي للتخطيط.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}