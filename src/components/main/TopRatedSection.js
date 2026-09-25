import SectionHeader from "../common/SectionHeader";
import MovieCard from "../common/MovieCard";
import { TrendingUp, Trophy,Film } from "lucide-react";
export default function TopRatedSection({ topRated }) {
  if (!topRated?.data) return null;

  return (
    <section className="relative overflow-hidden">
      {/* خلفية ضوئية خافتة - نداء مباشر لمتغير الـ Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-(--accent)/10 rounded-full pointer-events-none opacity-40" />
      <SectionHeader
        title="المتصدرة"
        subtitle="الأعلى تقييمًا حسب الجمهور"
        icon={TrendingUp}
        href="/genre/top-rated"
      />

      {/* استخدام gap-fluid-gap و p-fluid-p لتوحيد الأبعاد */}
      <div className="flex overflow-x-auto bg-(--background) overflow-y-hidden md:gap-fluid-gap pb-10 pt-3 md:pb-20 no-scrollbar snap-x snap-proximity relative">
        {topRated.data.slice(0, 10).map((media, index) => (
          <div
            key={media.id}
            className="relative flex-none snap-center mr-3"
          >
            {/* الرقم الكبير: استخدام stroke-text من الـ Utilities وألوان الـ Foreground */}
            <span
              className="absolute -left-12 -top-14 text- font-black leading-none pointer-events-none select-none text-transparent stroke-text opacity-[0.15] z-0 tracking-tighter italic"
            >
              {index + 1}
            </span>

            {/* الكارت: استخدام bg-(--card-bg) الموحد */}
            <div
              className="w-44 md:w-56 relative z-10 bg-(--card-bg) rounded-3xl shadow-lg max-h-65 md:max-h-80"
            >
              {/* وسام المراكز الأولى: استخدام animate-float من ملفك */}
              {index < 3 && (
                <div className="absolute -top-3 -right-3 z-30 w-9 h-9 bg-(--accent) rounded-full flex items-center justify-center shadow-md border-2 border-(--background)">
                  <Trophy size={14} className="text-slate-900" />
                </div>
              )}

              {/* محتوى الكارت */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <MovieCard media={media} index={index} />
              </div>
            </div>
          </div>
        ))}
        {/* كارت "عرض المزيد" في آخر السكرول - تركة ذكية */}
        <div />
        {/* كارت "عرض المزيد" في آخر السكرول - تركة ذكية */}
        <div className="flex-none w-40 md:w-52 flex items-center justify-center snap-start">
          <a
            href="/genre/top-rated"
            className="group/more flex flex-col items-center gap-4 text-slate-400 lg:hover:text-(--accent) transition-colors"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center group-hover/more:border-(--accent) group-hover/more:scale-110">
              <Film size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">
              عرض المزيد
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
