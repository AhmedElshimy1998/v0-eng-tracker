"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, ShieldCheck, AlertTriangle, GraduationCap, TrendingUp, Activity, Loader2, ChevronDown, ChevronUp, BookX } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

// أنواع البيانات للإحصائيات
interface LevelStat {
  total: number;
  gpaSum: number;
  gpaCount: number;
  atRisk: number;
}
type LevelStatsMap = Record<string, LevelStat>;

interface FailedCourse {
  code: string;
  name: string;
  count: number;
  percentage: number;
  students: { name: string; level: string }[];
}

const levelNames = ["المستوى الصفري", "المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع"];

export default function AdminDashboardMain() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgGpa: 0,
    atRisk: 0,
    graduating: 0,
    levelStats: {} as LevelStatsMap,
    failingCourses: [] as FailedCourse[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const getLevel = (credits: number) => {
    const levelNum = Math.floor(credits / 32);
    return levelNames[Math.min(levelNum, 4)];
  };

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

      // تهيئة مستويات الطلاب
      const lvlStats: LevelStatsMap = {};
      levelNames.forEach(name => {
        lvlStats[name] = { total: 0, gpaSum: 0, gpaCount: 0, atRisk: 0 };
      });

      const failedCoursesMap: Record<string, { count: number, students: {name: string, level: string}[] }> = {};

      students.forEach(student => {
        const semesters = student.profile.semesters || [];
        const allRecords = semesters.flatMap((s: any) => s.courses);
        const effectiveRecords = getEffectiveRecords(allRecords); // بيجيب النتيجة النهائية لكل مادة (عشان نتجاهل اللي نجحوا في الإعادة)
        const { gpa: cgpa, totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);
        
        const level = getLevel(totalCredits);
        lvlStats[level].total++;

        // حساب معدل آخر ترم (الإنذار الفصلي)
        const activeSemesters = semesters.filter((s: any) => s.courses.length > 0);
        const lastSemester = activeSemesters[activeSemesters.length - 1];
        let lastSemGpa = 4.0;
        if (lastSemester) {
           const { gpa } = calculateGPA(lastSemester.courses, coursesCatalog);
           lastSemGpa = gpa;
        }

        if (totalCredits > 0) {
          totalGpa += cgpa;
          validGpaStudents++;
          lvlStats[level].gpaSum += cgpa;
          lvlStats[level].gpaCount++;
          
          // الإنذار التراكمي والفصلي
          if (cgpa < 2.0 || lastSemGpa < 2.0) {
            atRiskCount++;
            lvlStats[level].atRisk++;
          }
          if (totalCredits >= 130) graduatingCount++; 
        }

        // حساب المواد الأكثر رسوباً (للحاليين فقط الذين لم يجتازوها بعد)
        const failingRecords = effectiveRecords.filter(r => r.grade === 'F' || r.grade === 'Fail');
        failingRecords.forEach(rec => {
           if (!failedCoursesMap[rec.courseCode]) {
              failedCoursesMap[rec.courseCode] = { count: 0, students: [] };
           }
           failedCoursesMap[rec.courseCode].count++;
           failedCoursesMap[rec.courseCode].students.push({
              name: student.profile.name || "طالب بدون اسم",
              level: level
           });
        });
      });

      // ترتيب المواد المتعثرة من الأكبر للأصغر
      const failingCoursesArray = Object.keys(failedCoursesMap).map(code => {
         const info = coursesCatalog.find(c => c.code === code);
         return {
            code,
            name: info?.arabicName || code,
            count: failedCoursesMap[code].count,
            percentage: (failedCoursesMap[code].count / students.length) * 100, // النسبة من إجمالي الدفعة
            students: failedCoursesMap[code].students
         }
      }).sort((a, b) => b.count - a.count);

      setStats({
        totalStudents: students.length,
        avgGpa: validGpaStudents > 0 ? totalGpa / validGpaStudents : 0,
        atRisk: atRiskCount,
        graduating: graduatingCount,
        levelStats: lvlStats,
        failingCourses: failingCoursesArray
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

      {isLoading ? (
        <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <>
          {/* قسم الإحصائيات (KPIs) المتطور مع الـ Tooltips */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* كارت 1: إجمالي الطلاب */}
            <Card className="relative group cursor-pointer hover:border-blue-500/50 transition-colors overflow-visible">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">مسجلين بالمنصة (مرر للتقسيم)</p>
              </CardContent>
              <div className="absolute top-full mt-2 left-0 w-full z-50 hidden group-hover:block">
                <div className="bg-popover text-popover-foreground border shadow-xl rounded-md p-3 text-sm flex flex-col gap-2">
                  <h4 className="font-bold border-b pb-1 mb-1 text-xs text-muted-foreground">التوزيع على المستويات:</h4>
                  {levelNames.map(lvl => (
                    <div key={lvl} className="flex justify-between items-center text-xs">
                      <span>{lvl}</span>
                      <Badge variant="secondary">{stats.levelStats[lvl]?.total || 0} طالب</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* كارت 2: متوسط المعدل العام */}
            <Card className="relative group cursor-pointer hover:border-green-500/50 transition-colors overflow-visible">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط المعدل العام</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgGpa.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">من أصل 4.00 (مرر للتفاصيل)</p>
              </CardContent>
              <div className="absolute top-full mt-2 left-0 w-full z-50 hidden group-hover:block">
                <div className="bg-popover text-popover-foreground border shadow-xl rounded-md p-3 text-sm flex flex-col gap-2">
                  <h4 className="font-bold border-b pb-1 mb-1 text-xs text-muted-foreground">المتوسط داخل كل مستوى:</h4>
                  {levelNames.map(lvl => {
                    const data = stats.levelStats[lvl];
                    const avg = data && data.gpaCount > 0 ? (data.gpaSum / data.gpaCount).toFixed(2) : "0.00";
                    return (
                      <div key={lvl} className="flex justify-between items-center text-xs">
                        <span>{lvl}</span>
                        <span className="font-semibold">{avg}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* كارت 3: الطلاب المنذرين (فصلي + تراكمي) */}
            <Card className={`relative group cursor-pointer transition-colors overflow-visible ${stats.atRisk > 0 ? "border-red-500/50 bg-red-500/5" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الطلاب المنذرين</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${stats.atRisk > 0 ? "text-red-500" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.atRisk > 0 ? "text-red-500" : ""}`}>{stats.atRisk}</div>
                <p className="text-xs text-red-500/80 font-medium">تراكمي أو فصلي &lt; 2.0</p>
              </CardContent>
              {stats.atRisk > 0 && (
                <div className="absolute top-full mt-2 left-0 w-full z-50 hidden group-hover:block">
                  <div className="bg-popover text-popover-foreground border shadow-xl rounded-md p-3 text-sm flex flex-col gap-2">
                    <h4 className="font-bold border-b pb-1 mb-1 text-xs text-muted-foreground">نسبة الإنذار حسب المستوى:</h4>
                    {levelNames.map(lvl => {
                      const riskCount = stats.levelStats[lvl]?.atRisk || 0;
                      if (riskCount === 0) return null;
                      const percentage = ((riskCount / stats.atRisk) * 100).toFixed(1);
                      return (
                        <div key={lvl} className="flex justify-between items-center text-xs">
                          <span>{lvl}</span>
                          <span className="text-red-500 font-bold">{percentage}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* كارت 4: الخريجون المتوقعون */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">خريجون متوقعون</CardTitle>
                <GraduationCap className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.graduating}</div>
                <p className="text-xs text-muted-foreground">تجاوزوا 130 ساعة معتمدة</p>
              </CardContent>
            </Card>
          </div>

          {/* الكارت الجديد: تحليل التعثر الأكاديمي (المواد الأكثر رسوباً) */}
          <Card className="border-destructive/20 shadow-sm">
            <CardHeader className="bg-destructive/5 pb-4 border-b">
              <div className="flex items-center gap-2">
                <BookX className="h-5 w-5 text-destructive" />
                <CardTitle>تحليل التعثر الأكاديمي</CardTitle>
              </div>
              <CardDescription>أكثر المواد التي لم يجتزها الطلاب حتى الآن (مرتبة من الأعلى للأقل).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {stats.failingCourses.length > 0 ? (
                  stats.failingCourses.map((course) => {
                    const isExpanded = expandedCourse === course.code;
                    return (
                      <div key={course.code} className="flex flex-col">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedCourse(isExpanded ? null : course.code)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{course.name}</h4>
                            <p className="text-xs text-muted-foreground">{course.code}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge variant="destructive" className="mb-1">{course.count} طالب متعثر</Badge>
                              <p className="text-[10px] text-muted-foreground">({course.percentage.toFixed(1)}% من الدفعة)</p>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                        
                        {/* تفاصيل الطلاب عند فتح الكورس */}
                        {isExpanded && (
                          <div className="bg-muted/10 p-4 border-t">
                            <h5 className="text-xs font-bold text-muted-foreground mb-3">قائمة الطلاب المتعثرين في هذه المادة:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {course.students.map((st, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-background border p-2 rounded-md text-sm">
                                  <span className="truncate flex-1" title={st.name}>{st.name}</span>
                                  <Badge variant="outline" className="text-[10px] ml-2 shrink-0">{st.level}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">لا يوجد أي حالات رسوب مسجلة حالياً! 🎉</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* قسم كروت الخدمات وإدارة الموقع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link href="/admin/curriculum">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group bg-muted/20">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>إدارة اللائحة والأقسام</CardTitle>
              <CardDescription>إضافة وتعديل المواد، المتطلبات، وإدارة الأقسام الأكاديمية.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/students">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group bg-muted/20">
            <CardHeader>
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>متابعة الطلاب الشاملة</CardTitle>
              <CardDescription>البحث والفلترة، متابعة الأداء الفصلي، التراكمي، وحالة الإنذارات.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/roles">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group bg-muted/20">
            <CardHeader>
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <ShieldCheck className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>إدارة الصلاحيات</CardTitle>
              <CardDescription>تعيين أو إزالة صلاحيات الإدارة للمستخدمين، وحذف الحسابات.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}