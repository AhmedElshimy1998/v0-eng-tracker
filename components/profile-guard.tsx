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
      const profile = await getAcademicProfile();
      
      // الشروط: لازم البروفايل يكون موجود + فيه اسم + فيه قسم + فيه رقم تليفون
      if (!profile || !profile.name || !profile.department || !profile.phone) {
        // لو أي حاجة ناقصة، اخطفه ووديه الإعدادات وامسح الهيستوري عشان ميعرفش يرجع ورا
        router.replace("/settings");
      } else {
        setIsAllowed(true);
      }
    };

    checkProfile();
  }, [pathname, router]);

  // لو الحارس لسه بيفحص أو قرر يمنعه (ومش في صفحة الإعدادات)، نعرضله شاشة تحميل لطيفة بدل المحتوى
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