///media/es/DDrive/projects/web-Next/egypyramid-web/src/app/genre/[slug]/page.js
import { mediaService } from '@/services/MediaService';
import {
    constructMetadata,
    buildItemListSchema,
    buildBreadcrumbSchema,
    serializeJsonLd,
    getSiteUrl,
    absoluteUrl,
} from '../../../lib/seo';
import MovieCard from '../../../components/common/MovieCard';
import AdvancedFilter from '../../../components/search/AdvancedFilter';
import Link from 'next/link';
export const revalidate = 3600;
// --- تركة الـ SEO لصفحة التصنيفات ---
// src/app/genre/[slug]/page.js
export async function generateMetadata({ params, searchParams }) {
    const { slug: encodedSlug } = await params;
    const slug = decodeURIComponent(encodedSlug);
    const sParams = await searchParams;

    const titles = {
        movies: 'أحدث الأفلام الحصرية مترجمة بجودة 4K',
        series: 'أحدث المسلسلات العربية والأجنبية مترجمة',
        'top-rated': 'الأفلام والمسلسلات الأعلى تقييماً وطلباً',
        'latest-episodes': 'أحدث الحلقات المضافة اليوم - مشاهدة مباشرة'
    };

    const pageTitle = titles[slug] || `مشاهدة أفلام ومسلسلات ${slug}`;

    const pageNum = parseInt(sParams.page, 10) || 1;

    return constructMetadata({
        title: pageTitle,
        description: `تصفح محتوى ${pageTitle}: أفلام ومسلسلات وحلقات مُحدَّثة باستمرار.`,
        noIndex: pageNum > 1,
        path: `/genre/${encodedSlug}${pageNum > 1 ? `?page=${pageNum}` : ''}`
    });
}
// ----------------------------
export default async function GenrePage({ params, searchParams }) {
    const { slug: encodedSlug } = await params;
    const sParams = await searchParams;

    // 2. تحديد الصفحة الحالية والـ Range
    const currentPage = parseInt(sParams.page) || 1;
    const itemsPerPage = 24;
    const decodedSlug = decodeURIComponent(encodedSlug);

    // جلب البيانات الأساسية، التصنيفات، والسنوات بالتوازي لتغذية مكون الفلاتر
    const [pageData, genres, availableYears] = await Promise.all([
        mediaService.getCategoryPageData(decodedSlug, currentPage, itemsPerPage),
        mediaService.getAllGenres(),
        mediaService.getAvailableYears()
    ]);
    
    const { mediaList, totalCount, pageTitle } = pageData;

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const siteUrl = getSiteUrl();
    const genrePath = `/genre/${encodedSlug}${currentPage > 1 ? `?page=${currentPage}` : ''}`;
    const listSchema = buildItemListSchema(
        (mediaList || []).map((item) => ({
            name: item.title,
            url: absoluteUrl(
                `/${(item.media_type === 'series' || item.media_type === 'tv') ? 'tv' : 'movie'}/${item.slug}`
            ),
            image: item.poster_url || undefined,
        }))
    );
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'الرئيسية', url: `${siteUrl}/` },
        { name: pageTitle, url: absoluteUrl(genrePath) },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(listSchema) }}
            />
            {breadcrumbJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
                />
            )}
            <main className="max-w-350 mx-auto min-h-screen bg-(--background) px-2  transition-colors duration-300">
                <div>

                    {/* Header Section */}
                    <header className="mb-12 relative group animate-fadeInUp">
                        <div className="absolute -right-4 top-0 h-full w-1 bg-(--accent) rounded-full shadow-[0_0_15px_var(--accent)] opacity-80"></div>
                        <div className="pr-2">
                            <h1 className="text-[16px] md:text-4xl font-black text-(--foreground) tracking-tighter mb-2 md:mb-6">
                                {pageTitle}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-(--accent)/50"></span>
                                <p className="text-(--accent) text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">
                                    تصفح أفضل المحتويات المختارة
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* مكون الفلاتر للبحث المتقدم */}
                    <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                        <AdvancedFilter genres={genres} availableYears={availableYears} />
                    </div>

                    {/* Grid Section */}
                    {mediaList && mediaList.length > 0 ? (
                        /* التعديل هنا: يبدأ من 3 كروت في أصغر شاشة موبايل */
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 lg:gap-8">
                            {mediaList.map((media, index) => (
                                <div
                                    key={media.unique_key || media.id}
                                    className="animate-fadeInUp"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <MovieCard media={media} index={index} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State - شكل احترافي بالـ glass-card */
                        <div className="py-32 flex flex-col items-center justify-center glass-card border-dashed border-2 border-slate-500/20 max-w-2xl mx-auto animate-fadeInUp">
                            <div className="w-20 h-20 rounded-3xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 rotate-12 group-hover:rotate-0 transition-transform">
                                <span className="text-4xl">🎬</span>
                            </div>
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">القسم فارغ حالياً</h3>
                            <p className="text-slate-500 text-sm font-medium text-center px-6">
                                نحن نعمل على إضافة أحدث الأفلام والمسلسلات في هذا القسم. <br /> شكراً لصبرك معنا!
                            </p>
                        </div>
                    )}
                    {/* --- أزرار الترقيم (Pagination) المصححة للمسار --- */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-2">
                            {currentPage > 1 && (
                                <Link
                                    prefetch={false}
                                    href={`/genre/${encodedSlug}?page=${currentPage - 1}`} // 👈 تم تثبيت المسار لتجنب ضياع الرابط
                                    className="px-4 py-2 bg-[var(--card-bg)] rounded-xl border border-white/5 hover:border-[var(--accent)] transition-all"
                                >
                                    السابق
                                </Link>
                            )}

                            <span className="text-sm font-bold opacity-80">
                                صفحة {currentPage} من {totalPages}
                            </span>

                            {currentPage < totalPages && (
                                <Link
                                    prefetch={false}
                                    href={`/genre/${encodedSlug}?page=${currentPage + 1}`} // 👈 تم تثبيت المسار لتجنب ضياع الرابط
                                    className="px-4 py-2 bg-(--card-bg) rounded-xl border border-white/5 hover:border-[var(--accent)] transition-all"
                                >
                                    التالي
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}   