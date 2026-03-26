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
  // === الإضافة الجديدة لحل مشكلة الروابط الأوفلاين ===
  workboxOptions: {
    runtimeCaching: [
      {
        // القاعدة السحرية: أي رابط لمادة (حتى لو جديدة) هنخليه يفتح من الكاش
        urlPattern: /\/subjects\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'dynamic-subjects',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
          networkTimeoutSeconds: 3, // لو السيرفر ماردش في 3 ثواني، يفتح من الكاش فوراً
        },
      },
      {
        // كاش لصفحة المواد الرئيسية
        urlPattern: /\/subjects$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'subjects-page',
          networkTimeoutSeconds: 3,
        },
      }
    ]
  }
  // ===================================================
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  images: {
    unoptimized: true,
  },
  // السطر ده هو اللي هيسكت الإيرور اللي ظهرلك
  turbopack: {}, 
};

module.exports = withPWA(nextConfig);