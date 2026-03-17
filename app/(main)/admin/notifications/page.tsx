"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Send, Loader2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) return alert("يرجى كتابة العنوان والرسالة.");
    setIsSending(true);
    
    try {
      const response = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, audience })
      });
      
      const data = await response.json();
      
      // طباعة تقرير السيرفر في كونسول المتصفح (F12) للتأكد من الإرسال
      console.log("=== تقرير سيرفر الإشعارات ===");
      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach((log: string) => console.log(log));
      }
      console.log("============================");

      if (data.success) {
        alert(`تمت العملية! وصل الإشعار لـ ${data.sentCount} جهاز.`);
        setTitle(""); 
        setMessage("");
      } else {
        alert("حدث خطأ أثناء الإرسال. راجع كونسول المتصفح.");
      }
    } catch (error) {
      alert("تعذر الاتصال بالخادم.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">التواصل والإشعارات الموجهة</h2>
        <p className="text-muted-foreground">إرسال إشعارات تظهر فوراً على هواتف وحواسيب الطلاب مثل تنبيهات المحاضرات.</p>
      </div>

      <Card className="border-purple-500/20 shadow-sm">
        <CardHeader className="bg-purple-500/5 pb-4 border-b border-purple-500/10">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-purple-500" />
            <CardTitle>صياغة رسالة جديدة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">الفئة المستهدفة</label>
            <select 
              className="w-full h-10 rounded-md border bg-background px-3 text-sm outline-none"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="all">جميع الطلاب (المسجلين في الإشعارات)</option>
              {/* ملاحظة: الفئات الأخرى ستحتاج ربط مع داتا Clerk لاحقاً */}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">عنوان الإشعار</label>
            <Input 
              placeholder="تنبيه Engineering Tracker" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">محتوى الرسالة</label>
            <Textarea 
              placeholder="اكتب رسالتك هنا..." 
              className="min-h-[120px]"
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
            />
          </div>

          <Button 
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold" 
            onClick={handleSend} 
            disabled={isSending}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSending ? "جاري الإرسال..." : "إرسال الإشعار الآن"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}