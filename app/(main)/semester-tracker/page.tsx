"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, AlertTriangle, CheckCircle2, XCircle, Lock, Plus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { calculateGPA, checkCanTake, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses"; 
import { SemesterData, Grade } from "@/lib/types";
import { getAcademicProfile, saveAcademicProfile, getDepartments, DepartmentItem } from "@/lib/academicActions";

export default function SemesterTrackerPage() {
  const [studentDept, setStudentDept] = useState<string>("");
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [actualDeptName, setActualDeptName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const [data, allDepts] = await Promise.all([
        getAcademicProfile(),
        getDepartments()
      ]);
      
      if (data) {
        setStudentDept(data.department || "");
        // نجلب الاسم العربي للقسم للمطابقة في البحث
        const deptObject = allDepts.find((d: DepartmentItem) => d.id === data.department);
        if (deptObject) setActualDeptName(deptObject.name);
        
        if (data.semesters) setSemesters(data.semesters);
      }
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const saveSemestersToCloud = async (updatedSemesters: SemesterData[]) => {
    setSemesters(updatedSemesters); 
    await saveAcademicProfile({ semesters: updatedSemesters }); 
  };

  const displayCatalog = useMemo(() => {
    return coursesCatalog.filter(c => 
      c.department === "General" || 
      c.department === "المواد العامة (جامعة/كلية)" || 
      c.department === actualDeptName
    );
  }, [actualDeptName]);

  const officialSemesters = [
    "Level Zero - Term 1", "Level Zero - Term 2", "Level Zero - Summer",
    "Level One - Term 1", "Level One - Term 2", "Level One - Summer",
    "Level Two - Term 1", "Level Two - Term 2", "Level Two - Summer",
    "Level Three - Term 1", "Level Three - Term 2", "Level Three - Summer",
    "Level Four - Term 1", "Level Four - Term 2", "Level Four - Summer"
  ];

  const allStudentRecords = useMemo(() => semesters.flatMap(sem => sem.courses), [semesters]);
  const effectiveRecords = useMemo(() => getEffectiveRecords(allStudentRecords), [allStudentRecords]);
  const { gpa: cgpa, failedCredits } = useMemo(() => 
  calculateGPA(effectiveRecords, coursesCatalog), [effectiveRecords]);

const completedCredits = useMemo(() => {
  return effectiveRecords
    .filter(r => !['F', 'Fail', 'Taken', '-'].includes(r.grade)) // منطق النجاح اللي حددناه
    .reduce((sum, r) => {
      const course = coursesCatalog.find(c => c.code === r.courseCode);
      return sum + (course?.credits || 0);
    }, 0);
}, [effectiveRecords]);

  const warnings = useMemo(() => {
    let consecutiveWarnings = 0;

    const sortedSemesters = [...semesters].sort((a, b) => {
      return officialSemesters.indexOf(a.name) - officialSemesters.indexOf(b.name);
    });

    sortedSemesters.forEach(sem => {
      const stats = calculateGPA(sem.courses, coursesCatalog);
      if (stats.totalCredits > 0) {
        if (stats.gpa < 2.0) {
          consecutiveWarnings++;
        } else {
          consecutiveWarnings = 0;
        }
      }
    });

    const hasCumulativeWarning = cgpa < 2.0 && completedCredits > 0;
    let totalCount = consecutiveWarnings + (hasCumulativeWarning ? 1 : 0);
    
    let text = 'وضع أكاديمي مستقر';
    if (hasCumulativeWarning && consecutiveWarnings > 0) {
       text = `إنذار تراكمي + ${consecutiveWarnings} إنذار فصلي`;
    } else if (hasCumulativeWarning) {
       text = 'إنذار تراكمي (CGPA < 2.0)';
    } else if (consecutiveWarnings > 0) {
       text = `${consecutiveWarnings} إنذار فصلي متتالي`;
    }

    return { count: totalCount, text, isDanger: totalCount > 0 };
  }, [semesters, cgpa, completedCredits, officialSemesters]);

  const handleAddSemester = (name: string) => {
    if (semesters.find(s => s.name === name)) return alert("هذا الفصل مضاف بالفعل");
    const updated = [...semesters, { name, semesterGpa: 0, semesterCredits: 0, courses: [] }];
    saveSemestersToCloud(updated);
  };

  const handleGradeChange = (semIndex: number, courseId: string, newGrade: Grade) => {
    const updated = [...semesters];
    const course = updated[semIndex].courses.find(c => c.id === courseId);
    if (course) {
      course.grade = newGrade;
      saveSemestersToCloud(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-24 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground font-medium text-lg">جاري جلب مسارك الأكاديمي من السحابة...</p>
      </div>
    );
  }
const getStudentLevel = (credits: number) => {
  if (credits < 32) return { label: "Level 0", color: "bg-blue-500/10 text-blue-500" };
  if (credits < 64) return { label: "Level 1", color: "bg-cyan-500/10 text-cyan-500" };
  if (credits < 96) return { label: "Level 2", color: "bg-green-500/10 text-green-500" };
  if (credits < 128) return { label: "Level 3", color: "bg-yellow-500/10 text-yellow-500" };
  return { label: "Level 4", color: "bg-purple-500/10 text-purple-500" };
};

const level = getStudentLevel(completedCredits);
  return (
    <TooltipProvider>
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">التتبع الأكاديمي</h2>
          <p className="text-muted-foreground">تابع تقدمك، خطط لموادك، وحلل معدلك التراكمي.</p>
        </div>
      </div>

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
    <div className="flex justify-between items-center">
      <div className="text-2xl font-bold">{completedCredits}</div>
    { /*
      <Badge variant="outline" className="text-[10px] opacity-70 border-muted">
        {level.label} Status
      </Badge>
      */ }
    </div>
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
            <div className="bg-popover border shadow-lg rounded-md p-3 text-sm flex flex-col gap-2">
              {failedCredits > 0 ? (
                effectiveRecords.filter(r => r.grade === 'F' || r.grade === 'Fail').map(r => {
                  const cInfo = coursesCatalog.find(c => c.code === r.courseCode);
                  return (
                    <div key={r.id} className="flex justify-between items-center text-red-500 border-b pb-1 last:border-0">
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
            <AlertTriangle className={`h-4 w-4 ${warnings.isDanger ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${warnings.isDanger ? 'text-red-500' : 'text-green-500'}`}>
              {warnings.count}
            </div>
            <p className="text-[11px] font-bold text-muted-foreground mt-1">{warnings.text}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="academic-summary" className="space-y-6 mt-8">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto overflow-x-auto flex-nowrap">
          <TabsTrigger value="academic-summary" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base whitespace-nowrap">الملخص الأكاديمي</TabsTrigger>
          <TabsTrigger value="semesters-management" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base whitespace-nowrap">إدارة الفصول الدراسية</TabsTrigger>
        </TabsList>
        
        {/* التابة الأولى: الملخص الأكاديمي */}
        <TabsContent value="academic-summary" className="space-y-8 animate-in fade-in-50">
          {officialSemesters.map(semName => {
            const coursesInThisSem = displayCatalog.map(course => {
              const attempts = allStudentRecords.filter(r => r.courseCode === course.code);
              const attemptInThisSem = attempts.find(a => a.semester === semName);
              if (attemptInThisSem) return { course, attempt: attemptInThisSem, isIdeal: false, allAttempts: attempts };
              if (attempts.length === 0 && course.idealSemester === semName) return { course, attempt: null, isIdeal: true, allAttempts: attempts };
              return null;
            }).filter(item => item !== null);

            if (coursesInThisSem.length === 0) return null;

            const actualSemRecord = semesters.find(s => s.name === semName);
            let semGPAStats = null;
            if (actualSemRecord) {
              semGPAStats = calculateGPA(actualSemRecord.courses, coursesCatalog);
            }

            return (
              <div key={semName} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-muted pb-2">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-r-4 border-primary pr-3">
                    {semName}
                  </h3>
                  {semGPAStats && semGPAStats.totalCredits > 0 && (
                    <Badge variant="outline" className={`px-3 py-1 text-sm font-semibold ${semGPAStats.gpa >= 2 ? 'text-green-600 border-green-500/30 bg-green-500/10 dark:text-green-400' : 'text-red-600 border-red-500/30 bg-red-500/10 dark:text-red-400'}`}>
                      المعدل الفصلي: {semGPAStats.gpa.toFixed(2)}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coursesInThisSem.map(({ course, attempt, isIdeal, allAttempts }) => {
                    const canTake = checkCanTake(course.prerequisites, allStudentRecords);
                    const successAttempt = allAttempts.find(a => !['F', 'Fail', 'Taken', '-'].includes(a.grade));

                    let cardStyle = "border-muted opacity-40"; 
                    let statusBadge = null;

                    if (attempt) {
                      if (attempt.grade === 'Taken') {
                        cardStyle = "border-blue-500/50 bg-blue-500/10 animate-pulse";
                        statusBadge = <Badge className="bg-blue-500/20 text-blue-400">قيد الدراسة</Badge>;
                      } else if (attempt.grade === 'F' || attempt.grade === 'Fail') {
                        if (successAttempt && successAttempt.semester !== semName) {
                          cardStyle = "border-red-500/20 bg-red-500/5 opacity-60"; 
                          const shortSemName = successAttempt.semester.replace("Level ", "L").replace(" - Term ", " T");
                          statusBadge = <Badge variant="outline" className="border-red-500/30 text-red-500/70 text-[10px]">تم الاجتياز في {shortSemName}</Badge>;
                        } else {
                          cardStyle = "border-red-500/40 bg-red-500/5";
                          statusBadge = <Badge variant="destructive">{attempt.grade === 'F' ? 'راسب' : 'راسب لائحة'}</Badge>;
                        }
                      } else {
                        cardStyle = "border-green-500/40 bg-green-500/5";
                        statusBadge = <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{attempt.grade}</Badge>;
                      }
                    } else if (isIdeal) {
                      if (canTake) {
                        cardStyle = "border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_10px_rgba(234,179,8,0.1)]";
                        statusBadge = <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">متاحة للتسجيل</Badge>;
                      } else {
                        statusBadge = <Lock className="h-4 w-4 text-muted-foreground" />;
                      }
                    }
                    // 1. فحص حالة القفل والسبب بدقة
                    // 1. الشرط الصارم: الكارت مغلق "فقط" لو ملوش أي محاولة سابقة، وهو في الخطة المثالية، والمتطلبات غير مستوفاة
                        const isLockedCard = !attempt && isIdeal && !canTake;

                        // 2. تجهيز أسماء المتطلبات بالعربي لعرضها في النافذة
                        const prereqDetails = course.prerequisites && course.prerequisites.length > 0 
                          ? course.prerequisites.map(pCode => {
                              const pInfo = coursesCatalog.find(c => c.code === pCode);
                              return `${pInfo?.arabicName || pCode} (${pCode})`;
                            }).join(" - ")
                          : "لا يوجد متطلبات محددة";

                        // 3. تصميم الكارت نفسه (ثابت لكل الحالات عشان شكل الصفحة ما يتغيرش)
                        const cardElement = (
                          <div className={`border p-4 rounded-lg flex flex-col justify-between transition-all h-full ${cardStyle} ${isLockedCard ? 'cursor-help' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-sm text-right">{course.arabicName}</div>
                              {statusBadge}
                            </div>
                            <div className="text-xs text-muted-foreground text-right">{course.code} • {course.credits} ساعة</div>
                          </div>
                        );

                        // 4. الحل النهائي: لو الكارت رمادي (مغلق)، حط النافذة.. لو أي حاجة تانية، رجع الكارت "حاف"
                        // الحل النهائي: استخدام نظام الـ group-hover اليدوي بدلاً من الـ Tooltip
                        if (isLockedCard) {
                          return (
                            <div key={`${course.code}-locked`} className="relative group cursor-help overflow-visible h-full">
                              {/* الكارت الأساسي (باهت لأنه مغلق) - نفس ستايلك الأصلي */}
                              <div className={`border p-4 rounded-lg flex flex-col justify-between transition-all h-full ${cardStyle}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-semibold text-sm text-right">{course.arabicName}</div>
                                  {statusBadge}
                                </div>
                                <div className="text-xs text-muted-foreground text-right">{course.code} • {course.credits} ساعة</div>
                              </div>

                              {/* النافذة المنبثقة (تظهر عند الـ Hover أو اللمس) - نسخة طبق الأصل من كارت الإدارة */}
                              <div className="absolute top-full mt-2 right-0 w-64 z-[100] hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-popover text-popover-foreground border shadow-xl rounded-md p-3 text-sm flex flex-col gap-2 border-red-500/50">
                                  
                                  {/* عنوان الهوفر - نفس ستايل هيدر الإدارة */}
                                  <h4 className="font-bold border-b pb-1 mb-1 text-xs text-muted-foreground flex items-center justify-end gap-1.5">
                                    <span>متطلبات التسجيل</span>
                                  </h4>
                                  
                                  {/* محتوى الهوفر - الحفاظ على النص الكامل للمتطلبات */}
                                  <div className="flex flex-col gap-1.5 text-right mt-1">
                                    {/* جملة عليك اجتياز المتطلبات التالية: */}
                                    <div className="text-xs text-red-500/80 font-medium italic">
                                      عليك اجتياز المتطلبات التالية:
                                    </div>
                                    
                                    {/* قائمة المواد المطلوبة - بخط بولد وشيك */}
                                    <div className="text-xs font-semibold leading-relaxed text-slate-100 bg-red-500/10 p-2 rounded border border-red-500/10">
                                      {prereqDetails}
                                    </div>
                                  </div>

                                  {/* سهم صغير ليعطي شكل الـ Tooltip الاحترافي */}
                                  <div className="absolute bottom-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-popover"></div>
                                  {/* حدود صغيرة للسهم لتتناسب مع حدود الكارد */}
                                  <div className="absolute bottom-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-red-500/50 -mb-[1px]"></div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // للمواد الذهبية (متاحة)، الخضراء (ناجحة)، والحمراء (رسوب)
                        return (
                          <div key={`${course.code}-${attempt?.id || 'ideal'}`} className="h-full">
                            {cardElement}
                          </div>
                        ); 
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* التابة الثانية: إدارة الفصول الدراسية */}
        <TabsContent value="semesters-management" className="space-y-6">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">اختر الفصل الدراسي لإضافته:</p>
            <select 
              className="h-10 rounded-md border border-input bg-background text-foreground dark:bg-[#09090b] dark:text-slate-50 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              onChange={(e) => { handleAddSemester(e.target.value); e.target.value = ""; }}
              defaultValue=""
            >
              <option value="" disabled>+ إضافة فصل دراسي...</option>
              {officialSemesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {semesters.map((sem, semIndex) => {
  // 1. حساب ساعات التسجيل "النهائية" (فقط المواد التي حصلت على تقدير نهائي وليس Taken)
  const finalizedRegistrationCredits = sem.courses
    .filter(r => r.grade !== 'Taken' && r.grade !== '-') // استبعاد المواد قيد الدراسة
    .reduce((sum, r) => {
      const course = coursesCatalog.find(c => c.code === r.courseCode);
      return sum + (course?.credits || 0);
    }, 0);

  // 2. حساب ساعات النجاح الفعلية لهذا الترم
  const passedCreditsInSem = sem.courses
    .filter(r => !['F', 'Fail', 'Taken', '-'].includes(r.grade)) 
    .reduce((sum, r) => {
      const course = coursesCatalog.find(c => c.code === r.courseCode);
      return sum + (course?.credits || 0);
    }, 0);

  // 3. حساب ساعات المواد "قيد الدراسة" حالياً (إضافي للوضوح)
  const currentOngoingCredits = sem.courses
    .filter(r => r.grade === 'Taken')
    .reduce((sum, r) => {
      const course = coursesCatalog.find(c => c.code === r.courseCode);
      return sum + (course?.credits || 0);
    }, 0);

  // نستخدم دالة GPA الأصلية للحسابات الرياضية
  const semStats = calculateGPA(sem.courses, coursesCatalog);

  return (
    <Card key={sem.name}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/10 pb-4">
        <div>
          <CardTitle className="text-md">{sem.name}</CardTitle>
          <CardDescription className="mt-1 flex flex-wrap gap-2 items-center">
            {/* المعدل الفصلي */}
            <span className="flex items-center gap-1">
              المعدل: <span className={`font-bold ${semStats.gpa >= 2 ? 'text-green-500' : 'text-red-500'}`}>{semStats.gpa.toFixed(2)}</span>
            </span>
            <span className="text-muted-foreground">|</span>
            
            {/* تسجيل نهائي (بدون الـ Taken) */}
            <span className="flex items-center gap-1">
              التسجيل النهائي: <span className="font-bold text-blue-400">{finalizedRegistrationCredits}</span>
            </span>
            <span className="text-muted-foreground">|</span>
            
            {/* ساعات النجاح */}
            <span className="flex items-center gap-1">
              النجاح: <span className="font-bold text-green-500">{passedCreditsInSem}</span>
            </span>

            {/* إظهار المواد الحالية لو موجودة */}
            {currentOngoingCredits > 0 && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="flex items-center gap-1">
                  قيد الدراسة: <span className="font-bold text-yellow-500">{currentOngoingCredits}</span>
                </span>
              </>
            )}
          </CardDescription>
        </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if(confirm("متأكد من حذف هذا الفصل بالكامل؟")) {
                        const up = [...semesters]; up.splice(semIndex,1); saveSemestersToCloud(up);
                      }
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                     <select 
                      className="w-full h-9 rounded-md border border-input bg-background text-foreground dark:bg-[#09090b] dark:text-slate-50 px-3 text-sm mb-4 outline-none"
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
                        saveSemestersToCloud(updated); e.target.value = "";
                      }}
                      defaultValue=""
                     >
                      <option value="" disabled>+ تسجيل مادة في هذا الترم</option>
                      {displayCatalog.map(c => {
                        const hasPassed = allStudentRecords.some(r => r.courseCode === c.code && !['F', 'Fail', 'Taken'].includes(r.grade));
                        const isAlreadyInSem = sem.courses.some(r => r.courseCode === c.code);
                        const canTake = checkCanTake(c.prerequisites, allStudentRecords);
                        if (hasPassed || isAlreadyInSem) return null;
                        return <option key={c.code} value={c.code} disabled={!canTake}>{c.arabicName} {!canTake ? '(مغلقة)' : ''}</option>
                      })}
                     </select>

                     {sem.courses.map(record => {
                       const c = coursesCatalog.find(x => x.code === record.courseCode);
                       return (
                         <div key={record.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors">
                           <div className="flex-1 truncate">
                             <div className="text-sm font-medium truncate">{c?.arabicName || record.courseCode}</div>
                             {/* تم إرجاع كود المادة هنا */}
                             <div className="text-xs text-muted-foreground">{c?.code}</div>
                           </div>
                           <select 
                            className="h-8 border rounded px-1 text-xs outline-none focus:ring-1 focus:ring-primary ml-2 bg-background text-foreground dark:bg-[#09090b] dark:text-slate-50"
                            value={record.grade}
                            onChange={(e) => handleGradeChange(semIndex, record.id, e.target.value as Grade)}
                           >
                             {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "Fail", "Taken"].map(g => <option key={g} value={g}>{g}</option>)}
                           </select>
                           <Button variant="ghost" size="icon" className="h-8 w-8 ml-1 text-muted-foreground hover:text-destructive" onClick={() => {
                             const updated = [...semesters]; updated[semIndex].courses = updated[semIndex].courses.filter(item => item.id !== record.id); saveSemestersToCloud(updated);
                           }}><XCircle className="h-4 w-4" /></Button>
                         </div>
                       )
                     })}

                     {/* تم إرجاع رسالة الترم الفارغ هنا */}
                     {sem.courses.length === 0 && (
                       <div className="text-center text-xs text-muted-foreground pt-2">
                         لم تقم بتسجيل مواد في هذا الترم بعد.
                       </div>
                     )}
                  </CardContent>
                </Card>
              )
            })}
            
            {/* تم إرجاع رسالة عدم وجود فصول نهائياً هنا */}
            {semesters.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                لم تقم بإضافة أي فصول دراسية بعد. ابدأ بإضافة فصل دراسي للتخطيط.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}