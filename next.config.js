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
  reloadOnOnline: false, // ممتاز إننا قافلينه عشان المزامنة
  
  workboxOptions: {
    runtimeCaching: [
      // 🚀 القنبلة الجديدة: تكييش أي صفحة بيتم زيارتها (عشان الـ Refresh يشتغل أوفلاين)
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst', 
        options: {
          cacheName: 'pages-cache',
          networkTimeoutSeconds: 1.5, // لو النت اتأخر ثانية ونصف افتح الكاش فوراً
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // شهر
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // تكييش صفحة المواد الخاصة بك كما كانت
      {
        urlPattern: /\/subjects\/view$/i, 
        handler: 'CacheFirst', 
        options: {
          cacheName: 'static-subject-shell',
          expiration: { maxEntries: 1 },
          cacheableResponse: { statuses: [0, 200] }
        },
      },
      // تكييش ملفات الـ JS والـ CSS (مهم جداً للـ Refresh)
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
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