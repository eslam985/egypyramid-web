// src/app/[category]/[slug]/page.js
import Image from 'next/image';
import { cache } from 'react';
import { mediaService } from '@/services/MediaService'; // 👈 استدعاء الـ Service بدلاً من supabase
import {
    constructMetadata,
    generateSchema,
    buildBreadcrumbSchema,
    serializeJsonLd,
    getSiteUrl,
    absoluteUrl,
} from '@/lib/seo';
import { getCategory } from '../../../lib/helpers';
import RelatedMedia from '../../../components/common/RelatedMedia';
import { Star, Calendar, Clock, Play, List, Download, ChevronLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import { optimizeCloudinary } from '@/lib/helpers';

export const revalidate = 86400;

// 👈 استخدام cache ضروري جداً هنا لمنع Next.js من الاتصال بقاعدة البيانات مرتين (مرة للميتا ومرة للصفحة)
const getMediaData = cache(async (slug) => {
    const { data, error } = await mediaService.getMediaDetails(slug);
    return { media: data, error };
});

export async function generateMetadata({ params }) {
    const { slug: encodedSlug, category } = await params;
    const slug = decodeURIComponent(encodedSlug);

    const { media } = await getMediaData(slug);

    if (!media) {
        return {
            ...constructMetadata({
                title: 'المحتوى غير موجود - EGY PYRAMID',
                noIndex: true,
                path: `/${category}/${encodedSlug}`,
            }),
        };
    }

    const displayTitle = `مشاهدة ${media.title} بجودة عالية | ايجي بيراميد - EGY PYRAMID`;
    return {
        ...constructMetadata({
            title: displayTitle,
            description: media.story?.slice(0, 160),
            image: media.poster_url,
            path: `/${category}/${encodedSlug}`,
            type: media.media_type === 'series' ? 'video.tv_show' : 'video.movie',
            rating: media.rating,
            duration: media.runtime,
            videoDuration: media.duration_iso
        }),
        alternates: {
            canonical: `/${category}/${encodedSlug}`,
        },
    };
}

export default async function MediaPage({ params, searchParams }) {
    const { category, slug: encodedSlug } = await params;
    const sParams = await searchParams;
    const fromGenreSlug = sParams.from;
    const slug = decodeURIComponent(encodedSlug);

    const searchType = category === 'tv' ? 'series' : 'movie';

    const { media, error } = await getMediaData(slug);

    if (error || !media) {
        return (
            <div className="p-20 text-center text-slate-500">
                العنصر غير موجود أو حدث خطأ.
            </div>
        );
    }

    let currentGenre = null;
    if (fromGenreSlug && media.media_genres?.length > 0) {
        currentGenre = media.media_genres.find(mg => mg.genres?.slug === fromGenreSlug)?.genres || null;
    }
    if (!currentGenre && media.media_genres?.length > 0) {
        currentGenre = media.media_genres[0].genres || null;
    }

    const genreId = currentGenre?.id;
    let relatedMedia = [];
    
    // 👈 استدعاء المحتوى المشابه من الـ Service بسطر واحد!
    if (genreId) {
        const { data } = await mediaService.getRelatedMedia(genreId, media.id);
        relatedMedia = data || [];
    }

    const mediaCategory = getCategory(media);
    const siteUrl = getSiteUrl();
    const canonicalUrl = absoluteUrl(`/${mediaCategory}/${encodedSlug}`);

    const mediaJsonLd = generateSchema(media, { canonicalUrl });
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'الرئيسية', url: `${siteUrl}/` },
        {
            name: searchType === 'series' ? 'مسلسلات' : 'أفلام',
            url: `${siteUrl}/${mediaCategory}`,
        },
        { name: media.title, url: canonicalUrl },
    ]);

    return (
        // ... باقي الكود (الـ JSX) الخاص بك
        <>
            {mediaJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeJsonLd(mediaJsonLd) }}
                />
            )}
            {breadcrumbJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
                />
            )}
            <main className="max-w-350 mx-auto min-h-screen bg-(--background) pb-8 transition-colors duration-500 py-fluid-section">
                <div className="px-2 relative z-10    ">
                    <div className="grid md:grid-cols-12 gap-8 lg:gap-12  ">

                        {/* Side Info (Poster & Actions) */}
                        <div className="md:col-span-4 lg:col-span-3">
                            <div className="md:sticky md:top-24 space-y-6 md:space-y-8">

                                {/* البوستر */}
                                <div className="relative group perspective-1000 mx-auto md:mx-0 max-w-70 sm:max-w-[320px] md:max-w-full animate-fade-in-up ">
                                    <div className="absolute -inset-2 bg-(--accent)/20 rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 duration-700 scale-90 group-hover:scale-105" />

                                    <div className="relative aspect-2/3 max-h-100 md:max-h-none rounded-[2.2rem] overflow-hidden shadow-2xl border border-white/5 bg-(--card-bg)">
                                        <Image
                                            // طلبنا 500 بكسل عرض (أدق مقاس للـ LCP في الصفحة دي)
                                            src={optimizeCloudinary(media.poster_url, 300)}
                                            alt={media.title}
                                            fill
                                            unoptimized // 👈 ضرورية لضمان وصول الـ 500px بالظبط من Cloudinary
                                            className="object-cover duration-1000 group-hover:scale-110 group-hover:rotate-2"
                                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16.66vw, 200px"
                                            priority={true}
                                            fetchPriority="high" // 🚀 الضربة القاضية فعلاً لسرعة الـ LCP
                                            decoding="async"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                                        <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    </div>
                                </div>

                                {/* حالة العمل */}
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">الحالة</span>
                                    <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                        متاح للمشاهدة
                                    </span>
                                </div>

                                {/* أزرار التفاعل */}
                                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                                    {/* ✅ إصلاح: media_type === 'series' مش 'tv' */}
                                    {media.media_type === 'series' && media.seasons?.length > 0 ? (
                                        <a
                                            href="#seasons-section"
                                            className="group w-full py-5 bg-(--accent) text-slate-950 rounded-2xl font-black flex items-center justify-center gap-3 lg:hover:shadow-[0_20px_40px_rgba(202,138,4,0.3)] lg:hover:-translate-y-1 active:scale-95 duration-500 no-underline relative overflow-hidden"
                                        >
                                            <Play size={22} className="fill-slate-950 group-hover:translate-x-1 transition-transform" />
                                            <span className="relative z-10 text-fluid-p uppercase tracking-widest">عرض المواسم</span>
                                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                                        </a>
                                    ) : (
                                        <Link
                                            prefetch={false}
                                            href={`/${mediaCategory}/${encodedSlug}/watch`}
                                            className="group h-13 md:h-16 py-2 px-2  md:py-5 bg-yellow-500 text-(--foreground) rounded-2xl font-black flex items-center justify-center gap-3 lg:hover:shadow-[0_20px_40px_rgba(202,138,4,0.3)] lg:hover:-translate-y-1 active:scale-95 duration-500 no-underline relative overflow-hidden"
                                        >
                                            <Play size={18} className="fill-(--accent) group-hover:scale-125 transition-transform" />
                                            <span className=" text-fluid-p uppercase tracking-widest text-black">مشاهدة الآن</span>
                                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                                        </Link>
                                    )}

                                    {/* إذا كان العمل فيلماً، أو مسلسلاً بموسم واحد فقط، يظهر الزرار */}
                                    {(media.media_type === 'movie' || (media.seasons && media.seasons.length <= 1)) && (
                                        <Link
                                            prefetch={false}
                                            href={`/${mediaCategory}/${encodedSlug}/download/1`}
                                            className="h-13 md:h-16 glass-card group w-full py-5 text-(--foreground) font-black flex items-center justify-center gap-3 lg:hover:border-(--accent)/50 lg:hover:text-(--accent) duration-500 no-underline"
                                        >
                                            <div className="p-2 rounded-xl bg-(--foreground)/5 group-hover:bg-(--accent)/10 transition-colors">
                                                <Download size={20} className="group-hover:animate-float" />
                                            </div>
                                            <span className="text-fluid-xs uppercase tracking-widest">تحميل العمل</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-10">
                            <div>
                                <h1 className="text-fluid-h2 font-black text-(--foreground) tracking-tighter leading-tight mb-4 mx-2">
                                    {media.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-wider">

                                    {/* التقييم */}
                                    <div className="group px-4 py-2.5 bg-(--background)/10 text-(--foreground)/73 rounded-2xl border border-(--bg-card)/20 flex items-center gap-2 lg:hover:bg-(--bg-card)/30 lg:hover:text-(--accent) duration-500">
                                        <Star size={14} className="fill-(--accent) group-hover:fill-(--background) transition-colors" />
                                        <span className="leading-none">{media.rating || '8.5'}</span>
                                    </div>

                                    {/* السنة */}
                                    <div className="px-4 py-2.5 bg-(--background) text-(--foreground)/73 rounded-2xl border border-white/10 flex items-center gap-2 lg:hover:border-white/20">
                                        <Calendar size={14} className="opacity-80" />
                                        <span className="leading-none">{media.year}</span>
                                    </div>

                                    {/* المدة */}
                                    <div className="px-4 py-2.5 bg-(--background) text-(--foreground)/73 rounded-2xl border border-white/10 flex items-center gap-2 lg:hover:border-white/20">
                                        <Clock size={14} className="opacity-70" />
                                        <span className="leading-none">{media.runtime || '120 د'}</span>
                                    </div>

                                    <div className="h-4 w-px bg-white/10 mx-1 hidden md:block" />

                                    {/* التصنيفات */}
                                    {media.media_genres?.map((mg) => (
                                        mg.genres && (
                                            <Link
                                                prefetch={false}
                                                key={mg.genres.id}
                                                href={`/genre/${mg.genres.slug}`}
                                                className="px-4 py-2.5 bg-(--background) text-[#996903] rounded-2xl border border-blue-500/10 lg:hover:bg-blue-500 lg:hover:text-white duration-500 no-underline flex items-center gap-2"
                                            >
                                                <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                                                {mg.genres.name}
                                            </Link>
                                        )
                                    ))}

                                    {/* الـ Labels */}
                                    {media.labels && media.labels.split(',').map((label, index) => {
                                        const cleanLabel = label.trim();
                                        const isAlreadyShown = media.media_genres?.some(mg => mg.genres?.name === cleanLabel);
                                        if (isAlreadyShown || !cleanLabel) return null;

                                        return (
                                            <Link
                                                prefetch={false}
                                                key={`label-${index}`}
                                                href={`/genre/${encodeURIComponent(cleanLabel)}`}
                                                className="px-4 py-2.5 bg-emerald-600 text-emerald-400 rounded-2xl border border-emerald-500/10 lg:hover:bg-emerald-500 lg:hover:text-white duration-500 no-underline flex items-center gap-2"
                                            >
                                                <span className="text-[8px] opacity-40">#</span>
                                                {cleanLabel}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* قصة العمل */}
                            <div className="space-y-6 max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center gap-4 group/title">
                                    <div className="p-2.5 rounded-xl bg-(--accent)/10 text-(--accent) group-hover/title:scale-110 transition-transform">
                                        <List size={24} />
                                    </div>
                                    <h2 className="text-fluid-h3 font-black text-(--foreground) tracking-tight uppercase">
                                        قصة العمل
                                    </h2>
                                </div>

                                <div className="relative group/text">
                                    <div className="absolute right-0 top-0 bottom-0 w-.75 bg-(--accent)/20 rounded-full group-hover/text:bg-(--accent) group-hover/text:w-1.5 duration-500" />
                                    <p className="text-fluid-p leading-relaxed text-(--foreground)/80 font-medium md:pr-8 antialiased">
                                        {media.story || "لا يوجد وصف حالياً لهذه المادة السينمائية."}
                                    </p>
                                </div>
                            </div>

                            {/* المواسم */}
                            {/* ✅ إصلاح: media_type === 'series' مش 'tv' */}
                            {media.media_type === 'series' && media.seasons?.length > 0 && (
                                <div id="seasons-section" className="pt-12 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                    <div className="flex items-center gap-4 group/title">
                                        <div className="p-3 bg-(--accent)/10 rounded-2xl border border-(--accent)/20 group-hover/title:rotate-12 transition-transform duration-500">
                                            <Layers className="text-(--accent)" size={24} />
                                        </div>
                                        <h3 className="text-fluid-h3 font-black text-(--foreground) tracking-tight uppercase">
                                            المواسم المتاحة
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-fluid-gap">
                                        {media.seasons.sort((a, b) => a.season_number - b.season_number).map((s) => (
                                            <Link
                                                prefetch={false}
                                                key={s.id}
                                                // ✅ إصلاح: استخدام mediaCategory بدل '/series/' هاردكود
                                                href={`/${mediaCategory}/${encodedSlug}/season/${s.season_number}`}
                                                className="glass-card group flex flex-col items-center justify-center p-6 md:p-8 lg:hover:border-(--accent)/50 lg:hover:-translate-y-2 duration-500 no-underline"
                                            >
                                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-(--foreground)/5 flex items-center justify-center mb-4 group-hover:bg-(--accent) group-hover:text-slate-950 duration-500">
                                                    <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                                </div>
                                                <span className="font-black text-fluid-xs text-(--foreground)/80 group-hover:text-(--foreground) uppercase tracking-widest transition-colors">
                                                    موسم {s.season_number}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* الحلقات المباشرة (للمسلسلات بدون مواسم) */}
                            {media.media_type === 'series' && (!media.seasons || media.seasons.length === 0) && media.episodes?.length > 0 && (
                                <div className="pt-12 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-(--accent)/10 rounded-2xl border border-(--accent)/20">
                                            <Layers className="text-(--accent)" size={24} />
                                        </div>
                                        <h3 className="text-fluid-h3 font-black text-(--foreground) tracking-tight uppercase">
                                            الحلقات ({media.episodes.length})
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                        {media.episodes
                                            .sort((a, b) => a.episode_number - b.episode_number)
                                            .map((ep) => (
                                                <Link
                                                    prefetch={false}
                                                    key={ep.id}
                                                    href={`/${mediaCategory}/${encodedSlug}/episode/${ep.episode_number}`}
                                                    className="aspect-square rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-[11px] font-black text-(--foreground) lg:hover:bg-(--accent) lg:hover:text-slate-950 lg:hover:border-(--accent) no-underline"
                                                >
                                                    {ep.episode_number}
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                    <RelatedMedia relatedMedia={relatedMedia} currentGenre={currentGenre} />
                </div>
            </main>
        </>
    );
}