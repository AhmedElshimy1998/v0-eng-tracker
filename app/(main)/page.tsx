import { auth } from "@/lib/auth-server";
import AuthRedirectFallback from "@/components/AuthRedirectFallback"; // الجاسوس بتاع الموبايل
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, BookOpen, PieChart, BellRing } from "lucide-react";

export default async function LandingPage() {
  // 1. التحقق من تسجيل الدخول (لو مسجل، حوله للداشبورد فوراً)
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  // 2. لو مش مسجل دخول، اعرض صفحة الهبوط
  return (
    <AuthRedirectFallback />
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 font-sans">
      
      {/* الشريط العلوي (Navbar) */}
      <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-6 w-6 text-cyan-500" />
            <span className="text-white">Eng<span className="text-cyan-500">Tracker</span></span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/sign-in" 
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              تسجيل الدخول
            </Link>
            <Link 
              href="/sign-up" 
              className="px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
            >
              حساب جديد
            </Link>
          </div>
        </div>
      </nav>

      {/* القسم الرئيسي (Hero Section) */}
      <main className="pt-32 pb-16 px-6 container mx-auto max-w-7xl text-center" dir="rtl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
          نظّم دراستك الهندسية <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">بذكاء</span>
        </h1>
        
        <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          المساعد الأول لطالب الهندسة. تتبع موادك، راقب نسبة إنجازك، واحصل على تنبيهات ذكية قبل مواعيد محاضراتك وسكاشنك.
          <br className="hidden sm:block" />
          <span className="mt-4 inline-block text-sm text-gray-500">
            برمجة احمد عادل الشيمي - هندسة الميكاترونيات جامعة طنطا
          </span>
        </p>
        
        <div className="flex justify-center items-center">
          <Link 
            href="/sign-in" 
            className="px-8 py-4 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
          >
            ابدأ الآن مجاناً
          </Link>
        </div>

        {/* قسم المميزات (Features) */}
        <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          
          {/* الكارت الأول */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#111111] hover:border-cyan-500/50 transition duration-300 flex flex-col items-start">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 shrink-0">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">إدارة المواد بسهولة</h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              أضف موادك الدراسية، حدد عدد المحاضرات والسكاشن، ونظّم جدولك الأسبوعي في مكان واحد مخصص للمهندسين.
            </p>
          </div>

          {/* الكارت الثاني */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#111111] hover:border-cyan-500/50 transition duration-300 flex flex-col items-start">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 shrink-0">
              <PieChart className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">تتبع نسبة الإنجاز</h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              راقب تقدمك الأكاديمي من خلال دوائر إحصائية ذكية تعرض نسبة حضورك وإنجازك في كل مادة بشكل مرئي جذاب.
            </p>
          </div>

          {/* الكارت الثالث */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#111111] hover:border-cyan-500/50 transition duration-300 flex flex-col items-start">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 shrink-0">
              <BellRing className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">منبه سحابي ذكي</h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              لا تفوت أي محاضرة. نظامنا السحابي سيرسل لك إشعارات على متصفحك قبل مواعيدك بـ 15 و 30 دقيقة تلقائياً.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}