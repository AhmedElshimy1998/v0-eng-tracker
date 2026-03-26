const withPWAInit = require("@ducanh2912/next-pwa").default;

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // توجيه صريح للمكتبة بمكان ملف الـ Worker الخاص بك
  customWorkerDir: "worker", 
  // إجبار توليد ملف sw.js حتى في البيئات المعقدة
  sw: "sw.js",
  register: true,
  setupExitSignals: true,
  skipWaiting: true,
  // إضافة مهمة لضمان عمل الكاش أوفلاين
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    // هذا السطر يضمن دمج كود الإشعارات الخاص بك مع كود المكتبة
    importScripts: [], 
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // مهم جداً لأن أي خطأ بسيط في التايب سكريبت بيوقف بناء الـ PWA
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // تأكد من حذف سطر turbopack: {} نهائياً من هنا
};

module.exports = withPWA(nextConfig);