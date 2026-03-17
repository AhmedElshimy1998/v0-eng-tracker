"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2, Edit, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// استيراد الداتا الحقيقية
import { coursesCatalog } from "@/lib/courses";

export default function AdminPage() {
  const [selectedDept, setSelectedDept] = useState("General");

  // فلترة المواد بناءً على القسم المختار من القائمة الجانبية
  const filteredCourses = coursesCatalog.filter(course => course.department === selectedDept);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">لوحة إدارة اللائحة</h2>
          <p className="text-muted-foreground">إدارة المواد الدراسية، المتطلبات، والأقسام الأكاديمية.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none">
            <Upload className="h-4 w-4" /> استيراد CSV
          </Button>
          <Button className="gap-2 flex-1 md:flex-none">
            <Plus className="h-4 w-4" /> إضافة مادة يدوياً
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* قائمة الأقسام (Sidebar داخلي) */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" /> الأقسام
            </CardTitle>
            <CardDescription>اختر القسم لعرض مواده</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 flex flex-col">
            {[
              { id: "General", name: "المواد العامة (جامعة/كلية)" },
              { id: "Mechatronics", name: "هندسة الميكاترونيات" },
              { id: "Energy", name: "هندسة الطاقة والنظم" }
            ].map((dept) => (
              <Button 
                key={dept.id} 
                variant={selectedDept === dept.id ? "default" : "ghost"} 
                className="w-full justify-start font-medium"
                onClick={() => setSelectedDept(dept.id)}
              >
                {dept.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* جدول عرض المواد */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedDept === "General" ? "المواد العامة المتاحة لجميع الطلاب" : `مواد قسم: ${selectedDept}`}
            </CardTitle>
            <CardDescription>إجمالي المواد في هذا القسم: {filteredCourses.length} مادة</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="rounded-md border min-w-[800px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-right">الكود</th>
                    <th className="px-4 py-3 font-medium text-right">اسم المادة</th>
                    <th className="px-4 py-3 font-medium text-center">الساعات</th>
                    <th className="px-4 py-3 font-medium text-right">المتطلبات</th>
                    <th className="px-4 py-3 font-medium text-center">الترم المثالي</th>
                    <th className="px-4 py-3 font-medium text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <tr key={course.code} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-right">{course.code}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium">{course.arabicName}</div>
                          <div className="text-xs text-muted-foreground">{course.category}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{course.credits}</td>
                        <td className="px-4 py-3 text-right">
                          {course.prerequisites.length > 0 ? (
                            <div className="flex gap-1 flex-wrap justify-start">
                              {course.prerequisites.map(p => (
                                <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="bg-background">
                            {course.idealSemester.replace("Level ", "L").replace(" - Term ", " T")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        لا توجد مواد مسجلة في هذا القسم حتى الآن.
                      </td>
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