import SectionHeader from "../common/SectionHeader";
import MovieCard from "../common/MovieCard";
import { TrendingUp, Trophy,Film } from "lucide-react";
export default function TopRatedSection({ topRated }) {
  if (!topRated?.data) return null;

  return (
    <section className="relative  overflow-hidden">
      {/* خلفية ضوئية خافتة - نداء مباشر لمتغير الـ Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-(--accent)/5 blur-[120px] rounded-full pointer-events-none" />
      <SectionHeader
        title="المتصدرة"
        subtitle="الأعلى تقييمًا حسب الجمهور"
        icon={TrendingUp}
        href="/genre/top-rated"
      />

      {/* استخدام gap-fluid-gap و p-fluid-p لتوحيد الأبعاد */}
      <div className="flex overflow-x-auto bg-(--background) overflow-y-hidden  md:gap-fluid-gap pb-10 pt-3 md:pb-20 no-scrollbar snap-x snap-mandatory group/scroll relative ">
        {topRated.data.slice(0, 10).map((media, index) => (
          <div
            key={media.id}
            /* استخدام اسم الأنيميشن الصحيح: animate-fade-in-up */
            className="relative flex-none snap-center group/item animate-fade-in-up perspective-1000 mr-3"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {/* الرقم الكبير: استخدام stroke-text من الـ Utilities وألوان الـ Foreground */}
            <span
              className="absolute -left-16 -top-20 text-[220px] font-black leading-none pointer-events-none select-none
                        text-transparent stroke-text bg-clip-text bg-linear-to-b 
                        from-(--accent)/30 to-transparent
                        group-hover/item:from-(--accent)/40 group-hover/item:scale-110 duration-1000 ease-out
                        z-0 tracking-tighter italic"
            >
              {index + 1}
            </span>

            {/* الكارت: استخدام bg-(--card-bg) الموحد */}
            <div
              className="w-44 md:w-56 relative z-10 group-hover/item:-rotate-2 group-hover/item:translate-x-2 duration-500 ease-out shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] 
                        bg-(--card-bg) rounded-3xl isolate max-h-65 md:max-h-80"
            >
              {/* وسام المراكز الأولى: استخدام animate-float من ملفك */}
              {index < 3 && (
                <div className="absolute -top-4 -right-4 z-30 w-10 h-10 bg-(--accent) rounded-full flex items-center justify-center shadow-lg border-4 border-(--background) animate-float">
                  <Trophy size={16} className="text-slate-900" />
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
