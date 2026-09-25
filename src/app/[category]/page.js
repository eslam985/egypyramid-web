// /src/app/[category]/page.js
import { mediaService } from "@/services/MediaService";
import {
  constructMetadata,
  buildBreadcrumbSchema,
  serializeJsonLd,
  getSiteUrl,
  absoluteUrl,
} from "@/lib/seo";
import MovieCard from "../../components/common/MovieCard";
import AdvancedFilter from "../../components/search/AdvancedFilter";
import Link from "next/link";
export const revalidate = 3600;

// src/app/[category]/page.js
export async function generateMetadata({ params, searchParams }) {
  const { category } = await params;

  const sParams = await searchParams;

  const pageNum = parseInt(sParams.page, 10) || 1;
  const pageText = sParams.page ? ` - صفحة ${sParams.page}` : "";
  const titleBase =
    category === "tv" || category === "series" ? "المسلسلات" : "الأفلام";

  return constructMetadata({
    title: `أحدث ${titleBase}${pageText}`,
    description: `تابع أحدث ${titleBase} المضافة: تحديثات مستمرة وتصفح سريع.`,
    noIndex: pageNum > 1,
    path: `/${category}${pageNum > 1 ? `?page=${pageNum}` : ""}`,
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page) || 1;
  const itemsPerPage = 24; // تعريف المتغير هنا
  const searchType =
    category === "tv" || category === "series" ? "series" : "movie"; // تعريف المتغير هنا

  const [categoryData, genres, availableYears] = await Promise.all([
    mediaService.getMediaByCategory(category, currentPage, itemsPerPage),
    mediaService.getAllGenres(),
    mediaService.getAvailableYears()
  ]);

  const { data: mediaList, count, error } = categoryData;

  if (error) {
    return (
      <div className="p-20 text-center text-(--foreground)/50">حدث خطأ.</div>
    );
  }

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  const siteUrl = getSiteUrl();
  const listPath = `/${category}${currentPage > 1 ? `?page=${currentPage}` : ""}`;
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "الرئيسية", url: `${siteUrl}/` },
    {
      name: searchType === "movie" ? "أفلام" : "مسلسلات",
      url: absoluteUrl(listPath),
    },
  ]);

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(breadcrumbJsonLd),
          }}
        />
      )}
      <main className="min-h-screen w-full py-fluid-p px-fluid-p md:max-w-[90%] mx-auto md:mt-10">
        {/* Header: استخدام التنسيقات المرنة */}
        <header className="mb-6 space-y-4">
          <h1 className="text-fluid-h1 font-black text-(--foreground) tracking-tighter uppercase">
            قسم {searchType === "movie" ? "الأفلام" : "المسلسلات"}
          </h1>
          <div className="h-1.5 w-24 bg-(--accent) rounded-full shadow-[0_0_15px_var(--accent)]/30" />
        </header>

        {/* مكون الفلاتر للبحث المتقدم */}
        <div className="mb-8 animate-fade-in-up">
          <AdvancedFilter genres={genres} availableYears={availableYears} />
        </div>

        {/* استخدام كلاس movie-grid الجاهز من ملف الـ CSS الخاص بك */}
        <div className="movie-grid ">
          {mediaList?.map((item, index) => (
            <MovieCard
              key={item.id}
              index={index}
              media={{ ...item, category: category }}
            />
          ))}
        </div>

        {/* Pagination: تصميم Glassmorphism */}
        {totalPages > 1 && (
          <div className="mt-20 flex justify-center items-center gap-4">
            {currentPage > 1 && (
              <Link
                prefetch={false}
                href={`/${category}?page=${currentPage - 1}`}
                className="glass-card px-8 py-3 text-(--foreground) lg:hover:border-(--accent) lg:hover:text-(--accent) font-black no-underline active:scale-90"
              >
                السابق
              </Link>
            )}

            <div className="px-8 py-3 bg-(--accent) text-slate-950 rounded-2xl font-black text-sm shadow-xl shadow-(--accent)/20 animate-fade-in-up">
              صفحة {currentPage} من {totalPages}
            </div>

            {currentPage < totalPages && (
              <Link
                prefetch={false}
                href={`/${category}?page=${currentPage + 1}`}
                className="glass-card px-8 py-3 text-(--foreground) lg:hover:border-(--accent) lg:hover:text-(--accent) font-black no-underline active:scale-90"
              >
                التالي
              </Link>
            )}
          </div>
        )}

        {mediaList?.length === 0 && (
          <div className="text-center py-32 text-(--foreground)/30 font-black uppercase tracking-widest">
            لا يوجد محتوى حالياً
          </div>
        )}
      </main>
    </>
  );
}
