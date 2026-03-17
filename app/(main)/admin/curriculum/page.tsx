"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Settings, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { coursesCatalog } from "@/lib/courses";
import { getDepartments, saveDepartments, DepartmentItem } from "@/lib/academicActions";

export default function AdminPage() {
  const [selectedDeptId, setSelectedDeptId] = useState("General");
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const loadDepts = async () => {
    const data = await getDepartments();
    // التأكد من وجود القسم العام بالاسم الصحيح في القائمة
    const hasGeneral = data.some(d => d.id === "General");
    if (!hasGeneral) {
      const defaultGeneral = { id: "General", name: "المواد العامة (جامعة/كلية)" };
      setDepartments([defaultGeneral, ...data]);
    } else {
      setDepartments(data);
    }
    setIsLoading(false);
  };
  loadDepts();
}, []);

  const handleAddDepartment = async () => {
    if (!newDeptName) return;
    // الـ ID بيفضل إنجليزي أو مختصر، لكننا هنقارن بالاسم
    const newId = `dept_${Date.now()}`; 
    const updated = [...departments, { id: newId, name: newDeptName }];
    setDepartments(updated);
    setNewDeptName("");
    await saveDepartments(updated);
  };

  const handleDeleteDepartment = async (id: string) => {
    if (id === "General") return alert("لا يمكن حذف قسم المواد العامة الأساسي!");
    if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      const updated = departments.filter(d => d.id !== id);
      setDepartments(updated);
      if (selectedDeptId === id) setSelectedDeptId("General");
      await saveDepartments(updated);
    }
  };
// تحديد الاسم العربي للقسم المختار بدقة
const currentDept = departments.find(d => d.id === selectedDeptId);
const currentDeptName = currentDept ? currentDept.name : "المواد العامة (جامعة/كلية)";

// الفلترة بناءً على الاسم الكامل
const filteredCourses = coursesCatalog.filter(course => {
  if (selectedDeptId === "General") {
    // البحث بكل المسميات المحتملة للقسم العام لضمان الظهور
    return course.department === "General" || 
           course.department === "المواد العامة" || 
           course.department === "المواد العامة (جامعة/كلية)";
  }
  return course.department === currentDeptName;
});

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">لوحة إدارة اللائحة</h2>
          <p className="text-muted-foreground">إدارة المواد الدراسية، المتطلبات، والأقسام الأكاديمية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 justify-end">
              إدارة الأقسام <Settings className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center gap-2">
                {dept.id !== "General" && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDeleteDepartment(dept.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant={selectedDeptId === dept.id ? "default" : "ghost"} 
                  className="flex-1 justify-start font-medium text-xs md:text-sm truncate text-right"
                  onClick={() => setSelectedDeptId(dept.id)}
                >
                  {dept.name}
                </Button>
              </div>
            ))}
            
            <div className="pt-4 mt-2 border-t space-y-2">
              <p className="text-xs text-muted-foreground">إضافة قسم جديد:</p>
              <div className="flex gap-2">
                <Button size="icon" onClick={handleAddDepartment} className="h-9 w-9 shrink-0"><Plus className="h-4 w-4" /></Button>
                <Input placeholder="اسم القسم..." value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="h-9 text-sm text-right" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>{selectedDeptId === "General" ? "المواد العامة المتاحة لجميع الطلاب" : `مواد قسم: ${currentDeptName}`}</CardTitle>
            <CardDescription>إجمالي المواد: {filteredCourses.length} مادة</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-x-auto">
            <div className="min-w-max p-6 pt-0">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">الترم المثالي</th>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">المتطلبات</th>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">الساعات</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">اسم المادة</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">الكود</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <tr key={course.code} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="bg-background whitespace-nowrap">
                            {course.idealSemester.replace("Level ", "L").replace(" - Term ", " T")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center align-middle">
                          {course.prerequisites.length > 0 ? (
                            <div className="flex gap-1 flex-wrap justify-center items-center">
                              {course.prerequisites.map(p => (
                                <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground flex justify-center">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{course.credits}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{course.arabicName}</div>
                          <div className="text-xs text-muted-foreground">{course.category}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">{course.code}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">لا توجد مواد مسجلة في هذا القسم تطابق اسم "{currentDeptName}".</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}