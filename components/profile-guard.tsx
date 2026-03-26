"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAcademicProfile } from "@/lib/academicActions";
import { Loader2 } from "lucide-react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // التحكم في ظهور المحتوى
  const [isAllowed, setIsAllowed] = useState(false);
  
  // أختام الحماية (عشان نمنع اللوب والتعليق)
  const hasChecked = useRef(false); // هل كشفنا عليه في الجلسة دي؟
  const isFetching = useRef(false); // هل في عملية فحص شغالة دلوقتي؟

  useEffect(() => {
    // 1. السماح الدائم لصفحة الإعدادات
    if (pathname?.startsWith("/settings")) {
      setIsAllowed(true);
      return;
    }

    // 2. لو كشفنا عليه ولقيناه سليم، متعملش لودينج تاني عند التنقل
    if (hasChecked.current) {
      setIsAllowed(true);
      return;
    }

    // تأمين الواجهة: لو بيحاول يفتح صفحة محمية وهو لسه متفحصش، اقفل الباب مؤقتاً
    setIsAllowed(false);

    // 3. منع التداخل لو الدالة شغالة بالفعل (عشان المتصفح ميعلقش)
    if (isFetching.current) return;

    const verifyProfile = async () => {
      isFetching.current = true;

      try {
        // أ. الفحص المحلي أولاً (في أجزاء من الثانية)
        const localStr = localStorage.getItem("studyhub-academic-profile");
        if (localStr) {
          const profile = JSON.parse(localStr);
          if (profile?.name && profile?.department && profile?.phone) {
            hasChecked.current = true; // ختم الدخول
            setIsAllowed(true);
            isFetching.current = false;
            return;
          }
        }

        // ب. خطة بديلة: الفحص من السيرفر (مهم جداً لو داخل من جهاز جديد أو مسح الكاش)
        if (navigator.onLine) {
          const profile = await getAcademicProfile();
          if (profile && profile.name && profile.department && profile.phone) {
            // نحفظ الداتا محلياً عشان المرة الجاية يفتح في ثانية
            localStorage.setItem("studyhub-academic-profile", JSON.stringify(profile));
            hasChecked.current = true; // ختم الدخول
            setIsAllowed(true);
            isFetching.current = false;
            return;
          }
        }
      } catch (e) {
        console.error("Profile verification error:", e);
      }

      // ج. لو كل المحاولات فشلت، نوديه الإعدادات بأمان
      isFetching.current = false;
      router.replace("/settings");
    };

    verifyProfile();
  }, [pathname, router]);

  // شاشة التحميل الثابتة
  if (!isAllowed && !pathname?.startsWith("/settings")) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-lg">جاري تجهيز بيئة العمل...</p>
      </div>
    );
  }

  // لو بياناته كاملة، افتح الباب
  return <>{children}</>;
}