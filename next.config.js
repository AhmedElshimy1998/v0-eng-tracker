const withPWAInit = require("@ducanh2912/next-pwa").default;

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: "worker", 
  sw: "sw.js",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // === إضافة الجزء الخاص بتكييش الصفحات الديناميكية أوفلاين ===
  workboxOptions: {
    runtimeCaching: [
      {
        // أي رابط يبدأ بـ view هيفتح من الكاش فوراً (حتى لو الـ ID جديد)
        urlPattern: /\/subjects\/view.*/i,
        handler: 'CacheFirst', // جرب CacheFirst هنا عشان نضمن الأوفلاين
        options: {
          cacheName: 'subjects-view-shell',
          expiration: {
            maxEntries: 1, // إحنا محتاجين "هيكل" الصفحة بس
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  images: {
    unoptimized: true,
  },
  turbopack: {}, 
};

module.exports = withPWA(nextConfig);