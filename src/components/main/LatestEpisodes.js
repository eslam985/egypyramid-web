"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronLeft, Zap, PlayCircle } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { optimizeCloudinary } from "@/lib/helpers";
import { getCategory } from "@/lib/helpers";
export default function LatestEpisodes({ episodes }) {
  if (!episodes || episodes.length === 0) return null;

  return (
    <section className="relative">
      <SectionHeader
        title="أحدث الحلقات"
        subtitle="أحدث الإضافات اليومية"
        icon={Zap}
        href="/genre/latest-episodes"
      />

      <div className="relative">
        <div className="flex items-start gap-fluid-gap overflow-x-auto no-scrollbar pt-2 md:pb-10 md:pt-4 mr-3 snap-x snap-proximity">
          {episodes.map((ep, index) => (
            <Link
              key={`${ep.media_id || ep.id}-${ep.episode_number || index}`}
              href={`/${getCategory(ep.medias)}/${ep.medias?.slug}`}
              prefetch={false} // ✅ ضيف السطر ده هنا
              aria-label={`مشاهدة ${ep.medias?.title} الحلقة ${ep.episode_number}`}
              className="group/card relative flex-none w-[280px] md:w-[320px] snap-start no-underline"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-4xl bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/5 shadow-md isolate">
                <Image
                  // نستخدم 320 بكسل عرض للحلقات عشان تطلع مطابقة للمساحة المعروضة
                  // ✅ الصح: (رابط الصورة، العرض، النسبة)
                  src={optimizeCloudinary(ep.medias?.poster_url, 320, 0.625)}
                  alt={ep.medias?.title || ""}
                  fill
                  quality={65}
                  className="object-cover transition-transform duration-300 lg:group-hover/card:scale-105"
                  sizes="(max-width: 768px) 280px, 320px"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center opacity-0 lg:group-hover/card:opacity-100 transition-opacity duration-200">
                    <PlayCircle
                      size={24}
                      className="text-slate-950 fill-slate-950"
                    />
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-yellow-500 text-slate-950 px-3 py-1 rounded-xl font-black text-[10px] uppercase shadow-xl ring-2 ring-white/20 z-10">
                  الحلقة {ep.episode_number}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 px-2">
                <h3 className="text-sm md:text-base font-black text-slate-700 dark:text-white group-hover/card:text-yellow-500 transition-colors line-clamp-1 tracking-tight">
                  {ep.medias?.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} />
                    مضافة الآن
                  </span>
                  <span className="w-1 h-1 bg-yellow-500/40 rounded-full"></span>
                  <span className="text-[10px] font-black text-yellow-700 uppercase">
                    HD
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <div className="flex-none w-[200px] snap-start">
            <div className="aspect-[16/10] flex items-center justify-center">
              <Link
                prefetch={false}
                href="/genre/latest-episodes"
                aria-label="عرض المزيد من الحلقات"
                className="group/more flex flex-col items-center gap-4 text-slate-500 lg:hover:text-yellow-500"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-700 flex items-center justify-center lg:group-hover/more:border-yellow-500 lg:group-hover/more:scale-105 transition-[border-color,transform] duration-200">
                  <ChevronLeft size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  المزيد
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
