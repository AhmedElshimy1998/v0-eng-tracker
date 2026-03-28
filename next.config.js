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
  reloadOnOnline: false, 
  
  workboxOptions: {
    runtimeCaching: [
      // 1. 🚀 القاعدة الشاملة لكل صفحات وداتا Next.js (الريفريش والداتا)
      {
        urlPattern: ({ request, url }) => {
          const isNav = request.mode === 'navigate';
          const isRsc = request.headers.get('rsc') !== null || url.searchParams.has('_rsc');
          const isNextData = url.pathname.startsWith('/_next/data/');
          const isAction = request.headers.get('next-action') !== null;

          return isNav || isRsc || isNextData || isAction;
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-comprehensive-cache',
          networkTimeoutSeconds: 3,
          matchOptions: {
            ignoreSearch: true, // مهم جداً عشان الـ RSC parameters
            ignoreVary: true
          },
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // 2. تكييش الصور والأيقونات
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: { maxEntries: 50 },
        },
      },
      // 3. تكييش ملفات الـ Static (JS/CSS)
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
};

module.exports = withPWA(nextConfig);