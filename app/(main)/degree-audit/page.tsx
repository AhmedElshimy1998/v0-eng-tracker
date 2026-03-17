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
          
          // --- الجزء المسؤول عن عرض اسم القسم كما في لوحة الأدمن ---
          const studentDeptId = p.department;
          const deptObject = allDepts.find((d: DepartmentItem) => d.id === studentDeptId);
          setDepartmentName(deptObject ? deptObject.name : "لم يحدد بعد");

          const semesters = p.semesters || [];
          const allRecords = semesters.flatMap((s: any) => s.courses);
          const effective = getEffectiveRecords(allRecords);
          const { totalCredits } = calculateGPA(effective, coursesCatalog);
          
          const totalRequired = 160;
          setStats({ 
            total: totalCredits, 
            percent: Math.min((totalCredits / totalRequired) * 100, 100) 
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalRequired = 160;

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <Map className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">خريطة التخرج (Degree Audit)</h1>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الساعات المكتملة</p>
              <h2 className="text-4xl font-black">{stats.total} <span className="text-lg font-normal text-muted-foreground">/ {totalRequired}</span></h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{stats.percent.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">نسبة الإنجاز</p>
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

      <div className="bg-muted/20 border border-dashed rounded-xl p-8 text-center space-y-3">
         <p className="text-muted-foreground text-sm font-medium">قريباً: سيتم إضافة قائمة المواد المتبقية بناءً على لائحة قسمك الفعلية.</p>
      </div>
    </div>
  );
}