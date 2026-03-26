"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // الـ useRef هنا بمثابة "ختم الدخول الدائم" طول الجلسة
  // قيمته بتتغير فوراً ومش بتعمل ريفرش داخلي للصفحة
  const hasChecked = useRef(false);

  useEffect(() => {
    // 1. لو إحنا في الإعدادات، نفتح الباب ونعلم إننا فحصنا
    if (pathname === "/settings") {
      setIsChecking(false);
      hasChecked.current = true;
      return;
    }

    // 2. لو فحصنا قبل كدا، متعملش أي حاجة تاني خالص (ده اللي بيمنع التعليق عند التنقل)
    if (hasChecked.current) {
      setIsChecking(false); // للتأكيد فقط
      return;
    }

    // 3. فحص محلي فوري وسريع جداً (بدون انتظار سيرفر نهائياً)
    const verifyProfileInstantly = () => {
      try {
        const localStr = localStorage.getItem("studyhub-academic-profile");
        if (localStr) {
          const profile = JSON.parse(localStr);
          // لو البيانات كاملة
          if (profile?.name && profile?.department && profile?.phone) {
            hasChecked.current = true; // ختمنا الدخول في الذاكرة
            setIsChecking(false); // شيل شاشة التحميل فوراً
            return;
          }
        }
      } catch (e) {
        console.error("Error reading profile", e);
      }

      // 4. لو مفيش بيانات محلية، هنوديه للإعدادات مباشرة بدل ما نعلق المتصفح بطلب السيرفر
      router.replace("/settings");
    };

    verifyProfileInstantly();
  }, [pathname, router]);

  // شاشة التحميل هتظهر فقط لأجزاء من الثانية في أول مرة تفتح فيها الموقع
  // استخدمنا fixed inset-0 عشان تغطي الشاشة كلها وتمنع أي تعارض في العرض
  if (isChecking && pathname !== "/settings") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-lg">جاري تجهيز بيئة العمل...</p>
      </div>
    );
  }

  // لو بياناته كاملة، افتحله الموقع وتصفح براحتك
  return <>{children}</>;
}