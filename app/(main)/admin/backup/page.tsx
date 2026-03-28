"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Database, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // أو استخدم أي مكتبة toast عندك

export default function DatabaseManagement() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // 1. وظيفة التحميل (Backup)
  const handleBackup = async () => {
    setIsDownloading(true);
    try {
      // بنفتح الرابط في نافذة جديدة عشان يبدأ التحميل فوراً كملف
      window.location.href = "/api/admin/backup";
      toast.success("بدء تحميل النسخة الاحتياطية...");
    } catch (error) {
      toast.error("فشل في تحضير النسخة الاحتياطية");
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. وظيفة الاسترجاع (Restore)
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = confirm(
      "⚠️ تحذير: استرجاع النسخة سيقوم بحذف أو استبدال البيانات الحالية في Upstash. هل أنت متأكد؟"
    );

    if (!confirmRestore) {
      e.target.value = ""; // تصغير الإدخال
      return;
    }

    setIsRestoring(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const backupContent = JSON.parse(event.target?.result as string);
        
        const response = await fetch("/api/admin/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backupContent),
        });

        const result = await response.json();

        if (result.success) {
          toast.success(`تم استرجاع ${result.restoredCount} مفتاح بنجاح!`);
        } else {
          throw new Error(result.error || "فشل الاسترجاع");
        }
      } catch (error: any) {
        toast.error("خطأ: " + error.message);
      } finally {
        setIsRestoring(false);
        e.target.value = ""; // تصفير الإدخال بعد الحوار ده
      }
    };

    reader.readAsText(file);
  };

  return (
    <Card className="border-red-900/20 bg-black/40 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Database className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-xl">إدارة قاعدة البيانات (Upstash)</CardTitle>
            <CardDescription>تحميل أو استرجاع النسخ الاحتياطية يدوياً</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* قسم التحميل */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 gap-4">
          <div className="space-y-1 text-center md:text-right">
            <h4 className="font-medium text-white flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-400" /> نسخ احتياطي كامل
            </h4>
            <p className="text-xs text-muted-foreground">سحب كل المفاتيح والقيم في ملف JSON واحد</p>
          </div>
          <Button 
            onClick={handleBackup} 
            disabled={isDownloading}
            variant="outline"
            className="w-full md:w-auto border-blue-500/50 hover:bg-blue-500/10 text-blue-400"
          >
            {isDownloading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            تحميل النسخة الآن
          </Button>
        </div>

        {/* قسم الرفع */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 gap-4">
          <div className="space-y-1 text-center md:text-right">
            <h4 className="font-medium text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> استرجاع نسخة
            </h4>
            <p className="text-xs text-muted-foreground italic">سيتم استبدال البيانات الموجودة حالياً بالملف المرفوع</p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={isRestoring}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Button 
              disabled={isRestoring}
              variant="destructive"
              className="w-full md:w-auto bg-red-600 hover:bg-red-700"
            >
              {isRestoring ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Upload className="ml-2 h-4 w-4" />}
              رفع واسترجاع
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-yellow-500/5 p-2 rounded border border-yellow-500/10">
          <CheckCircle2 className="h-3 w-3 text-yellow-500" />
          تنبيه: النسخة الاحتياطية لا تشمل إعدادات الـ Supabase، بل داتا الـ KV فقط.
        </div>
      </CardContent>
    </Card>
  );
}