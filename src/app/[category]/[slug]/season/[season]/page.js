///media/es/DDrive/projects/web-Next/egypyramid-web/src/app/[category]/[slug]/season/[season]/page.js
import { mediaService } from "@/services/MediaService";
import {
  constructMetadata,
  buildBreadcrumbSchema,
  serializeJsonLd,
  getSiteUrl,
  absoluteUrl,
} from "../../../../../lib/seo";
import { Play, ChevronRight, Calendar, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // ✅ أضفنا الاستيراد
import { optimizeCloudinary } from "../../../../../lib/helpers"; // ✅ استدعاء دالة التحسين

export const revalidate = 86400; // المواسم مستقرة، تحديث كل يوم كافي

// --- سيو الموسم الذكي ---
// src/app/[category]/[slug]/season/[season]/page.js
export async function generateMetadata({ params }) {
  const { category, slug: encodedSlug, season: seasonNumber } = await params;
  const slug = decodeURIComponent(encodedSlug);

  const { data: media } = await mediaService.getMediaDetails(slug);

  if (!media)
    return constructMetadata({
      title: "الموسم غير موجود",
      noIndex: true,
      path: `/${category}/${encodedSlug}/season/${seasonNumber}`,
    });

  return constructMetadata({
    title: `مشاهدة مسلسل ${media.title} الموسم ${seasonNumber} بجودة عالية`, // 👈 تم ضبط الـ Title ليمثل الموسم بدقة
    description: `شاهد حلقات مسلسل ${media.title} الموسم ${seasonNumber} كاملة بجودة عالية على PYRAMID EGY. ${media.story?.slice(0, 100)}`,
    image: media.poster_url,
    path: `/${category}/${encodedSlug}/season/${seasonNumber}`,
    type: "video.tv_show",
    rating: media.rating,
    duration: media.runtime,
    videoDuration: media.duration_iso,
  });
}

export default async function SeasonPage({ params }) {
  const { category, slug: encodedSlug, season: seasonNumber } = await params;
  const slug = decodeURIComponent(encodedSlug);

  // 1. جلب بيانات المسلسل
  const { data: media, error } = await mediaService.getMediaDetails(slug);

  // 2. جلب معرف السيزون
  const { data: seasonData } = await mediaService.getSeasonData(
    media?.id,
    seasonNumber,
  );

  // 3. جلب الحلقات باستخدام المنطق الموحد في السيرفيس
  const { data: episodes } = await mediaService.getSeasonEpisodes(
    media?.id,
    seasonData?.id,
  );

  if (error || !media) {
    if (error)
      console.error(
        "Supabase Error Details (Season Page):",
        error.message,
        error.details,
      );
    return (
      <div className="py-fluid-section text-center text-(--foreground)/50 font-black">
        الموسم غير موجود أو حدث خطأ في التحميل..
      </div>
    );
  }
  const siteUrl = getSiteUrl();
  const seriesUrl = absoluteUrl(`/${category}/${encodedSlug}`);
  const seasonUrl = absoluteUrl(
    `/${category}/${encodedSlug}/season/${seasonNumber}`,
  );
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "الرئيسية", url: `${siteUrl}/` },
    { name: "مسلسلات", url: `${siteUrl}/${category}` },
    { name: media.title, url: seriesUrl },
    { name: `الموسم ${seasonNumber}`, url: seasonUrl },
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
      <main className="min-h-screen bg-(--background) pb-20 transition-colors duration-500 overflow-x-hidden">
        {/* --- 1. Hero Section: Cinematic Backdrop --- */}
        <div className="relative h- md:h- w-full flex items-end pb-6 md:pb-20 overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
            <Image
              src={optimizeCloudinary(media.poster_url, 1200)}
              fill
              priority
              unoptimized
              alt={media.title}
              className="object-cover opacity-20"
            />
            {/* الذكاء في التدرج: بيمنع القص البصري */}
            <div className="absolute inset-0 bg-linear-to-t from-(--background) via-(--background)/80 to-transparent" />
            <div className="absolute inset-0 hidden md:block bg-linear-to-r from-(--background) via-transparent to-(--background)" />
          </div>

          {/* Content Layer */}
          <div className="relative z-10 max-w-7xl mx-auto px-fluid-p w-full md:pt-3 text-center md:text-right flex flex-col md:flex-row items-center gap-8">
            {/* Poster Mini */}
            <div className="hidden md:block w-48 aspect-2/3 rounded-3xl overflow-hidden shadow-2xl border border-white/10 rotate-2 lg:hover:rotate-0 transition-transform duration-700">
              <Image
                src={optimizeCloudinary(media.poster_url, 400)}
                fill
                className="object-cover"
                alt=""
                unoptimized
              />
            </div>

            <div className="flex-1 space-y-4 pt-3">
              <Link
                prefetch={false}
                href={`/${category}/${encodedSlug}`}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-white/5 lg:hover:bg-(--accent)/10 border border-white/5 rounded-full no-underline"
              >
                <ChevronRight
                  size={18}
                  className="text-(--accent) group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground)/60 group-hover:text-(--foreground)">
                  العودة للمسلسل
                </span>
              </Link>

              <h1 className="text-fluid-h1 font-black text-(--foreground) leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                {media.title}{" "}
                <span className="text-(--accent) block md:inline-block md:mr-4">
                  / {seasonNumber}
                </span>
              </h1>

              <p className="text-fluid-p text-(--foreground)/50 max-w-2xl line-clamp-2 font-medium mx-auto md:mx-0">
                {media.story}
              </p>
            </div>
          </div>
        </div>

        {/* --- 2. Episodes Grid Section --- */}
        <div className="max-w-7xl mx-auto px-fluid-p -mt-10 relative z-20">
          {/* Header Info Bar */}
          <div className="flex items-center justify-between mb-10 glass-card p-6 border-b border-(--accent)/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-(--accent) flex items-center justify-center shadow-lg shadow-(--accent)/20">
                <Layers size={20} className="text-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-black text-(--foreground)">
                  حلقات الموسم
                </h3>
                <p className="text-[10px] font-bold text-(--foreground)/40 uppercase tracking-widest">
                  {episodes?.length || 0} Episodes Available
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black">
                4K UHD
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black">
                ARABIC SUB
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {episodes?.map((ep, index) => (
              <Link
                prefetch={false}
                key={ep.id}
                href={`/${category}/${encodedSlug}/season/${seasonNumber}/episode/${ep.episode_number}`}
                className="group relative no-underline"
              >
                <div className="relative aspect-video rounded- overflow-hidden bg-(--card-bg) border border-white/5 shadow-lg transition-colors duration-200 lg:group-hover:border-(--accent)/30">
                  <Image
                    src={optimizeCloudinary(
                      ep.thumbnail_url || media.poster_url,
                      600,
                    )}
                    fill
                    unoptimized
                    className="object-cover opacity-80 lg:group-hover:opacity-100 transition-opacity duration-200"
                    alt={ep.title || `الحلقة ${ep.episode_number}`}
                  />

                  {/* Overlay Play UI */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-(--accent)/90 flex items-center justify-center shadow-xl opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                      <Play
                        size={28}
                        className="fill-slate-900 text-slate-900 ml-1"
                      />
                    </div>
                  </div>

                  {/* Episode Badge */}
                  <div className="absolute top-4 left-4 glass-card px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[9px] font-black text-(--accent)">
                      EPISODE {ep.episode_number}
                    </span>
                  </div>

                  {/* Bottom Info Fade */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black via-black/40 to-transparent">
                    <h2 className="text-sm font-black text-white line-clamp-1 group-hover:text-(--accent) transition-colors">
                      {ep.title || `الحلقة رقم ${ep.episode_number}`}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {(!episodes || episodes.length === 0) && (
            <div className="glass-card py-32 text-center flex flex-col items-center gap-6 max-w-2xl mx-auto mt-10 border-dashed border-white/10 shadow-none">
              <div className="w-24 h-24 bg-(--accent)/5 rounded-full flex items-center justify-center border border-(--accent)/10">
                <Layers size={48} className="text-(--accent)/20" />
              </div>
              <h2 className="text-fluid-h3 font-black text-(--foreground)/80 tracking-tighter">
                الحلقات في الطريق..
              </h2>
              <p className="text-fluid-p text-(--foreground)/30 max-w-xs leading-relaxed">
                المحتوى قيد الرفع حالياً، انتظرونا لتجربة مشاهدة لا مثيل لها.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
