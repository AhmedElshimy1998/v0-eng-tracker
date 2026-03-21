"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronDown, ChevronUp, Search, Filter, BookOpen, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

import { getAllStudents, saveAdvisingNotes, getAdvisingNotes } from "@/lib/adminActions";
import { getDepartments, DepartmentItem } from "@/lib/academicActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";




export default function StudentsTrackingPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // فلاتر البحث
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const [studentsData, deptsData] = await Promise.all([
        getAllStudents(),
        getDepartments()
      ]);
      setStudents(studentsData);
      setDepartments(deptsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const getLevel = (credits: number) => {
    const levelNum = Math.floor(credits / 32);
    const levels = ["المستوى الصفري", "المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع"];
    return levels[Math.min(levelNum, 4)];
  };

  // تحضير وتصفية البيانات بناءً على البحث والمستوى
  const filteredStudents = useMemo(() => {
    return students.map(student => {
      const profile = student.profile;
      const semesters = profile.semesters || [];
      const allRecords = semesters.flatMap((s: any) => s.courses);
      const effectiveRecords = getEffectiveRecords(allRecords);
      const { gpa: cgpa, totalCredits, failedCredits } = calculateGPA(effectiveRecords, coursesCatalog);
      
      const activeSemesters = semesters.filter((s: any) => s.courses.length > 0);
      const lastSemester = activeSemesters[activeSemesters.length - 1];
      let lastSemStats = null;
      let lastSemTakenHours = 0;
      
      // ✅ الحل: حسبة ساعات النجاح الفعلية فقط (استبعاد F, Fail, Taken)
    const passedCredits = effectiveRecords
      .filter(r => !['F', 'Fail', 'Taken', '-'].includes(r.grade))
      .reduce((sum, r) => {
        const course = coursesCatalog.find(c => c.code === r.courseCode);
        return sum + (course?.credits || 0);
      }, 0);

      if (lastSemester) {
        lastSemStats = calculateGPA(lastSemester.courses, coursesCatalog);
        lastSemester.courses.forEach((c: any) => {
          const info = coursesCatalog.find(cat => cat.code === c.courseCode);
          if (info) lastSemTakenHours += info.credits;
        });
      }

      const levelName = getLevel(passedCredits);
      // توحيد اسم القسم بناءً على الداتا بيز بتاعة الإدارة
      const deptName = departments.find(d => d.id === profile.department)?.name || (profile.department === "General" ? "المواد العامة" : profile.department);

      return {
        ...student,
        computed: {
          cgpa, totalCredits, failedCredits, activeSemesters, lastSemStats, lastSemTakenHours, levelName, deptName, passedCredits
        }
      };
    }).filter(student => {
      // الفلترة بالاسم أو رقم التليفون
      const searchMatch = 
        (student.profile.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.profile.phone || "").includes(searchTerm);
      
      // الفلترة بالمستوى
      const levelMatch = selectedLevel === "all" || student.computed.levelName === selectedLevel;

      return searchMatch && levelMatch;
    });
  }, [students, searchTerm, selectedLevel, departments]);


  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">متابعة الطلاب</h2>
          <p className="text-muted-foreground">إجمالي الطلاب المسجلين بالمنصة: {students.length}</p>
        </div>
      </div>

      {/* شريط البحث والفلترة الجديد */}
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث بالاسم أو رقم الهاتف..." 
              className="pr-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select 
              className="h-10 w-full md:w-auto rounded-md border border-input bg-background px-3 text-sm outline-none"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">جميع المستويات</option>
              <option value="المستوى الصفري">المستوى الصفري</option>
              <option value="المستوى الأول">المستوى الأول</option>
              <option value="المستوى الثاني">المستوى الثاني</option>
              <option value="المستوى الثالث">المستوى الثالث</option>
              <option value="المستوى الرابع">المستوى الرابع</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredStudents.map((student) => {
          const { profile, computed } = student;
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
                    <p className="text-sm text-muted-foreground">{profile.phone || "لا يوجد هاتف"} • {computed.deptName}</p>
                  </div>
                  <Badge variant="outline" className="w-fit">{computed.levelName}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold">التراكمي: <span className={computed.cgpa >= 2 ? "text-green-500" : "text-red-500"}>{computed.cgpa.toFixed(2)}</span></p>
                    <p className="text-xs text-muted-foreground">ساعات النجاح: {computed.passedCredits}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>
                  
              {isExpanded && (
                <div className="border-t bg-muted/10 p-4 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">إجمالي ساعات النجاح</p>
                      <p className="font-bold text-lg text-green-500">{computed.passedCredits}</p>
                    </div>
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">ساعات الرسوب الكلية</p>
                      <p className="font-bold text-lg text-red-500">{computed.failedCredits}</p>
                    </div>
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">معدل آخر ترم</p>
                      <p className="font-bold text-lg">{computed.lastSemStats ? computed.lastSemStats.gpa.toFixed(2) : "-"}</p>
                    </div>
                    <div className="bg-background border p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">إجمالي ساعات آخر ترم</p>
                      <p className="font-bold text-lg">{computed.lastSemTakenHours}</p>
                    </div>
                  </div>

                  <div>

                    {/* --- سجل الجلسات الإرشادية (جديد) --- */}
                  {/* --- سجل الجلسات الإرشادية (حفظ تلقائي) --- */}
                  <div className="bg-background border rounded-lg p-4 mb-6 shadow-sm border-blue-500/20">
                    <h4 className="font-semibold text-sm mb-2 text-blue-600 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> سجل الجلسات الإرشادية (سري - يظهر للمرشدين فقط)
                    </h4>
                    <p className="text-[10px] text-muted-foreground mb-3 italic">ملاحظة: يتم حفظ التعديلات تلقائياً عند الخروج من المربع.</p>
                    <div className="flex gap-2 items-start">
                      <textarea 
                        className="flex-1 min-h-[80px] text-sm p-3 rounded-md border bg-muted/30 outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="سجل ملاحظاتك هنا عن حالة الطالب..."
                        defaultValue={student.advisingNotes || ""} 
                        onBlur={(e) => {
                          const val = e.target.value;
                          saveAdvisingNotes(student.userId, val);
                        }}
                      />
                    </div>
                  </div>
                    <h4 className="font-semibold mb-3 border-b pb-2">الفصول الدراسية المسجلة</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {computed.activeSemesters.map((sem: any) => {
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
        {filteredStudents.length === 0 && (
          <p className="text-center text-muted-foreground py-8">لا يوجد نتائج تطابق بحثك.</p>
        )}
      </div>
    </div>
  );
}