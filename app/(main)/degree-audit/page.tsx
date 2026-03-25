"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Map, BookOpen, Loader2 } from "lucide-react";
import { getAcademicProfile, getDepartments, DepartmentItem } from "@/lib/academicActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

export default function DegreeAudit() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, percent: 0 });
  const [departmentName, setDepartmentName] = useState("جاري التحميل...");
  const [loading, setLoading] = useState(true);
  const [passedCourseCodes, setPassedCourseCodes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, allDepts] = await Promise.all([
          getAcademicProfile(),
          getDepartments()
        ]);

            if (p) {
      setProfile(p);
      
      const studentDeptId = p.department;
      const deptObject = allDepts.find((d: DepartmentItem) => d.id === studentDeptId);
      const actualDeptName = deptObject ? deptObject.name : "لم يحدد بعد";
      setDepartmentName(actualDeptName);

      const semesters = p.semesters || [];
      const allRecords = semesters.flatMap((s: any) => s.courses);
      const effective = getEffectiveRecords(allRecords);
      
      // 1. حساب الساعات "المنجزة بنجاح" فقط (Excluding F, Fail, Taken)
      const completedCredits = effective
        .filter((r: any) => !["F", "Fail", "Taken", "-"].includes(r.grade?.trim()))
        .reduce((sum, r) => {
          const course = coursesCatalog.find((c) => c.code === r.courseCode);
          return sum + (course?.credits || 0);
        }, 0);
      
      // --- ( الإضافة الجديدة هنا ) ---
      // نستخرج أكواد المواد اللي الطالب نجح فيها فعلياً
      const passedCodes = effective
        .filter((r: any) => !["F", "Fail", "Taken", "-"].includes(r.grade?.trim()))
        .map((r: any) => r.courseCode);
      setPassedCourseCodes(passedCodes);
      // -------------------------------

      // 2. تحديث الإحصائيات بالساعات اللي عديت فيها فعلياً
      setStats({ 
        total: completedCredits, 
        percent: Math.min((completedCredits / 160) * 100, 100) 
      });

      // ملاحظة: لو محتاج الـ GPA لسه في الصفحة، تقدر تحسبه كدة:
      // const { gpa } = calculateGPA(effective, coursesCatalog);
      // setGpa(gpa);
    }
      } catch (error) {
        console.error("Error fetching audit data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRequired = 160;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-right">خريطة التخرج</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" /> المسار الأكاديمي الحالي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">نسبة الإنجاز الكلية</p>
                <div className="text-2xl font-bold">{stats.percent.toFixed(1)}%</div>
             </div>
             <div className="text-sm text-muted-foreground">
                {stats.total} من {totalRequired} ساعة معتمدة
             </div>
          </div>
          <Progress value={stats.percent} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-500" /> متبقي للتخرج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{Math.max(totalRequired - stats.total, 0)} ساعة</div>
            <p className="text-sm text-muted-foreground mt-1">ساعات دراسية تفصلك عن درجة البكالوريوس.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" /> الحالة الأكاديمية
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-1">القسم الدراسي الحالي:</p>
             <p className="font-bold text-xl text-primary">{departmentName}</p>
          </CardContent>
        </Card>
      </div>

      {/* عرض المواد المتوافقة مع القسم الجديد والمواد العامة */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold text-right">المواد المقررة حسب اللائحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coursesCatalog
            .filter(course => {
              const cDept = course.department?.trim();
              const sDept = departmentName?.trim();
              const isRightDept = cDept === sDept || cDept === "المواد العامة (جامعة/كلية)" || cDept === "General";
              
              if (!isRightDept) return false;

              const isPassed = passedCourseCodes.includes(course.code);

              // 1. لو دي مادة حقيقية بس تبع جروب (اختياري أو مفاضلة)
              if (!course.isPlaceholder && (course.exclusiveGroupId || course.electiveGroupId)) {
                  // اظهرها "فقط" لو الطالب نجح فيها (عشان متعملش زحمة في الخريطة)
                  return isPassed;
              }

              // 2. لو ده كارت وهمي (Placeholder) زي "مادة علوم أساسية"
              if (course.isPlaceholder) {
                  // أ. نظام المفاضلة الفردية (زي الإسعافات والقانون)
                  if (course.exclusiveGroupId) {
                      // لو الطالب نجح في أي مادة من الجروب ده، اخفي الكارت الوهمي
                      const hasPassedGroup = coursesCatalog.some(c =>
                          c.exclusiveGroupId === course.exclusiveGroupId && !c.isPlaceholder && passedCourseCodes.includes(c.code)
                      );
                      return !hasPassedGroup; 
                  }
                  
                  // ب. نظام المجموعات (زي 3 من 10)
                  if (course.electiveGroupId) {
                      // نحسب الطالب نجح في كام مادة من الجروب ده
                      const passedInGroupCount = coursesCatalog.filter(c =>
                          c.electiveGroupId === course.electiveGroupId && !c.isPlaceholder && passedCourseCodes.includes(c.code)
                      ).length;

                      // نحدد ترتيب الكارت الوهمي ده وسط اخواته
                      const placeholders = coursesCatalog
                          .filter(c => c.isPlaceholder && c.electiveGroupId === course.electiveGroupId)
                          .sort((a, b) => a.code.localeCompare(b.code));
                      const myIndex = placeholders.findIndex(p => p.code === course.code);

                      // لو عدد المواد اللي نجح فيها >= ترتيبي ككارت وهمي، يبقى دوري انتهى وأختفي
                      return passedInGroupCount <= myIndex;
                  }
              }

              // 3. لو مادة إجبارية عادية (لا وهمية ولا اختياري)، اظهرها دايماً
              return true;
            })
            .map(course => (
              <div key={course.code} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                <div className="text-right">
                  <p className="text-sm font-medium">{course.arabicName}</p>
                  <p className="text-[10px] text-muted-foreground">{course.code}</p>
                </div>
                <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  {course.credits} ساعة
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}