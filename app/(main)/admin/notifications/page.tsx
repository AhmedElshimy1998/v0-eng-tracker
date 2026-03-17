"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Send, Loader2, Filter } from "lucide-react";
import { getDepartments, DepartmentItem } from "@/lib/academicActions"; // استيراد دالة جلب الأقسام

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  const [filters, setFilters] = useState({
    department: "all",
    level: "all",
    isSenior: false,
    courseName: ""
  });

  // جلب الأقسام الحقيقية عند تحميل الصفحة
  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  const handleSend = async () => {
    if (!title || !message) return alert("يرجى كتابة العنوان والرسالة.");
    setIsSending(true);
    
    try {
      const response = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, filters })
      });
      
      const data = await response.json();
      
      console.log("=== تقرير سيرفر الإشعارات ===");
      if (data.logs) data.logs.forEach((l: string) => console.log(l));
      console.log("============================");

      if (data.success) {
        // تم تصحيح اسم المتغير هنا ليتطابق مع السيرفر
        alert(`اكتملت العملية!\nتم الإرسال لـ ${data.targetedUsers} طالب.\nإجمالي الأجهزة المستلمة: ${data.sentCount}`);
        setTitle(""); setMessage("");
      } else {
        alert("حدث خطأ: " + data.error);
      }
    } catch (error) {
      alert("تعذر الاتصال بالسيرفر.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto text-right" dir="rtl">
      <h2 className="text-3xl font-bold tracking-tight">رادار الإشعارات الذكي 🎯</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-blue-500/20">
          <CardHeader className="bg-blue-500/5">
            <CardTitle className="text-sm flex items-center gap-2 justify-end"><Filter className="h-4 w-4"/> تحديد الفئة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="text-xs font-bold">القسم</label>
              <select 
                className="w-full mt-1 border rounded p-2 text-sm bg-background" 
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              >
                <option value="all">كل الأقسام</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold">المستوى</label>
              <select className="w-full mt-1 border rounded p-2 text-sm bg-background"
                value={filters.level}
                onChange={(e) => setFilters({...filters, level: e.target.value})}>
                <option value="all">كل المستويات</option>
                <option value="0">المستوى الصفري</option>
                <option value="1">المستوى الأول</option>
                <option value="2">المستوى الثاني</option>
                <option value="3">المستوى الثالث</option>
                <option value="4">المستوى الرابع</option>
              </select>
            </div>
            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" id="senior" checked={filters.isSenior} onChange={(e) => setFilters({...filters, isSenior: e.target.checked})} />
              <label htmlFor="senior" className="text-sm">الخريجين فقط (+130 ساعة)</label>
            </div>
            <div>
              <label className="text-xs font-bold">مسجلي مادة (كود أو اسم)</label>
              <Input placeholder="مثال: MATH101 أو رياضيات" className="text-sm" 
                value={filters.courseName}
                onChange={(e) => setFilters({...filters, courseName: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-purple-500/20">
          <CardHeader className="bg-purple-500/5 text-purple-600">
            <CardTitle className="text-sm flex items-center gap-2 justify-end"><BellRing className="h-4 w-4"/> محتوى الرسالة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input placeholder="عنوان الإشعار..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="اكتب رسالتك هنا..." className="min-h-[150px]" value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold text-white" onClick={handleSend} disabled={isSending}>
              {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 ml-2" />}
              إطلاق الإشعار الآن
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}