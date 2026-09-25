// src/components/common/RelatedMedia.js
import Link from "next/link";
import { Play } from "lucide-react";
import MovieCard from "./MovieCard";

export default function RelatedMedia({ relatedMedia, currentGenre }) {
  if (!relatedMedia || relatedMedia.length === 0) return null;

  return (
    <section className="max-w-350 mx-auto relative py-6">
      <div className="flex items-center justify-between border-r-4 border-(--accent) pr-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-(--foreground) tracking-tighter my-2">
            أعمال قد تعجبك
          </h2>
          <p className="text-fluid-xs uppercase tracking-[0.4em] text-(--foreground)/85 font-black antialiased">
            مقترحات مشابهة لهذا العمل
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="max-w-350 flex overflow-x-auto gap-4 no-scrollbar pb-10 pt-6 px-8 snap-x snap-proximity">
          {relatedMedia.map((item, index) => (
            <div
              key={item.id}
              className="flex-none w-36 md:w-52 snap-start"
            >
              <div className="relative">
                <MovieCard media={item} index={index + 12} />
              </div>
            </div>
          ))}

          <div className="flex-none w-36 md:w-52 flex items-center justify-center snap-start">
            <Link
              href={`/genre/${currentGenre?.slug}`}
              prefetch={false}
              aria-label={`عرض مزيد من ${currentGenre?.name || "الأعمال المشابهة"}`}
              className="group/more flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500 lg:hover:text-(--accent) no-underline"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-700 flex items-center justify-center lg:group-hover/more:border-(--accent) lg:group-hover/more:scale-105 transition-[border-color,transform] duration-200">
                <Play size={24} className="ml-1" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-center text-(--foreground)/85">
                مزيد من {currentGenre?.name}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
