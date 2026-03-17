"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2, Edit, Settings, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { coursesCatalog } from "@/lib/courses";
import { getDepartments, saveDepartments, DepartmentItem } from "@/lib/academicActions";

export default function AdminPage() {
  const [selectedDept, setSelectedDept] = useState("General");
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDepts = async () => {
      const data = await getDepartments();
      setDepartments(data);
      setIsLoading(false);
    };
    loadDepts();
  }, []);

  const handleAddDepartment = async () => {
    if (!newDeptName) return;
    const newId = newDeptName.trim().replace(/\s+/g, '_');
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
      if (selectedDept === id) setSelectedDept("General");
      await saveDepartments(updated);
    }
  };

  const filteredCourses = coursesCatalog.filter(course => course.department === selectedDept);

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">لوحة إدارة اللائحة</h2>
          <p className="text-muted-foreground">إدارة المواد الدراسية، المتطلبات، والأقسام الأكاديمية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* قائمة الأقسام مع الإضافة والحذف */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" /> إدارة الأقسام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center gap-2">
                <Button 
                  variant={selectedDept === dept.id ? "default" : "ghost"} 
                  className="flex-1 justify-start font-medium text-xs md:text-sm truncate"
                  onClick={() => setSelectedDept(dept.id)}
                >
                  {dept.name}
                </Button>
                {dept.id !== "General" && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDeleteDepartment(dept.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <div className="pt-4 mt-2 border-t space-y-2">
              <p className="text-xs text-muted-foreground">إضافة قسم جديد:</p>
              <div className="flex gap-2">
                <Input placeholder="اسم القسم..." value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="h-9 text-sm" />
                <Button size="icon" onClick={handleAddDepartment} className="h-9 w-9 shrink-0"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الجدول تم حل مشكلة المقاس والمحاذاة فيه */}
        <Card className="md:col-span-3 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>{selectedDept === "General" ? "المواد العامة المتاحة لجميع الطلاب" : `مواد قسم: ${departments.find(d => d.id === selectedDept)?.name}`}</CardTitle>
            <CardDescription>إجمالي المواد: {filteredCourses.length} مادة</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-x-auto">
            <div className="min-w-max p-6 pt-0">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">الكود</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">اسم المادة</th>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">الساعات</th>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">المتطلبات</th>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">الترم المثالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <tr key={course.code} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">{course.code}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{course.arabicName}</div>
                          <div className="text-xs text-muted-foreground">{course.category}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{course.credits}</td>
                        {/* تعديل المنتصف لعمود المتطلبات */}
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
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="bg-background whitespace-nowrap">
                            {course.idealSemester.replace("Level ", "L").replace(" - Term ", " T")}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">لا توجد مواد مسجلة في هذا القسم.</td>
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