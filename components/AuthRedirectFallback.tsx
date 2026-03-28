"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-client"; // 👈 استدعاء الـ Hook بتاعك

export default function AuthRedirectFallback() {
  const router = useRouter();
  const { userId } = useAuth(); // 👈 بيقرا حالة اليوزر من الكاش/المتصفح فوراً

  useEffect(() => {
    // لو لقى إن فيه يوزر مسجل، يحوله فوراً للداشبورد
    if (userId) {
      console.log("⚡ تم اكتشاف تسجيل دخول محلي، جاري التوجيه...");
      router.push("/dashboard");
    }
  }, [userId, router]);

  return null; // مكون مخفي مش بيعرض حاجة
}