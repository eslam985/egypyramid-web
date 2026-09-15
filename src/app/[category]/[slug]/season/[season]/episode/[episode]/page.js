// /src/app/[category]/[slug]/season/[season]/episode/[episode]/page.js
import { cache } from 'react';
import { mediaService } from '@/services/MediaService';
import {
    constructMetadata,
    serializeJsonLd,
    getSiteUrl,
    absoluteUrl,
    buildTVEpisodeJsonLd,
    buildBreadcrumbSchema,
} from '../../../../../../../lib/seo';
import EpisodePageClient from '../EpisodePageClient'; // تأكد أن المسار صحيح
export const revalidate = 3600;


const getEpisodeData = cache(async (mediaId, season, episode) => {
    return await mediaService.getSpecificEpisode(mediaId, season, episode);
});
// --- 1. السيو الديناميكي للحلقة ---
export async function generateMetadata({ params }) {
    const { category, slug: encodedSlug, episode, season } = await params;
    const decodedSlug = decodeURIComponent(encodedSlug);
    const mediaId = parseInt(decodedSlug.split('-')[0], 10);

    if (Number.isNaN(mediaId)) {
        return constructMetadata({ title: "مشاهدة الحلقة", noIndex: true });
    }

    const { data: ep } = await getEpisodeData(mediaId, season, episode);

    if (!ep) return constructMetadata({ title: "مشاهدة الحلقة", noIndex: true });

    const desc = ep.medias.story
        ? `${ep.medias.story.slice(0, 155)}${ep.medias.story.length > 155 ? '…' : ''}`
        : `مشاهدة ${ep.medias.title} — الموسم ${season} — الحلقة ${ep.episode_number}.`;

    return constructMetadata({
        title: `مشاهدة ${ep.medias.title} — الموسم ${season} — الحلقة ${ep.episode_number} مترجم أون لاين بجودة عالية`,
        description: desc,
        image: ep.medias.poster_url,
        path: `/${category}/${encodedSlug}/season/${season}/episode/${episode}`,
        type: 'video.tv_show'
    });
}

export default async function EpisodePage({ params }) {
    const { category, slug: encodedSlug, episode, season } = await params;
    const decodedSlug = decodeURIComponent(encodedSlug);
    const mediaId = parseInt(decodedSlug.split('-')[0], 10);

    const { data: epData, error } = await getEpisodeData(mediaId, season, episode);
    if (error || !epData) {
        console.error("Supabase Error Details:", error?.message, error?.details);
        return <div className="py-fluid-section text-center text-(--foreground)/50 font-black">الحلقة غير موجودة</div>;
    }

    // 3. جلب جميع حلقات المسلسل (للتنقل في الـ EpisodeSelector)
    // تعديل: نجيب كل الحلقات عشان لو فيه حلقات مش مربوطة بسيزون تظهر برضه
    // 2. جلب حلقات هذا الموسم فقط للمبدل (Selector) باستخدام السيرفس
    const { data: allEpisodes } = await mediaService.getSeasonEpisodes(epData.medias.id, epData.seasons.id);

    // 3. جلب أعمال مشابهة بالدالة الذكية (مع دعم الفولباك للـ Tags أو الأحدث)
    const firstGenre = epData?.medias?.media_genres?.[0]?.genres;
    const firstLabel = epData?.medias?.labels ? epData.medias.labels.split(',')[0].trim() : null;
    const targetType = epData.medias.media_type || 'series';

    const relatedMedia = await mediaService.getWatchRelatedMedia(
        targetType, 
        epData.medias.id, 
        firstGenre?.id, 
        firstLabel
    );

    // --- تجهيز بيانات السيو (JSON-LD) ---
    const siteUrl = getSiteUrl();
    const currentUrl = absoluteUrl(`/${category}/${encodedSlug}/season/${season}/episode/${episode}`);
    const seriesUrl = absoluteUrl(`/${category}/${encodedSlug}`);

    const episodeJsonLd = buildTVEpisodeJsonLd({
        name: `مشاهدة مسلسل ${epData.medias.title} الموسم ${season} الحلقة ${epData.episode_number}`,
        url: currentUrl,
        description: epData.medias.story,
        image: epData.medias.poster_url,
        datePublished: epData.created_at,
        episodeNumber: epData.episode_number,
        seriesName: epData.medias.title,
        seriesUrl: seriesUrl,
        seasonNumber: season,
    });

    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'الرئيسية', url: `${siteUrl}/` },
        { name: 'مسلسلات', url: `${siteUrl}/${category}` },
        { name: epData.medias.title, url: seriesUrl },
        { name: `الموسم ${season}`, url: `${seriesUrl}/season/${season}` },
        { name: `الحلقة ${epData.episode_number}`, url: currentUrl },
    ]);
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(episodeJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
            />
            <EpisodePageClient
                epData={epData}
                allEpisodes={allEpisodes || []}
                relatedMedia={relatedMedia}
                currentGenre={firstGenre}
                category={category}
                slug={encodedSlug}
                season={season}
            />
        </>
    );
}