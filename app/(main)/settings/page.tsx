"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, GraduationCap, Save, Loader2 } from "lucide-react";
// استيراد دوال الداتا بيز (تأكد من المسار)
import { getAcademicProfile, saveAcademicProfile } from "@/lib/academicActions"; 

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // جلب البيانات من Vercel KV أول ما الصفحة تفتح
  useEffect(() => {
    const loadData = async () => {
      const data = await getAcademicProfile();
      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
        setDepartment(data.department || "");
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAcademicProfile({ name, phone, department });
    setIsSaving(false);
    
    if (result.success) {
      alert("تم حفظ الإعدادات بنجاح في السحابة!");
    } else {
      alert("حدث خطأ أثناء الحفظ.");
    }
  };

  if (isLoading) return <div className="p-8 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> جاري تحميل بياناتك...</div>;

  return (
    // ... نفس كود الـ UI اللي بعتهولك في الرسالة اللي فاتت بالضبط ...
    // (بدون أي تغيير في التصميم، بس زرار الحفظ هيربط بـ handleSave الجديدة)
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