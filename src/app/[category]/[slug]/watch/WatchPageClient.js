// /media/es/DDrive/projects/web-Next/egypyramid-web/src/app/[category]/[slug]/watch/WatchPageClient.js
'use client';
import { useState } from 'react';
import CinemaPortal from '../../../../components/watch/CinemaPortal';
import WatchContainer from '../../../../components/watch/WatchContainer';
import EpisodeSelector from '../../../../components/watch/EpisodeSelector';
import RelatedSidebar from '../../../../components/watch/RelatedSidebar';
import RelatedMedia from '../../../../components/common/RelatedMedia';

export default function WatchPageClient({
  epData,
  allEpisodes,
  relatedMedia,
  currentGenre,
  category,
  encodedSlug
}) {
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  return (
    <main className="max-w-350 mx-auto  min-h-screen bg-(--background) py-fluid-section">

      <CinemaPortal
        isOpen={isCinemaMode}
        onClose={() => setIsCinemaMode(false)}
      />

      <div className="px-3">

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div
            className="lg:col-span-9 min-w-0 order-1"
            style={isCinemaMode ? { position: 'relative', zIndex: 2147483646 } : {}}
          >
            <WatchContainer
              links={epData.links}
              mediaTitle={epData.medias?.title}
              subTitle={category === 'movie'
                ? (epData.medias?.year || '')
                : `الحلقة ${epData.episode_number}`
              }
              episodeNumber={epData.episode_number}
              // ✅ الإصلاح: نمرر category و slug بشكل صريح
              // المشكلة كانت: {...epData} بيمرر slug من epData مباشرة
              // لكن slug موجود في epData.medias.slug مش في epData نفسه
              // و category مش موجودة في epData أصلاً
              category={category}
              slug={encodedSlug}
              isCinemaMode={isCinemaMode}
              toggleCinema={() => setIsCinemaMode(!isCinemaMode)}
            />
          </div>

          {!isCinemaMode && (
            <div className="lg:col-span-3 min-w-0 order-2">
              {category === 'tv' ? (
                <EpisodeSelector
                  epData={epData}
                  allEpisodes={allEpisodes}
                  category={category}
                  encodedSlug={encodedSlug}
                />
              ) : (
                <RelatedSidebar
                  related={relatedMedia?.slice(0, 6)}
                  title="أفلام مشابهة"
                />
              )}
            </div>
          )}
        </div>

        {!isCinemaMode && relatedMedia?.length > 0 && (
          <RelatedMedia
            relatedMedia={relatedMedia}
            currentGenre={currentGenre}
          />
        )}

      </div>
    </main>
  );
}