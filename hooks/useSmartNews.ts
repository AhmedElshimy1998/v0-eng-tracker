import { useState, useEffect } from "react";
// استدعاء الدالة الأصلية والنوع من ملفك
import { getNews, NewsItem } from "@/lib/newsActions"; 

export function useSmartNews(source: "page" | "card") {
  // استخدام النوع الأصلي NewsItem لضمان عدم وجود أخطاء في الـ TypeScript
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchNews() {
      const CACHE_KEY = "studyhub-global-news";
      const TIME_KEY = "studyhub-news-time";
      
      const cachedData = localStorage.getItem(CACHE_KEY);
      const lastFetch = localStorage.getItem(TIME_KEY);
      const now = Date.now();

      // 5 دقايق للصفحة، وساعة للكارد
      const TTL = source === "page" ? 5 * 60 * 1000 : 60 * 60 * 1000;

      if (cachedData && lastFetch) {
        const timePassed = now - parseInt(lastFetch);
        if (timePassed < TTL) {
          if (mounted) {
            setNews(JSON.parse(cachedData));
            setIsLoading(false);
          }
          return; // زيرو كوماند!
        }
      }

      try {
        // جلب الداتا المرتبة جاهزة من دالتك
        const freshNews = await getNews(); 
        
        if (mounted) {
          setNews(freshNews || []);
          setIsLoading(false);
          
          localStorage.setItem(CACHE_KEY, JSON.stringify(freshNews || []));
          localStorage.setItem(TIME_KEY, now.toString());
        }
      } catch (error) {
        console.error("Failed to fetch news");
        if (mounted) setIsLoading(false);
      }
    }

    fetchNews();
    return () => { mounted = false; };
  }, [source]);

  return { news, isLoading };
}