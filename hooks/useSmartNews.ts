import { useState, useEffect } from "react";
// استدعي دالة السيرفر بتاعتك اللي بتجيب الأخبار من Upstash
import { getGlobalNews } from "@/lib/adminActions"; 

export function useSmartNews(source: "page" | "card") {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchNews() {
      const CACHE_KEY = "studyhub-global-news";
      const TIME_KEY = "studyhub-news-time";
      
      const cachedData = localStorage.getItem(CACHE_KEY);
      const lastFetch = localStorage.getItem(TIME_KEY);
      const now = Date.now();

      // تحديد مدة الصلاحية بناءً على مين اللي بيطلب الداتا
      // لو الصفحة بتطلب = 5 دقايق، لو الكارد = 60 دقيقة
      const TTL = source === "page" ? 5 * 60 * 1000 : 60 * 60 * 1000;

      if (cachedData && lastFetch) {
        const timePassed = now - parseInt(lastFetch);
        
        // لو الداتا لسه صالحة (سواء 5 دقايق أو ساعة)، استخدم الكاش واقفل!
        if (timePassed < TTL) {
          if (mounted) {
            setNews(JSON.parse(cachedData));
            setIsLoading(false);
          }
          return; // زيرو كوماند لـ Upstash
        }
      }

      // لو الكاش منتهي الصلاحية أو مش موجود، كلم السيرفر
      try {
        const freshNews = await getGlobalNews();
        
        if (mounted) {
          setNews(freshNews);
          setIsLoading(false);
          
          // تحديث الكاش المشترك عشان الكومبوننت التاني يستفيد منه
          localStorage.setItem(CACHE_KEY, JSON.stringify(freshNews));
          localStorage.setItem(TIME_KEY, now.toString());
        }
      } catch (error) {
        console.error("Failed to fetch news");
        setIsLoading(false);
      }
    }

    fetchNews();
    return () => { mounted = false; };
  }, [source]);

  return { news, isLoading };
}