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
      // 1. قاعدة الـ Navigate
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst', 
        options: {
          cacheName: 'pages-cache',
          networkTimeoutSeconds: 3, 
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // 2. Next.js Data JSON
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'next-data-cache' },
      },
      // 3. الصور
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: { maxEntries: 100 },
        },
      },
      // 4. الكود (JS/CSS)
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'static-resources' },
      },
      // 5. الـ Server Actions
      {
        urlPattern: ({ request }) => {
          const headers = request.headers;
          return (
            headers.get('next-action') !== null ||
            headers.get('x-nextjs-data') !== null ||
            headers.get('rsc') !== null
          );
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'server-actions-cache',
          networkTimeoutSeconds: 3,
          cacheableResponse: { statuses: [0, 200] }
        },
      },
      // 6. API Routes
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
    ] // 👈 قفلنا المصفوفة
  } // 👈 قفلنا الـ workboxOptions
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