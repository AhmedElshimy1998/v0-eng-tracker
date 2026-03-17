"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calculator, TrendingUp, RefreshCw } from "lucide-react";
import { getAcademicProfile } from "@/lib/academicActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/gpaLogic";
import { coursesCatalog } from "@/lib/courses";

export default function GPASimulator() {
  const [currentStats, setCurrentStats] = useState({ gpa: 0, credits: 0 });
  const [simulatedCourses, setSimulatedCourses] = useState([{ id: 1, credits: 3, grade: "A" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAcademicProfile().then(profile => {
      if (profile) {
        const allRecords = (profile.semesters || []).flatMap((s: any) => s.courses);
        const effective = getEffectiveRecords(allRecords);
        const { gpa, totalCredits } = calculateGPA(effective, coursesCatalog);
        setCurrentStats({ gpa, credits: totalCredits });
      }
      setLoading(false);
    });
  }, []);

  const addCourse = () => {
    setSimulatedCourses([...simulatedCourses, { id: Date.now(), credits: 3, grade: "A" }]);
  };

  const removeCourse = (id: number) => {
    setSimulatedCourses(simulatedCourses.filter(c => c.id !== id));
  };

  const updateCourse = (id: number, field: string, value: any) => {
    setSimulatedCourses(simulatedCourses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // مصفوفة النقاط للتقديرات
  const gradePoints: Record<string, number> = {
    "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0
  };

  // حساب الـ GPA المتوقع
  const calculateSimulatedGPA = () => {
    let totalPoints = currentStats.gpa * currentStats.credits;
    let totalCredits = currentStats.credits;

    simulatedCourses.forEach(c => {
      totalPoints += (gradePoints[c.grade] || 0) * Number(c.credits);
      totalCredits += Number(c.credits);
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">جاري تحميل بياناتك الحالية...</div>;

  const resultGpa = calculateSimulatedGPA();

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">محاكي المعدل التراكمي (GPA)</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* النتائج */}
        <Card className="md:col-span-1 bg-primary/5 border-primary/20 h-fit sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">النتيجة المتوقعة</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-5xl font-black text-primary">{resultGpa}</div>
            <p className="text-sm text-muted-foreground">معدلك التراكمي الجديد</p>
            <div className="pt-4 border-t text-right space-y-2">
              <div className="flex justify-between text-sm">
                <span>المعدل الحالي:</span>
                <span className="font-bold">{currentStats.gpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الساعات الحالية:</span>
                <span className="font-bold">{currentStats.credits}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إضافة المواد */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>توقع درجاتك للترم القادم</CardTitle>
            <CardDescription>أضف المواد التي تنوي تسجيلها والتقدير الذي تطمح للحصول عليه.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {simulatedCourses.map((course, index) => (
              <div key={course.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg animate-in fade-in slide-in-from-right-2">
                <span className="text-xs font-bold text-muted-foreground w-6">{index + 1}</span>
                <div className="flex-1">
                  <Input 
                    type="number" 
                    placeholder="الساعات" 
                    value={course.credits} 
                    onChange={(e) => updateCourse(course.id, "credits", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <select 
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={course.grade}
                    onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                  >
                    {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeCourse(course.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" className="w-full border-dashed gap-2" onClick={addCourse}>
              <Plus className="h-4 w-4" /> إضافة مادة للمحاكاة
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}