'use client';
import Link from 'next/link';
import {
    Ghost, Sword, Smile, Zap, Heart, Film, Star,
    Skull, Target, Theater, Users, Compass, Clapperboard, Flame
} from 'lucide-react';

// خريطة الأيقونات المحدثة والمطابقة للـ Slugs الموحدة في موقعك
const iconMap = {
    'action': Sword,
    'horror': Ghost,
    'comedy': Smile,
    'anime': Zap,
    'drama': Heart,
    'arabic': Film,
    'mystery': Skull,
    'crime': Skull,
    'historical': Theater,
    'sports': Flame,
    'western': Compass,
    'sci-fi': Clapperboard,
    'default': Star
};

// خريطة التطهير والدمج لتوحيد البيانات القادمة ديناميكياً من السيرفر
const genreMapping = {
    'رومنسية': { name: 'رومانسي', slug: 'romance' },
    'رومانسي': { name: 'رومانسي', slug: 'romance' },
    'حركة': { name: 'أكشن', slug: 'action' },
    'أكشن': { name: 'أكشن', slug: 'action' },
    'تاريخ': { name: 'تاريخي', slug: 'historical' },
    'تاريخي': { name: 'تاريخي', slug: 'historical' },
    'كوميدي': { name: 'كوميديا', slug: 'comedy' },
    'كوميديا': { name: 'كوميديا', slug: 'comedy' },
    'غرب أمريكي': { name: 'غربي', slug: 'western' },
    'غربي': { name: 'غربي', slug: 'western' },
    'Sport': { name: 'رياضة', slug: 'sports' },
    'رياضة': { name: 'رياضة', slug: 'sports' },
    'خيال علمي وفانتازيا': { name: 'خيال علمي', slug: 'sci-fi' },
    'sci-fi': { name: 'خيال علمي', slug: 'sci-fi' },
    'خيال علمي': { name: 'خيال علمي', slug: 'sci-fi' }
};

export default function QuickGenres({ genres }) {
    if (!genres || genres.length === 0) return null;

    const mergedGenresMap = {};

    genres.forEach(g => {
        // حساب عدد الأعمال بدقة بناءً على مصفوفة العلاقات القادمة من السيرفر
        const count = g.media_genres ? g.media_genres.length : 0;
        
        const mapping = genreMapping[g.name] || genreMapping[g.slug];
        const finalName = mapping ? mapping.name : g.name;
        const finalSlug = mapping ? mapping.slug : g.slug;

        if (finalSlug) {
            if (mergedGenresMap[finalSlug]) {
                mergedGenresMap[finalSlug].workCount += count;
            } else {
                mergedGenresMap[finalSlug] = {
                    id: g.id,
                    name: finalName,
                    slug: finalSlug,
                    workCount: count
                };
            }
        }
    });

    // تحويل الكائن إلى مصفوفة مرتبة تنازلياً حسب الأكثر محتوى ومصفاة من الأقسام الصفرية
    const cleanedGenres = Object.values(mergedGenresMap)
        .filter(g => g.workCount > 0)
        .sort((a, b) => b.workCount - a.workCount);

    return (
        <section className="relative group/section w-full pr-1 select-none">
            {/* التلاشي الجانبي السينمائي المتوافق مع ثيم الموقع */}
            <div className="absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none hidden md:block" />
            <div className="absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none hidden md:block" />

            {/* حاوية العناصر القابلة للتمرير الأفقي بسلاسة */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4  py-1 md:px-8 snap-x scroll-smooth layout-scrollbar">
                {cleanedGenres.map((genre) => {
                    const Icon = iconMap[genre.slug] || iconMap.default;

                    return (
                        <Link
                            key={genre.id}
                            href={`/genre/${encodeURIComponent(genre.slug)}`}
                            prefetch={false}
                            className="group relative flex items-center gap-3 px-5 py-3 rounded-xl 
                                     bg-[var(--card-bg)] border border-slate-200 dark:border-white/[0.04] 
                                     lg:hover:border-[var(--accent)]/30 lg:hover:bg-[var(--accent)]/[0.02] 
                                     lg:hover:-translate-y-0.5 duration-300 ease-out
                                     snap-start flex-none no-underline shadow-xs
                                     lg:hover:shadow-[0_8px_24px_-12px_rgba(var(--accent-rgb),0.3)]"
                        >
                            {/* تأثير النيون للأيقونة عند الهوفير */}
                            <div className="flex items-center justify-center text-slate-400 group-hover:text-[var(--accent)] transition-colors duration-300">
                                <Icon
                                    size={18}
                                    className="transform group-hover:scale-110 transition-transform duration-300 filter group-hover:drop-shadow-[0_0_6px_var(--accent)]"
                                />
                            </div>

                            {/* ضبط خطوط النص بما يتوافق مع العربية والإنجليزية */}
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 
                                           group-hover:text-[var(--foreground)] transition-colors duration-300">
                                {genre.name}
                            </span>

                            {/* خط توهج سفلي ناعم واحترافي بدلاً من النقطة الحادة */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] rounded-full bg-[var(--accent)] opacity-0 group-hover:w-1/2 group-hover:opacity-100 duration-300" />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}