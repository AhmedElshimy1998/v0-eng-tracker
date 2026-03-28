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
        {
          // 🚀 دي هتمسك صفحة المواضيع، وصفحة الـ view بالـ ID بتاعها، وأي صفحة تانية
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst', 
          options: {
            cacheName: 'all-pages-cache',
            networkTimeoutSeconds: 2, 
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // تكييش الصور والأيقونات (عشان الموقع ميبقاش أقرع وأنت أوفلاين)
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: { maxEntries: 100 },
          },
        },
        // تكييش ملفات التشغيل (JS/CSS)
        {
          urlPattern: /\.(?:js|css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-assets',
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