"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAcademicProfile } from "@/lib/academicActions";
import { Loader2 } from "lucide-react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // فصلنا حالة "السماح" عن حالة "التحميل" عشان ميعملش ريفريش مع كل كليك
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // لو هو في صفحة الإعدادات، نفتحله فوراً
    if (pathname === "/settings") {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    // ⭐ السطر ده هو الحل السحري! 
    // لو الحارس فحصه قبل كدا وسمحله، متعملش فحص تاني مع كل تنقل بين الصفحات
    if (isAllowed) return;

    const checkProfile = async () => {
      setIsChecking(true);
      
      // 1. الفحص المحلي أولاً
      const localProfileStr = localStorage.getItem("studyhub-academic-profile");
      if (localProfileStr) {
        try {
          const localProfile = JSON.parse(localProfileStr);
          if (localProfile && localProfile.name && localProfile.department && localProfile.phone) {
            setIsAllowed(true);
            setIsChecking(false); // افتح الباب فوراً
            return; 
          }
        } catch (e) {
          console.error("Error parsing local profile", e);
        }
      }

      // 2. لو مفيش بيانات محلية، نسأل السيرفر
      if (navigator.onLine) {
        try {
          const profile = await getAcademicProfile();
          
          if (!profile || !profile.name || !profile.department || !profile.phone) {
            router.replace("/settings");
          } else {
            localStorage.setItem("studyhub-academic-profile", JSON.stringify(profile));
            setIsAllowed(true);
          }
        } catch (error) {
          router.replace("/settings");
        }
      } else {
        router.replace("/settings");
      }
      setIsChecking(false);
    };

    checkProfile();
  }, [pathname, router, isAllowed]); // الحارس بقى أذكى وبيراقب حالة السماح

  // لو الحارس لسه بيفحص بجد (مش مجرد تنقل)، نعرض شاشة التحميل
  if (isChecking && pathname !== "/settings") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background z-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-lg">جاري تجهيز بيئة العمل الخاصة بك...</p>
      </div>
    );
  }

  // لو بياناته كاملة، افتحله الموقع وتصفح براحتك
  return <>{children}</>;
}