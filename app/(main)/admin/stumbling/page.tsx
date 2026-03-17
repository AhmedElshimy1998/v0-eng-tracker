"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, BookX, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

import { getAllStudents } from "@/lib/adminActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

interface FailedCourse {
  code: string;
  name: string;
  count: number;
  percentage: number;
  students: { name: string; level: string }[];
}

const levelNames = ["المستوى الصفري", "المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع"];

export default function AcademicStumblingPage() {
  const [failingCourses, setFailingCourses] = useState<FailedCourse[]>([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getLevel = (credits: number) => {
    const levelNum = Math.floor(credits / 32);
    return levelNames[Math.min(levelNum, 4)];
  };

  useEffect(() => {
    const fetchStumblingData = async () => {
      const students = await getAllStudents();
      setTotalStudentsCount(students.length);
      
      if (students.length === 0) {
        setIsLoading(false);
        return;
      }

      const failedCoursesMap: Record<string, { count: number, students: {name: string, level: string}[] }> = {};

      students.forEach(student => {
        const semesters = student.profile.semesters || [];
        const allRecords = semesters.flatMap((s: any) => s.courses);
        const effectiveRecords = getEffectiveRecords(allRecords);
        const { totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);
        
        const level = getLevel(totalCredits);

        // حساب المواد الأكثر رسوباً (التي لم يتم اجتيازها بعد)
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

      const failingCoursesArray = Object.keys(failedCoursesMap).map(code => {
         const info = coursesCatalog.find(c => c.code === code);
         return {
            code,
            name: info?.arabicName || code,
            count: failedCoursesMap[code].count,
            percentage: (failedCoursesMap[code].count / students.length) * 100,
            students: failedCoursesMap[code].students
         }
      }).sort((a, b) => b.count - a.count);

      setFailingCourses(failingCoursesArray);
      setIsLoading(false);
    };

    fetchStumblingData();
  }, []);

  // فلترة المواد بالبحث
  const filteredCourses = useMemo(() => {
    return failingCourses.filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [failingCourses, searchTerm]);

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تحليل التعثر الأكاديمي</h2>
          <p className="text-muted-foreground">تقرير مفصل للمواد ذات نسب الرسوب العالية بين الطلاب الحاليين.</p>
        </div>
      </div>

      <Card className="border-destructive/20 shadow-sm">
        <CardHeader className="bg-destructive/5 pb-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookX className="h-6 w-6 text-destructive" />
              <div>
                <CardTitle>قائمة المواد المتعثرة</CardTitle>
                <CardDescription>مرتبة من الأعلى رسوباً إلى الأقل.</CardDescription>
              </div>
            </div>
            {/* شريط بحث ذكي داخل الكارت */}
            <div className="relative w-full md:w-72">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="ابحث باسم المادة أو الكود..." 
                className="pr-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const isExpanded = expandedCourse === course.code;
                return (
                  <div key={course.code} className="flex flex-col">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedCourse(isExpanded ? null : course.code)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.code}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-1 text-sm py-1">{course.count} طالب متعثر</Badge>
                          <p className="text-xs text-muted-foreground font-medium">({course.percentage.toFixed(1)}% من إجمالي الدفعة)</p>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="bg-muted/10 p-5 border-t">
                        <h5 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4" /> قائمة بأسماء الطلاب (حسب المستوى):
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {course.students.map((st, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-background border p-3 rounded-md shadow-sm">
                              <span className="font-medium text-sm truncate flex-1" title={st.name}>{st.name}</span>
                              <Badge variant="outline" className="text-xs ml-2 shrink-0">{st.level}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                {searchTerm ? "لا توجد مواد متعثرة تطابق بحثك." : "لا يوجد أي حالات رسوب مسجلة حالياً! 🎉"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}