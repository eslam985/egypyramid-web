// src/components/main/HeroSpotlight.js
import Link from "next/link";
import Image from "next/image"; // ✅ الاستيراد المفقود
import { Sparkles, PlayCircle, Star, Info } from "lucide-react";
import { getCategory } from "@/lib/helpers";
import { optimizeCloudinary } from "@/lib/helpers";

export default function HeroSpotlight({ spotlight }) {
  if (!spotlight) return null;

  const category = getCategory(spotlight);

  return (
    <section className="relative md:py-fluid-section flex items-center overflow-hidden">
      {/* الخلفية السينمائية */}
      <div className="absolute inset-0 z-0">
        <Image
          src={optimizeCloudinary(spotlight.poster_url, 1600, 0.6)}
          fill
          priority={true}
          fetchPriority="high"
          quality={65}
          alt={spotlight.title}
          className="object-cover opacity-30 dark:opacity-40"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 1920px"
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--background) via-(--background)/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-(--background) via-transparent to-transparent hidden md:block" />
      </div>

      <div className="max-w-350 mx-auto p-1 md:p-fluid-p relative z-10 grid md:grid-cols-3 gap-x-fluid-gap items-center">
        {/* محتوى النص */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-(--accent) bg-yellow-500/10 px-4 py-1.5 rounded-full font-black text- uppercase tracking-[0.2em] border border-yellow-500/20">
              <Sparkles size={14} /> تريند اليوم
            </div>
            {spotlight.rating && (
              <div className="flex items-center gap-1.5 text-(--foreground) bg-white/10 px-3 py-1.5 rounded-full font-bold text- border border-white/10">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />{" "}
                {spotlight.rating}
              </div>
            )}
          </div>

          <div className="space-y-fluid-gap">
            <h1 className="text-fluid-h1 font-black text-(--foreground) pr-fluid-p tracking-tighter drop-shadow-2xl max-w-4xl leading-none">
              {spotlight.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-300 text-fluid-p max-w-2xl line-clamp-3 font-medium leading-relaxed border-r-4 border-yellow-500/30 pr-2 md:pr-4">
              {spotlight.story}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <Link
              prefetch={false}
              href={`/${category}/${spotlight.slug}`}
              className="group relative px-3 py-2 md:px-6 md:py-3 bg-(--accent)/80 lg:hover:bg-(--background) text-(--accent) rounded-2xl font-black flex items-center gap-3 overflow-hidden lg:hover:scale-105 lg:hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.2)] active:scale-95 no-underline"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <PlayCircle size={24} className="relative z-10" />
              <span className="relative z-10 text-lg text-slate-900 lg:hover:text-(--accent)">
                شاهد الآن
              </span>
            </Link>

            <Link
              prefetch={false}
              href={`/${category}/${spotlight.slug}`}
              className="px-2 py-2 md:px-4 md:py-3 bg-(--bg-card) lg:hover:bg-white/10 backdrop-blur-md text-(--accent) rounded-2xl font-bold flex items-center gap-2 border border-white/10 no-underline lg:hover:text-(--accent)"
            >
              <Info className="text-(--accent)" size={20} /> التفاصيل
            </Link>
          </div>
        </div>

        {/* الكارت الطاير */}
        <div className="hidden md:flex justify-center md:col-span-1">
          <div className="relative w-64 lg:w-72 aspect-2/3">
            <Image
              src={optimizeCloudinary(spotlight.poster_url, 600, 1.5)}
              alt={spotlight.title}
              fill
              priority={true}
              quality={65}
              className="object-cover rounded-[2.5rem] shadow-xl border border-white/10"
              sizes="(max-width: 1024px) 256px, 288px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
