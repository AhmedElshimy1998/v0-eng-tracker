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

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, allDepts] = await Promise.all([
          getAcademicProfile(),
          getDepartments()
        ]);

        if (p) {
          setProfile(p);
          
          // --- التعديل هنا لربط اسم القسم من لوحة الإدارة ---
          const studentDeptId = p.department;
          const deptObject = allDepts.find((d: DepartmentItem) => d.id === studentDeptId);
          const actualDeptName = deptObject ? deptObject.name : "لم يحدد بعد";
          setDepartmentName(actualDeptName);

          const semesters = p.semesters || [];
          const allRecords = semesters.flatMap((s: any) => s.courses);
          const effective = getEffectiveRecords(allRecords);
          
          // حساب الساعات بناءً على الكتالوج العام
          const { totalCredits } = calculateGPA(effective, coursesCatalog);
          
          setStats({ 
            total: totalCredits, 
            percent: Math.min((totalCredits / 160) * 100, 100) 
          });
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
              // المنطق الجديد: يطابق قسم الطالب أو قسم المواد العامة المسمى حديثاً
              return cDept === sDept || cDept === "المواد العامة (جامعة/كلية)" || cDept === "General";
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