// src/app/genre/page.js
import { mediaService } from "@/services/MediaService";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Heart,
  Ghost,
  Sword,
  Theater,
  Zap,
  Search,
  Calendar,
  Clapperboard,
  Trophy,
  History,
  Rocket,
  MoonStar,
} from "lucide-react";
import { constructMetadata } from "../../lib/seo"; // 👈 إضافة هذا السطر لحل الـ ReferenceError

// تابع لاختيار الأيقونة المناسبة بناءً على الاسم أو الـ Slug
const getGenreIcon = (slug) => {
  const icons = {
    action: <Sword size={24} />,
    romance: <Heart size={24} />,
    horror: <Ghost size={24} />,
    drama: <Theater size={24} />,
    "sci-fi": <Rocket size={24} />,
    comedy: <Zap size={24} />,
    historical: <History size={24} />,
    ramadan: <MoonStar size={24} />,
    thriller: <Flame size={24} />,
    mystery: <Search size={24} />,
    adventure: <Trophy size={24} />,
    sports: <Trophy size={24} />, // 👈 أيقونة لقسم الرياضة الموحد
    western: <Flame size={24} />, // 👈 أيقونة لقسم الغربي/الSub-genre الموحد
  };
  return icons[slug] || <Clapperboard size={24} />;
};
export async function generateMetadata() {
  return constructMetadata({
    title: "جميع الأقسام والتصنيفات - EGY PYRAMID",
    description:
      "تصفح مكتبة الأفلام والمسلسلات الشاملة مصنفة حسب النوع: أكشن، دراما، رعب، خيال علمي والمزيد بجودة عالية.",
    path: "/genre",
  });
}
export default async function GenresIndexPage() {
  let activeGenres = [];
  try {
    activeGenres = await mediaService.getAllGenres();
  } catch (error) {
    console.error("Error loading genres:", error);
    return (
      <div className="p-20 text-center text-(--foreground)/50">
        حدث خطأ أثناء تحميل الأقسام.
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-(--background) py-3 md:py-24 px-fluid-p overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* زخرفة خلفية (Ambient Glow) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-(--accent)/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header احترافي */}
        <div className="text-center mb-3 md:mb-20 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-white/5 border border-white/10 rounded-full text-(--accent) text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
            <Sparkles size={14} className="animate-pulse" /> استكشاف المكتبة
            الشاملة
          </div>
          <h1 className="text-fluid-h1 font-black text-(--foreground) tracking-tighter leading-none">
            تصفح حسب <span className="text-(--accent) italic">النوع</span>
          </h1>
          <p className="text-fluid-p text-(--foreground)/40 max-w-xl mx-auto font-medium leading-relaxed">
            اختر عالمك المفضل من بين{" "}
            <span className="text-(--foreground) font-bold">
              {activeGenres?.length}
            </span>{" "}
            قسماً مجهزاً بأحدث التقنيات البصرية.
          </p>
        </div>

        {/* Grid التصنيفات بتصميم الـ Glassmorphism المطور */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-6">
          {activeGenres?.map((genre, index) => (
            <Link
              prefetch={false}
              key={genre.id}
              href={`/genre/${encodeURIComponent(genre.slug)}`} // 👈 ترميز الـ Slug يحميك من كراش الحروف العربية لو كان اسم القسم بالعربي
              className="glass-card group relative p-3 md:p-8 h-35 md:h-48 flex flex-col items-center justify-center no-underline border-white/5 hover:border-(--accent)/40 transition-all duration-700 animate-fade-in-up overflow-hidden group"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* تأثير الحلقات الخلفية عند الـ Hover */}
              <div className="absolute inset-0 bg-radial-gradient from-(--accent)/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* أيقونة القسم الديناميكية */}
              <div className="mb-4 text-(--foreground)/20 group-hover:text-(--accent) group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 transform-gpu">
                {getGenreIcon(genre.slug)}
              </div>

              <h2 className="text-sm md:text-base font-black text-(--foreground) group-hover:text-(--accent) transition-colors relative z-10 tracking-tight">
                {genre.name}
              </h2>

              {/* عداد الحلقات/الأفلام (Badge) */}
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-bold text-(--foreground)/30 group-hover:text-(--accent) group-hover:border-(--accent)/20 transition-all">
                {genre.workCount} عمل
              </div>

              {/* خط سفلي جمالي (Indicator) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-(--accent) transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Empty State بتصميم نظيف */}
        {(!activeGenres || activeGenres.length === 0) && (
          <div className="text-center py-40 glass-card max-w-md mx-auto border-dashed">
            <div className="text-(--accent) mb-4 opacity-20">
              <Search size={48} className="mx-auto" />
            </div>
            <h2 className="text-sm font-black opacity-40 uppercase tracking-widest">
              لا توجد أقسام نشطة حالياً
            </h2>
          </div>
        )}
      </div>
    </main>
  );
}
