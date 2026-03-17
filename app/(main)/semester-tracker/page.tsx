"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, AlertTriangle, CheckCircle2, XCircle, Lock, Plus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { calculateGPA, checkCanTake, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses"; 
import { SemesterData, Grade } from "@/lib/types";
import { getAcademicProfile, saveAcademicProfile, getDepartments, DepartmentItem } from "@/lib/academicActions";

export default function SemesterTrackerPage() {
  const [studentDept, setStudentDept] = useState<string>("");
  const [actualDeptName, setActualDeptName] = useState<string>("");
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const [data, allDepts] = await Promise.all([
        getAcademicProfile(),
        getDepartments()
      ]);
      
      if (data) {
        setStudentDept(data.department || "");
        // استخراج الاسم العربي للقسم للمطابقة
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
    const currentProfile = await getAcademicProfile();
    if (currentProfile) {
      await saveAcademicProfile({ ...currentProfile, semesters: updatedSemesters });
    }
  };

  const effectiveRecords = useMemo(() => {
    const allCourses = semesters.flatMap(s => s.courses);
    return getEffectiveRecords(allCourses);
  }, [semesters]);

  const { gpa, totalCredits } = useMemo(() => 
    calculateGPA(effectiveRecords, coursesCatalog), 
    [effectiveRecords]
  );

  // --- تعديل منطق الفلترة فقط ليدعم الأسماء العربية والمواد العامة ---
  const availableCourses = useMemo(() => {
    return coursesCatalog.filter(c => 
      c.department === actualDeptName || 
      c.department === "المواد العامة (جامعة/كلية)" ||
      c.department === "General"
    );
  }, [actualDeptName]);

  const addSemester = () => {
    const newSem: SemesterData = {
      id: `sem-${Date.now()}`,
      title: `الفصل الدراسي ${semesters.length + 1}`,
      courses: []
    };
    saveSemestersToCloud([...semesters, newSem]);
  };

  if (isLoading) return (
    <div className="flex h-[450px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-right">متابع الفصول الدراسية</h2>
          <p className="text-muted-foreground text-sm text-right">خطط لفصولك الدراسية وشاهد تأثيرها على معدلك التراكمي فوراً.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={addSemester} className="gap-2">
            <Plus className="h-4 w-4" /> إضافة فصل دراسي
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 bg-primary/5 border-primary/20 h-fit sticky top-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" /> الملخص الأكاديمي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div>
              <div className="text-4xl font-black text-primary">{gpa.toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">المعدل التراكمي (GPA)</p>
            </div>
            <div className="pt-4 border-t border-primary/10 flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">إجمالي الساعات</span>
              <span className="text-primary">{totalCredits}</span>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {semesters.map((sem, semIndex) => {
              const semGPA = calculateGPA(sem.courses, coursesCatalog);
              return (
                <Card key={sem.id} className="border-muted-foreground/10 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <div className="text-right">
                      <CardTitle className="text-sm font-bold">{sem.title}</CardTitle>
                      <CardDescription className="text-[10px]">المعدل: {semGPA.gpa.toFixed(2)}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => {
                      if(confirm("حذف هذا الفصل الدراسي؟")) saveSemestersToCloud(semesters.filter(s => s.id !== sem.id));
                    }}><Trash2 className="h-3 w-3" /></Button>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                     <select 
                       className="w-full text-xs p-2 border rounded bg-background mb-2"
                       onChange={(e) => {
                         const code = e.target.value;
                         if(!code) return;
                         const course = coursesCatalog.find(c => c.code === code);
                         if(!course) return;
                         const check = checkCanTake(code, effectiveRecords, coursesCatalog);
                         if(!check.canTake) return alert(check.reason);
                         const updated = [...semesters];
                         updated[semIndex].courses.push({ id: Date.now().toString(), courseCode: code, grade: "A" });
                         saveSemestersToCloud(updated);
                         e.target.value = "";
                       }}
                     >
                       <option value="">+ إضافة مادة لهذا الترم...</option>
                       {availableCourses
                        .filter(c => !sem.courses.some(rc => rc.courseCode === c.code))
                        .map(c => <option key={c.code} value={c.code}>{c.code} - {c.arabicName}</option>)
                       }
                     </select>

                     {sem.courses.map((record) => {
                       const course = coursesCatalog.find(c => c.code === record.courseCode);
                       return (
                         <div key={record.id} className="flex items-center justify-between p-2 rounded bg-muted/20 border border-transparent hover:border-muted-foreground/10 transition-all">
                           <div className="flex-1">
                             <div className="text-xs font-bold text-right">{course?.arabicName}</div>
                             <div className="text-[9px] text-muted-foreground text-right">{record.courseCode} • {course?.credits} س</div>
                           </div>
                           <select 
                             className="text-[10px] font-bold bg-transparent border-none focus:ring-0 cursor-pointer"
                             value={record.grade}
                             onChange={(e) => {
                               const updated = [...semesters];
                               const courseRef = updated[semIndex].courses.find(item => item.id === record.id);
                               if(courseRef) courseRef.grade = e.target.value as Grade;
                               saveSemestersToCloud(updated);
                             }}
                           >
                             {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "Fail", "Taken"].map(g => <option key={g} value={g}>{g}</option>)}
                           </select>
                           <Button variant="ghost" size="icon" className="h-8 w-8 ml-1 text-muted-foreground hover:text-destructive" onClick={() => {
                             const updated = [...semesters]; updated[semIndex].courses = updated[semIndex].courses.filter(item => item.id !== record.id); saveSemestersToCloud(updated);
                           }}><XCircle className="h-4 w-4" /></Button>
                         </div>
                       )
                     })}

                     {sem.courses.length === 0 && (
                       <div className="text-center text-xs text-muted-foreground pt-2">
                         لم تقم بتسجيل مواد في هذا الترم بعد.
                       </div>
                     )}
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
        </div>
      </div>
    </div>
  );
}