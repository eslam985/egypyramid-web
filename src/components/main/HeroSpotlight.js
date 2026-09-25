// src/components/main/HeroSpotlight.js
import Link from 'next/link';
import Image from 'next/image'; // ✅ الاستيراد المفقود
import { Sparkles, PlayCircle, Star, Info } from 'lucide-react';
import { getCategory } from '@/lib/helpers';
import { optimizeCloudinary } from '@/lib/helpers';

export default function HeroSpotlight({ spotlight }) {
    if (!spotlight) return null;

    const category = getCategory(spotlight);

    return (
        <section className="relative md:py-fluid-section flex items-center overflow-hidden">

            {/* الخلفية السينمائية */}
            <div className="absolute inset-0 z-0">
                <Image
                    // نطلب 1600 بكسل للشاشات الكبيرة مع نسبة طول إلى عرض أقل (مثلاً 0.6) حتى لا تصبح الصورة طويلة جداً في الخلفية وتقتطع الأبطال
                    src={optimizeCloudinary(spotlight.poster_url, 1600, 0.6)}
                    fill
                    priority={true}
                    fetchPriority="high"
                    quality={65}
                    // unoptimized أزلناه للسماح لـ Next بتطبيق srcset بناءً على deviceSizes
                    alt={spotlight.title}
                    className="object-cover scale-105 animate-slow-zoom opacity-30 dark:opacity-40"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 1920px"

                />
                <div className="absolute inset-0 bg-linear-to-t from-(--background) via-(--background)/80 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-(--background) via-transparent to-transparent hidden md:block" />
            </div>


            <div className="max-w-350 mx-auto p-1 md:p-fluid-p relative z-10 grid md:grid-cols-3 gap-x-fluid-gap items-center">

                {/* محتوى النص */}
                <div className="md:col-span-2 space-y-8 animate-fadeInUp">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-(--accent) bg-yellow-500/10 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                            <Sparkles size={14} className="animate-pulse" /> تريند اليوم
                        </div>
                        {spotlight.rating && (
                            <div className="flex items-center gap-1.5 text-(--foreground) bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full font-bold text-[11px] border border-white/10">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" /> {spotlight.rating}
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
                            className="group relative px-3 py-2 md:px-6 md:py-3 bg-(--accent)/80 hover:bg-(--background) text-(--accent) rounded-2xl font-black flex items-center gap-3 overflow-hidden hover:scale-105 hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.2)] active:scale-95 no-underline"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <PlayCircle size={24} className="relative z-10" />
                            <span className="relative z-10 text-lg text-slate-900 hover:text-(--accent)">شاهد الآن</span>
                        </Link>

                        <Link
                        prefetch={false}
                            href={`/${category}/${spotlight.slug}`}
                            className="px-2 py-2 md:px-4 md:py-3 bg-(--bg-card) hover:bg-white/10 backdrop-blur-md text-(--accent) rounded-2xl font-bold flex items-center gap-2 border border-white/10 no-underline hover:text-(--accent)"
                        >
                            <Info className="text-(--accent)" size={20} /> التفاصيل
                        </Link>
                    </div>
                </div>

                {/* الكارت الطاير */}
                <div className="hidden md:flex justify-center md:col-span-1">
                    <div className="relative group animate-float">
                        <div className="absolute -inset-4 bg-yellow-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        {/* ✅ next/image للكارت الجانبي */}
                        <div className="relative w-64 lg:w-72 aspect-2/3 rotate-6 group-hover:rotate-0 duration-1000 ease-out">
                            <Image
                                // نطلب 300 بكسل عرض لتطابق الأبعاد المعروضة (287x430)
                                // نطلب 600 بكسل لضمان حدة ونقاء البوستر على كافة الشاشات والـ LCP السريع
                                src={optimizeCloudinary(spotlight.poster_url, 600, 1.5)}
                                alt={spotlight.title}
                                fill
                                priority={true} // الكارت أيضاً مهم للـ LCP في الديسكتوب
                                quality={65}
                                className="object-cover rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20"
                                sizes="(max-width: 1024px) 256px, 288px" // 256px لعرض w-64 و 288px لعرض w-72

                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}