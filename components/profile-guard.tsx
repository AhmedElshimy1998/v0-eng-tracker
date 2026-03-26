"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAcademicProfile } from "@/lib/academicActions";
import { Loader2 } from "lucide-react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // لو هو أصلاً في صفحة الإعدادات، سيبه يشوفها عشان يكمل بياناته
    if (pathname === "/settings") {
      setIsAllowed(true);
      return;
    }

    const checkProfile = async () => {
      setIsAllowed(false);
      
      // 1. الفحص المحلي أولاً (للسرعة والأوفلاين)
      const localProfileStr = localStorage.getItem("studyhub-academic-profile");
      if (localProfileStr) {
        try {
          const localProfile = JSON.parse(localProfileStr);
          // لو البيانات كاملة محلياً، افتح الباب فوراً وبدون انتظار السيرفر
          if (localProfile && localProfile.name && localProfile.department && localProfile.phone) {
            setIsAllowed(true);
            return; 
          }
        } catch (e) {
          console.error("Error parsing local profile", e);
        }
      }

      // 2. لو مفيش بيانات محلية (أو ناقصة)، نسأل السيرفر (لو فيه نت)
      if (navigator.onLine) {
        try {
          const profile = await getAcademicProfile();
          
          if (!profile || !profile.name || !profile.department || !profile.phone) {
            router.replace("/settings");
          } else {
            // نحفظها محلياً عشان المرة الجاية يفتح في ثانية
            localStorage.setItem("studyhub-academic-profile", JSON.stringify(profile));
            setIsAllowed(true);
          }
        } catch (error) {
          console.error("Failed to fetch profile from server");
          // في حالة خطأ السيرفر، نوديه الإعدادات كإجراء احترازي
          router.replace("/settings");
        }
      } else {
        // لو أوفلاين ومفيش أي داتا محلية خالص، لازم يروح الإعدادات
        router.replace("/settings");
      }
    };

    checkProfile();
  }, [pathname, router]);

  // لو الحارس لسه بيفحص أو قرر يمنعه (ومش في صفحة الإعدادات)، نعرض شاشة التحميل
  if (!isAllowed && pathname !== "/settings") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background z-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-lg">جاري تجهيز بيئة العمل الخاصة بك...</p>
      </div>
    );
  }

  // لو بياناته كاملة، افتحله الموقع عادي
  return <>{children}</>;
}