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
      // 1. قاعدة الـ Navigate (الـ Refresh العام)
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst', 
        options: {
          cacheName: 'pages-cache',
          networkTimeoutSeconds: 3, 
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // 2. تكييش داتا الصفحات (Next.js Data JSON) - ضروري للـ Refresh
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-data-cache',
        },
      },
      // 3. تكييش الصور والملفات الثابتة
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: { maxEntries: 100 },
        },
      },
      // 4. تكييش ملفات الكود (JS/CSS)
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
        },
      },
      // 5. تكييش الـ Server Actions (الداتا اللي راجعة من السيرفر)
      {
        urlPattern({ request }) {
          return (
            request.headers.get('next-action') !== null || 
            request.headers.get('x-nextjs-data') !==  ||
            request.headers.get('rsc') ||         // RSC Data
            url.searchParams.has('_rsc')          // RSC Query Param
          );
        }, // 👈 القوس ده كان ناقص عندك
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-dynamic-data',
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 100 },
          cacheableResponse: { statuses: [0, 200] }
        },
      },
      // 6. تكييش الـ API Routes
      {
        urlPattern: /^\/api\/.*$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-routes-cache',
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 50 },
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