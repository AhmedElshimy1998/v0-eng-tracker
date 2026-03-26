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
        // القاعدة اللي بتخلي صفحة العرض تفتح دايماً أوفلاين
        urlPattern: /\/subjects\/view.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'subjects-view-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 30 * 24 * 60 * 60, // شهر
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