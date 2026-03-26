"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Map, BookOpen, Loader2 } from "lucide-react";

// استيراد دوال اللوجيك الموحدة
import { getAcademicProfile, getDepartments, DepartmentItem } from "@/lib/academicActions";
import { getEffectiveRecords, isPassed, TOTAL_GRADUATION_CREDITS } from "@/lib/academic-logic";
import { coursesCatalog } from "@/lib/courses";

export default function DegreeAudit() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, percent: 0 });
  const [departmentName, setDepartmentName] = useState("جاري التحميل...");
  const [loading, setLoading] = useState(true);
  const [passedCourseCodes, setPassedCourseCodes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAuditData() {
      // دالة مساعدة لمعالجة البيانات (عشان منكررش الكود للـ Local والـ Cloud)
      const processProfileData = (p: any, allDepts: DepartmentItem[]) => {
        setProfile(p);
        
        const studentDeptId = p.department;
        const deptObject = allDepts.find((d: DepartmentItem) => d.id === studentDeptId);
        const actualDeptName = deptObject ? deptObject.name : "لم يحدد بعد";
        setDepartmentName(actualDeptName);

        const semesters = p.semesters || [];
        const allRecords = semesters.flatMap((s: any) => s.courses);
        const effective = getEffectiveRecords(allRecords);
        
        // استخدام دالة isPassed الموحدة
        const passedCodes = effective
          .filter((r: any) => isPassed(r.grade))
          .map((r: any) => r.courseCode);
        setPassedCourseCodes(passedCodes);

        const completedCredits = effective
          .filter((r: any) => isPassed(r.grade))
          .reduce((sum, r) => {
            const course = coursesCatalog.find((c) => c.code === r.courseCode);
            return sum + (course?.credits || 0);
          }, 0);
        
        setStats({ 
          total: completedCredits, 
          percent: Math.min((completedCredits / TOTAL_GRADUATION_CREDITS) * 100, 100) 
        });
      };

      // 1. القراءة من التخزين المحلي فوراً (للتشغيل الأوفلاين والسريع)
      const localProfileStr = localStorage.getItem("studyhub-academic-profile");
      const localDeptsStr = localStorage.getItem("studyhub-global-departments");
      
      if (localProfileStr && localDeptsStr) {
        processProfileData(JSON.parse(localProfileStr), JSON.parse(localDeptsStr));
        setLoading(false); // إخفاء التحميل فوراً!
      }

      // 2. جلب أحدث بيانات من السيرفر في الخلفية
      if (navigator.onLine) {
        try {
          const [p, allDepts] = await Promise.all([
            getAcademicProfile(),
            getDepartments()
          ]);

          if (p && allDepts) {
            localStorage.setItem("studyhub-academic-profile", JSON.stringify(p));
            localStorage.setItem("studyhub-global-departments", JSON.stringify(allDepts));
            processProfileData(p, allDepts);
          }
        } catch (error) {
          console.error("Offline mode: using cached audit data.");
        }
      }
      setLoading(false);
    }
    fetchAuditData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                {stats.total} من {TOTAL_GRADUATION_CREDITS} ساعة معتمدة
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
            <div className="text-3xl font-bold text-orange-500">{Math.max(TOTAL_GRADUATION_CREDITS - stats.total, 0)} ساعة</div>
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

      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold text-right">المواد المقررة حسب اللائحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coursesCatalog
            .filter(course => {
              const cDept = course.department?.trim();
              const sDept = departmentName?.trim();
              const isRightDept = cDept === sDept || cDept === "المواد العامة (جامعة/كلية)" || cDept === "General";
              
              if (!isRightDept) return false;

              const passed = passedCourseCodes.includes(course.code);

              if (!course.isPlaceholder && (course.exclusiveGroupId || course.electiveGroupId)) {
                  return passed;
              }

              if (course.isPlaceholder) {
                  if (course.exclusiveGroupId) {
                      const hasPassedGroup = coursesCatalog.some(c =>
                          c.exclusiveGroupId === course.exclusiveGroupId && !c.isPlaceholder && passedCourseCodes.includes(c.code)
                      );
                      return !hasPassedGroup; 
                  }
                  
                  if (course.electiveGroupId) {
                      const passedInGroupCount = coursesCatalog.filter(c =>
                          c.electiveGroupId === course.electiveGroupId && !c.isPlaceholder && passedCourseCodes.includes(c.code)
                      ).length;

                      const placeholders = coursesCatalog
                          .filter(c => c.isPlaceholder && c.electiveGroupId === course.electiveGroupId)
                          .sort((a, b) => a.code.localeCompare(b.code));
                      const myIndex = placeholders.findIndex(p => p.code === course.code);

                      return passedInGroupCount <= myIndex;
                  }
              }

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