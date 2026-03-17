"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, ShieldCheck, AlertTriangle, GraduationCap, TrendingUp, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

export default function AdminDashboardMain() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgGpa: 0,
    atRisk: 0,
    graduating: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const students = await getAllStudents();
      
      if (students.length === 0) {
        setIsLoading(false);
        return;
      }

      let totalGpa = 0;
      let atRiskCount = 0;
      let graduatingCount = 0;
      let validGpaStudents = 0;

      students.forEach(student => {
        const semesters = student.profile.semesters || [];
        const allRecords = semesters.flatMap((s: any) => s.courses);
        const effectiveRecords = getEffectiveRecords(allRecords);
        const { gpa, totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);

        // نحسب فقط للطلاب اللي سجلوا مواد فعلياً (تجاوزوا 0 ساعة)
        if (totalCredits > 0) {
          totalGpa += gpa;
          validGpaStudents++;
          
          if (gpa < 2.0) atRiskCount++;
          if (totalCredits >= 130) graduatingCount++; // بافتراض التخرج 160، فالـ 130 هما الخريجون المتوقعون
        }
      });

      setStats({
        totalStudents: students.length,
        avgGpa: validGpaStudents > 0 ? totalGpa / validGpaStudents : 0,
        atRisk: atRiskCount,
        graduating: graduatingCount
      });
      
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">لوحة تحكم الإدارة</h2>
        <p className="text-muted-foreground">مرحباً بك في لوحة تحكم النظام. إليك ملخص الحالة الأكاديمية.</p>
      </div>

      {/* قسم الإحصائيات (KPIs) الجديد */}
      {isLoading ? (
        <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">مسجلين بالمنصة</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط المعدل العام</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgGpa.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">من أصل 4.00</p>
            </CardContent>
          </Card>

          <Card className={stats.atRisk > 0 ? "border-red-500/50 bg-red-500/5" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلاب المنذرين (تحت 2.0)</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.atRisk > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.atRisk > 0 ? "text-red-500" : ""}`}>{stats.atRisk}</div>
              <p className="text-xs text-muted-foreground">طالب بحاجة لمتابعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">خريجون متوقعون</CardTitle>
              <GraduationCap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.graduating}</div>
              <p className="text-xs text-muted-foreground">تجاوزوا 130 ساعة</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* قسم كروت الخدمات (القديم) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
        <Link href="/admin/curriculum">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>إدارة اللائحة والأقسام</CardTitle>
              <CardDescription>إضافة وتعديل المواد، المتطلبات، وإدارة الأقسام الأكاديمية.</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </Link>

        <Link href="/admin/students">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>متابعة الطلاب</CardTitle>
              <CardDescription>عرض بيانات الطلاب، متابعة الأداء الفصلي، التراكمي، وحالة الإنذارات.</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </Link>

        <Link href="/admin/roles">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <ShieldCheck className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>إدارة الصلاحيات</CardTitle>
              <CardDescription>تعيين أو إزالة صلاحيات الإدارة (Admin) للمستخدمين المسجلين.</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}