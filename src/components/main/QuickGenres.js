"use client";
import Link from "next/link";
import {
  Ghost,
  Sword,
  Smile,
  Zap,
  Heart,
  Film,
  Star,
  Skull,
  Target,
  Theater,
  Users,
  Compass,
  Clapperboard,
  Flame,
} from "lucide-react";

// خريطة الأيقونات المحدثة والمطابقة للـ Slugs الموحدة في موقعك
const iconMap = {
  action: Sword,
  horror: Ghost,
  comedy: Smile,
  anime: Zap,
  drama: Heart,
  arabic: Film,
  mystery: Skull,
  crime: Skull,
  historical: Theater,
  sports: Flame,
  western: Compass,
  "sci-fi": Clapperboard,
  default: Star,
};

// خريطة التطهير والدمج لتوحيد البيانات القادمة ديناميكياً من السيرفر
const genreMapping = {
  رومنسية: { name: "رومانسي", slug: "romance" },
  رومانسي: { name: "رومانسي", slug: "romance" },
  حركة: { name: "أكشن", slug: "action" },
  أكشن: { name: "أكشن", slug: "action" },
  تاريخ: { name: "تاريخي", slug: "historical" },
  تاريخي: { name: "تاريخي", slug: "historical" },
  كوميدي: { name: "كوميديا", slug: "comedy" },
  كوميديا: { name: "كوميديا", slug: "comedy" },
  "غرب أمريكي": { name: "غربي", slug: "western" },
  غربي: { name: "غربي", slug: "western" },
  Sport: { name: "رياضة", slug: "sports" },
  رياضة: { name: "رياضة", slug: "sports" },
  "خيال علمي وفانتازيا": { name: "خيال علمي", slug: "sci-fi" },
  "sci-fi": { name: "خيال علمي", slug: "sci-fi" },
  "خيال علمي": { name: "خيال علمي", slug: "sci-fi" },
};

export default function QuickGenres({ genres }) {
  if (!genres || genres.length === 0) return null;

  const mergedGenresMap = {};

  genres.forEach((g) => {
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
          workCount: count,
        };
      }
    }
  });

  // تحويل الكائن إلى مصفوفة مرتبة تنازلياً حسب الأكثر محتوى ومصفاة من الأقسام الصفرية
  const cleanedGenres = Object.values(mergedGenresMap)
    .filter((g) => g.workCount > 0)
    .sort((a, b) => b.workCount - a.workCount);

  return (
    <section className="relative w-full pr-1 select-none">
      {/* التلاشي الجانبي السينمائي المتوافق مع ثيم الموقع */}
      <div className="absolute inset-y-0 left-0 w-16 z-10 bg-linear-to-r from-(--background) to-transparent pointer-events-none hidden md:block" />
      <div className="absolute inset-y-0 right-0 w-16 z-10 bg-linear-to-l from-(--background) to-transparent pointer-events-none hidden md:block" />

      {/* حاوية العناصر القابلة للتمرير الأفقي بسلاسة */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4 py-1 md:px-8 snap-x snap-proximity">
        {cleanedGenres.map((genre) => {
          const Icon = iconMap[genre.slug] || iconMap.default;

          return (
            <Link
              key={genre.id}
              href={`/genre/${encodeURIComponent(genre.slug)}`}
              prefetch={false}
              className="group relative flex items-center gap-3 px-5 py-3 rounded-xl
                          bg-(--card-bg) border border-slate-200 dark:border-white/4
                          lg:hover:border-(--accent)/30 lg:hover:bg-(--accent)/5
                          snap-start flex-none no-underline shadow-xs
                          transition-[border-color,background-color] duration-200"
            >
              {/* تأثير النيون للأيقونة عند الهوفير */}
              <div className="flex items-center justify-center text-slate-400 lg:group-hover:text-(--accent) transition-colors duration-200">
                <Icon size={18} />
              </div>

              {/* ضبط خطوط النص بما يتوافق مع العربية والإنجليزية */}
              <span
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-(--foreground) transition-colors duration-300"
                            
              >
                {genre.name}
              </span>

              {/* خط توهج سفلي ناعم واحترافي بدلاً من النقطة الحادة */}
              <div className="absolute bottom-0 left-0 right-0 h- bg-(--accent) opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
