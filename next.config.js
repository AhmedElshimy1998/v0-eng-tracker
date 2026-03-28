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
  
  fallbacks: {
    document: "/dashboard",
  },
  
  workboxOptions: {
      runtimeCaching: [
        // 1. قاعدة الصفحات الأساسية (عشان الريفريش يفتح صفحة مش كود)
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            networkTimeoutSeconds: 3,
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // 2. قاعدة الداتا (RSC & JSON) - هنستخدم StaleWhileRevalidate عشان السرعة
        {
          urlPattern: ({ request, url }) => {
            return (
              url.pathname.startsWith('/_next/data/') ||
              request.headers.get('rsc') === '1' ||
              url.searchParams.has('_rsc')
            );
          },
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'next-data',
            expiration: { maxEntries: 100 },
          },
        },
        // 3. الصور والملفات الثابتة
        {
          urlPattern: /\.(?:js|css|png|jpg|svg|ico|woff2)$/i,
          handler: 'CacheFirst',
          options: { cacheName: 'assets' },
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