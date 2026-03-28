"use client";

import { useEffect } from "react";

export default function CacheBuster() {
  useEffect(() => {
    // 1. هات رقم الإصدار الحالي من السيرفر (هتحدده إنت في Vercel)
    // لو مش موجود، هنعتبره 1.0.0
    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
    
    // 2. هات رقم الإصدار اللي متخزن في جهاز المستخدم
    const cachedVersion = localStorage.getItem("app_version");

    // 3. لو الأرقام مش متطابقة (يعني فيه تحديث جديد اترفع)
    if (cachedVersion !== currentVersion) {
      console.log("🚀 تم اكتشاف إصدار جديد! جاري تنظيف الكاش...");

      // تحديث الرقم في جهاز المستخدم للرقم الجديد
      localStorage.setItem("app_version", currentVersion);

      // --- أسلحة مسح الكاش الشاملة ---

      // أ. إعدام الـ Service Worker (الخاص بالـ PWA)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }

      // ب. مسح الـ Caches API (اللي بيخزن ملفات الـ JS والصور)
      if ("caches" in window) {
        caches.keys().then((names) => {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }

      // ج. عمل إعادة تحميل إجبارية للصفحة لسحب الملفات الجديدة
      // الـ timeout البسيط ده عشان ندي فرصة للـ Service worker يتمسح فعلياً
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, []);

  return null; // مكون مخفي
}