const withPWAInit = require("@ducanh2912/next-pwa").default;

const withPWA = withPWAInit({
  dest: "public",
  // يعمل في Vercel (Production) ويتوقف في جهازك (Development) لتسريع العمل
  disable: process.env.NODE_ENV === "development", 
  customWorkerDir: "worker", // يوجه المكتبة لدمج كود الإشعارات الخاص بك
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  }
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