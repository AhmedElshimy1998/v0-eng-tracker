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
        // تكييش الهيكل الثابت لصفحة العرض
        urlPattern: /\/subjects\/view$/i, 
        handler: 'CacheFirst', 
        options: {
          cacheName: 'static-subject-shell',
          expiration: { maxEntries: 1 },
          cacheableResponse: { statuses: [0, 200] }
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