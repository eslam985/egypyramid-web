// src/app/search/page.js
import { mediaService } from "@/services/MediaService";
import { constructMetadata } from "../../lib/seo";
import MovieCard from "../../components/common/MovieCard";
import AdvancedFilter from "../../components/search/AdvancedFilter";
import Link from "next/link"; // تأكد من الاستيراد فوق

export const revalidate = 60; // البحث دايماً fresh — مش بنكاشه

export async function generateMetadata({ searchParams }) {
  const sParams = await searchParams;
  const query = sParams.q || "";

  return constructMetadata({
    title: query ? `نتائج البحث عن "${query}"` : "البحث",
    description: "ابحث عن أفلام ومسلسلات في المكتبة.",
    noIndex: true,
    path: "/search",
  });
}

export default async function SearchPage({ searchParams }) {
  const sParams = await searchParams;

  // استخراج جميع الفلاتر
  const query = sParams.q?.trim() || "";
  const type = sParams.type || "all";
  const year = sParams.year || "";
  const genreId = sParams.genreId || "";
  const label = sParams.label?.trim() || "";
  const sort = sParams.sort || "created_at_desc";
  const currentPage = parseInt(sParams.page, 10) || 1;
  const limit = 48;

  let results = [];
  let totalCount = 0;

  // دالة لتوليد روابط الصفحات مع الحفاظ على الفلاتر الحالية
  const buildPageUrl = (newPage) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    if (year) params.set("year", year);
    if (genreId) params.set("genreId", genreId);
    if (label) params.set("label", label);
    if (sort !== "created_at_desc") params.set("sort", sort);
    params.set("page", newPage);
    return `/search?${params.toString()}`;
  };

  // جلب التصنيفات والسنوات المتاحة لتمريرها لمكون الفلاتر بالتوازي
  const [genres, availableYears] = await Promise.all([
    mediaService.getAllGenres(),
    mediaService.getAvailableYears()
  ]);

  // تشغيل البحث إذا كان هناك أي فلتر مفعل
  const isSearchActive = query.length >= 2 || year || genreId || label;

  if (isSearchActive) {
    const searchData = await mediaService.searchMedia({
      query,
      type,
      year,
      genreId,
      label,
      sort,
      page: currentPage,
      limit
    });
    results = searchData.results;
    totalCount = searchData.totalCount;
  }

  return (
    <main className="min-h-screen bg-(--background) py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-6">
          <h1 className="text-fluid-h2 font-black text-(--foreground) tracking-tighter">
            {query ? `نتائج: "${query}"` : "البحث المتقدم"}
          </h1>

          {/* مكون الفلاتر الجديد */}
          <AdvancedFilter genres={genres} availableYears={availableYears} />
        </header>

        {/* النتائج */}
        {!isSearchActive ? (
          <div className="py-24 text-center text-(--foreground)/30 font-black uppercase tracking-widest">
            استخدم الفلاتر أعلاه للبحث
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-[11px] font-bold text-(--foreground)/40 uppercase tracking-widest">
              {totalCount} نتيجة
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
              {results.map((media, index) => (
                <MovieCard key={media.id} media={media} index={index} />
              ))}
            </div>

            {/* أزرار التصفح (Pagination) */}
            {totalCount > limit && (
              <div className="flex justify-center items-center gap-4 mt-12 pt-6 border-t border-(--foreground)/5">
                {currentPage > 1 && (
                  <Link
                    href={buildPageUrl(currentPage - 1)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-(--background)/50 border border-(--foreground)/10 hover:border-(--accent) hover:text-(--accent) text-(--foreground) transition-all"
                  >
                    السابق
                  </Link>
                )}
                
                <span className="text-sm font-bold text-(--foreground)/60">
                  صفحة {currentPage} من {Math.ceil(totalCount / limit)}
                </span>

                {currentPage < Math.ceil(totalCount / limit) && (
                  <Link
                    href={buildPageUrl(currentPage + 1)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-(--background)/50 border border-(--foreground)/10 hover:border-(--accent) hover:text-(--accent) text-(--foreground) transition-all"
                  >
                    التالي
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="py-24 flex flex-col items-center gap-6 glass-card max-w-xl mx-auto">
            <span className="text-5xl">🔍</span>
            <h2 className="text-fluid-h3 font-black text-(--foreground)">
              لا توجد نتائج
            </h2>
            <p className="text-(--foreground)/50 text-center text-sm">
              لم نجد نتائج مطابقة لبحثك
              <br />
              جرّب تغيير الفلاتر أو الكلمات المستخدمة
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
