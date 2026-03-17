"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function StudentsTrackingPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getAllStudents().then(data => {
      setStudents(data);
      setIsLoading(false);
    });
  }, []);

  const getLevel = (credits: number) => {
    const levelNum = Math.floor(credits / 32); // يتم زيادة المستوى كل 32 ساعة ناجحة
    const levels = ["المستوى الصفري", "المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع"];
    return levels[Math.min(levelNum, 4)];
  };

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">متابعة الطلاب</h2>
        <p className="text-muted-foreground">إجمالي الطلاب المسجلين بالمنصة: {students.length}</p>
      </div>

      <div className="space-y-4">
        {students.map((student) => {
          const profile = student.profile;
          const semesters = profile.semesters || [];
          
          // الحسابات العامة للطالب
          const allRecords = semesters.flatMap((s: any) => s.courses);
          const effectiveRecords = getEffectiveRecords(allRecords);
          const { gpa: cgpa, totalCredits, failedCredits } = calculateGPA(effectiveRecords, coursesCatalog);
          
          // حسابات آخر ترم مسجل فيه مواد
          const activeSemesters = semesters.filter((s: any) => s.courses.length > 0);
          const lastSemester = activeSemesters[activeSemesters.length - 1];
          let lastSemStats = null;
          let lastSemTakenHours = 0;
          
          if (lastSemester) {
            lastSemStats = calculateGPA(lastSemester.courses, coursesCatalog);
            // حساب الساعات المسجلة (حتى لو قيد الدراسة Taken)
            lastSemester.courses.forEach((c: any) => {
              const info = coursesCatalog.find(cat => cat.code === c.courseCode);
              if (info) lastSemTakenHours += info.credits;
            });
          }

          const isExpanded = expandedId === student.userId;

          return (
            <Card key={student.userId} className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : student.userId)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <div>
                    <h3 className="font-bold text-lg">{profile.name || "طالب بدون اسم"}</h3>
                    <p className="text-sm text-muted-foreground">{profile.phone || "لا يوجد هاتف"} • {profile.department || "عام"}</p>
                  </div>
                  <Badge variant="outline" className="w-fit">{getLevel(totalCredits)}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold">التراكمي: <span className={cgpa >= 2 ? "text-green-500" : "text-red-500"}>{cgpa.toFixed(2)}</span></p>
                    <p className="text-xs text-muted-foreground">ساعات النجاح: {totalCredits}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/10 p-4 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">إجمالي ساعات النجاح</p>
                      <p className="font-bold text-lg text-green-500">{totalCredits}</p>
                    </div>
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">ساعات الرسوب الكلية</p>
                      <p className="font-bold text-lg text-red-500">{failedCredits}</p>
                    </div>
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">معدل آخر ترم</p>
                      <p className="font-bold text-lg">{lastSemStats ? lastSemStats.gpa.toFixed(2) : "-"}</p>
                    </div>
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">إجمالي ساعات آخر ترم</p>
                      <p className="font-bold text-lg">{lastSemTakenHours}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 border-b pb-2">الفصول الدراسية المسجلة</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {activeSemesters.map((sem: any) => {
                        const stats = calculateGPA(sem.courses, coursesCatalog);
                        return (
                          <div key={sem.name} className="border rounded-md p-3 bg-background">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{sem.name}</span>
                              <Badge variant="secondary">GPA: {stats.gpa.toFixed(2)}</Badge>
                            </div>
                            <div className="space-y-1">
                              {sem.courses.map((c: any) => {
                                const info = coursesCatalog.find(cat => cat.code === c.courseCode);
                                return (
                                  <div key={c.courseCode} className="flex justify-between text-xs text-muted-foreground">
                                    <span>{info?.arabicName || c.courseCode}</span>
                                    <span className={c.grade === 'F' || c.grade === 'Fail' ? 'text-red-500 font-bold' : ''}>{c.grade}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {students.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد طلاب مسجلين حتى الآن.</p>}
      </div>
    </div>
  );
}