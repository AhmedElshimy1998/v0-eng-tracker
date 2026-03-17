"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Send, Loader2, Filter } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // حالات الفلترة
  const [filters, setFilters] = useState({
    department: "all",
    level: "all",
    isSenior: false,
    courseName: ""
  });

  const handleSend = async () => {
    if (!title || !message) return alert("يرجى كتابة العنوان والرسالة.");
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, filters })
      });
      const data = await res.json();
      if (data.success) {
        alert(`تم الإرسال لـ ${data.targetedCount} طالب (إجمالي أجهزة: ${data.sentCount})`);
      }
    } catch (e) { alert("خطأ في الاتصال"); }
    finally { setIsSending(false); }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold">رادار الإشعارات الذكي 🎯</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* عمود الفلاتر */}
        <Card className="md:col-span-1 border-blue-500/20">
          <CardHeader className="bg-blue-500/5">
            <CardTitle className="text-sm flex items-center gap-2"><Filter className="h-4 w-4"/> تحديد الفئة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="text-xs font-bold">القسم</label>
              <select className="w-full mt-1 border rounded p-2 text-sm" 
                onChange={(e) => setFilters({...filters, department: e.target.value})}>
                <option value="all">كل الأقسام</option>
                <option value="Mechatronics">ميكاترونيكس</option>
                <option value="Autotronics">أوتوترونيكس</option>
                <option value="Information Technology">تكنولوجيا المعلومات</option>
                <option value="Renewable Energy">طاقة متجددة</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold">المستوى</label>
              <select className="w-full mt-1 border rounded p-2 text-sm"
                onChange={(e) => setFilters({...filters, level: e.target.value})}>
                <option value="all">كل المستويات</option>
                <option value="0">المستوى الصفري (إعدادي)</option>
                <option value="1">المستوى الأول</option>
                <option value="2">المستوى الثاني</option>
                <option value="3">المستوى الثالث</option>
                <option value="4">المستوى الرابع</option>
              </select>
            </div>
            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" onChange={(e) => setFilters({...filters, isSenior: e.target.checked})} />
              <label className="text-sm">الخريجين فقط (+130 ساعة)</label>
            </div>
            <div>
              <label className="text-xs font-bold">مسجلي مادة (اختياري)</label>
              <Input placeholder="اسم المادة أو كودها" className="text-sm" 
                onChange={(e) => setFilters({...filters, courseName: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* عمود الرسالة */}
        <Card className="md:col-span-2 border-purple-500/20">
          <CardHeader className="bg-purple-500/5 text-purple-600">
            <CardTitle className="text-sm flex items-center gap-2"><BellRing className="h-4 w-4"/> محتوى الرسالة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input placeholder="عنوان الإشعار..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="اكتب رسالتك هنا..." className="min-h-[150px]" value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold" onClick={handleSend} disabled={isSending}>
              {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 ml-2" />}
              إطلاق الإشعار الآن
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}