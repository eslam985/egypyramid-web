// src/app/[category]/[slug]/watch/page.js
// ⚠️ بعد ما تحط الملف ده، احذف watch_page.js من نفس المجلد

import { mediaService } from '@/services/MediaService';
import WatchPageClient from './WatchPageClient';
import {
    constructMetadata,
} from '../../../../lib/seo';

export const revalidate = 3600;


// / تحسين OpenGraph type للفيديو + inLanguage في JSON-LD إن أمكن
export async function generateMetadata({ params }) {
    const { category, slug: encodedSlug } = await params;
    const decodedSlug = decodeURIComponent(encodedSlug);
    const mediaId = parseInt(decodedSlug.split('-')[0], 10);
    const { data: epData } = await mediaService.getEpisodeForMetadata(mediaId);
    
    if (!epData) {
        return constructMetadata({
            title: 'مشاهدة الآن',
            description: 'مشاهدة أون لاين بجودة عالية.',
            path: `/${category}/${encodedSlug}/watch`,
            type: 'video.movie',
            noIndex: true,
        });
    }
    const isMovie = category === 'movie';
    return constructMetadata({
        title: `${isMovie ? "مشاهدة فيلم" : "مشاهدة مسلسل"} ${epData.medias.title} ${!isMovie ? `حلقة ${epData.episode_number}` : ""} مترجم أون لاين بجودة عالية`,
        description: `مشاهدة ${epData.medias.title} مترجم أون لاين. ${epData.medias.story?.slice(0, 150) || ''} بجودة عالية 4K على EGY PYRAMID.`,
        image: epData.medias.poster_url,
        path: `/${category}/${encodedSlug}/watch`,
        type: isMovie ? 'video.movie' : 'video.tv_show', // أهم تحسين
        noIndex: true,
    });
}

export default async function EpisodePage({ params }) {
    const { category, slug: encodedSlug } = await params;
    const decodedSlug = decodeURIComponent(encodedSlug);
    const mediaId = parseInt(decodedSlug.split('-')[0], 10);

    const { data: epData, error } = await mediaService.getWatchPageEpisode(mediaId);

    if (error || !epData) {
        console.error("Watch Page Error:", error?.message, error?.details);
        return <div className="p-20 text-center">خطأ في تحميل البيانات.. {error?.message}</div>;
    }


    const firstGenre = epData?.medias?.media_genres?.[0]?.genres;
    const firstLabel = epData?.medias?.labels ? epData.medias.labels.split(',')[0].trim() : null;

    let allEpisodes = [];
    if (category === 'tv') {
        const { data } = await mediaService.getAllEpisodesByMediaId(epData.medias.id);
        allEpisodes = data || [];
    }

    const targetType = category === 'movie' ? 'movie' : 'series';
    
    // استدعاء دالة الـ Related Media النظيفة التي تدير شروط البحث (Fallbacks) بالكامل من السيرفر
    const relatedMedia = await mediaService.getWatchRelatedMedia(
        targetType, 
        epData.medias.id, 
        firstGenre?.id, 
        firstLabel
    );

    return (
        <WatchPageClient
            epData={epData}
            allEpisodes={allEpisodes}
            relatedMedia={relatedMedia}
            currentGenre={firstGenre}
            category={category}
            encodedSlug={encodedSlug}
            season={epData.seasons?.season_number || 1}
        />
    );
}