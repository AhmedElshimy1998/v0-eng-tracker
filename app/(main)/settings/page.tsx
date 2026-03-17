"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, GraduationCap, Save } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");

  // جلب البيانات المحفوظة أول ما الصفحة تفتح
  useEffect(() => {
    setName(localStorage.getItem("studentName") || "");
    setPhone(localStorage.getItem("studentPhone") || "");
    setDepartment(localStorage.getItem("studentDepartment") || "");
  }, []);

  const handleSave = () => {
    localStorage.setItem("studentName", name);
    localStorage.setItem("studentPhone", phone);
    localStorage.setItem("studentDepartment", department);
    alert("تم حفظ الإعدادات بنجاح! سيتم تحديث خطتك الأكاديمية بناءً على قسمك.");
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إعدادات الحساب</h2>
          <p className="text-muted-foreground">قم بتحديث بياناتك الأكاديمية والشخصية.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البيانات الشخصية والأكاديمية</CardTitle>
          <CardDescription>هذه البيانات ستساعدنا في تخصيص تجربتك وعرض المواد الخاصة بقسمك فقط.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> الاسم الرباعي
            </label>
            <Input 
              placeholder="أدخل اسمك بالكامل..." 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" /> رقم الهاتف
            </label>
            <Input 
              placeholder="أدخل رقم الهاتف..." 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" /> القسم الدراسي
            </label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="" disabled>اختر تخصصك الأكاديمي...</option>
              <option value="Mechatronics">هندسة الميكاترونيات</option>
              <option value="Energy">هندسة الطاقة والنظم الكهربية</option>
              <option value="Civil">الهندسة المدنية</option>
              <option value="Architecture">الهندسة المعمارية</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md border-l-2 border-primary">
              ملاحظة هامة: إذا لم تقم باختيار قسم، ستظهر لك متطلبات الجامعة والكلية (المواد العامة) فقط في خطتك الدراسية.
            </p>
          </div>

          <Button className="w-full gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" /> حفظ التغييرات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}