// /src/app/[category]/[slug]/season/[season]/episode/EpisodePageClient.js
'use client';
import { useState } from 'react';
// ✅ تصحيح المسارات (تأكد من عدد الـ ../ بناءً على موقع الملف الفعلي)
import RelatedMedia from '../../../../../../components/common/RelatedMedia';
import CinemaPortal from '../../../../../../components/watch/CinemaPortal';
import EpisodeSelector from '../../../../../../components/watch/EpisodeSelector';
import WatchContainer from '../../../../../../components/watch/WatchContainer';


export default function EpisodePageClient({
  epData, 
  allEpisodes, 
  relatedMedia, 
  currentGenre,
  category, 
  slug, 
  season, // ✅ أضفنا الموسم هنا
  firstGenre, 
  firstLabel
}) {
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20 pt-6">
      <CinemaPortal isOpen={isCinemaMode} onClose={() => setIsCinemaMode(false)} />

      <div className="max-w-[1600px] mx-auto px-4 space-y-6">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div
            className="lg:col-span-9 order-1 min-w-0"
            style={isCinemaMode ? { position: 'relative', zIndex: 2147483646 } : {}}
          >
            <WatchContainer
              links={epData.links}
              mediaTitle={epData.medias.title}
              subTitle={`الموسم ${season} - الحلقة ${epData.episode_number}`} // ✅ تحديث العنوان ليظهر الموسم
              episodeNumber={epData.episode_number}
              category={category}
              slug={slug}
              season={season} // ✅ مرر الموسم للـ Container
              isCinemaMode={isCinemaMode}
              toggleCinema={() => setIsCinemaMode(!isCinemaMode)}
            />
          </div>

          {!isCinemaMode && (
            <div className="lg:col-span-3 order-2 min-w-0 sticky top-6">
              <div className="glass-card">
                <EpisodeSelector
                  epData={epData}
                  allEpisodes={allEpisodes}
                  category={category}
                  encodedSlug={slug}
                  season={season} // ✅ مرر الموسم هنا ليتمكن المستخدم من التنقل داخل نفس الموسم
                  firstGenre={firstGenre}
                  firstLabel={firstLabel}
                />
              </div>
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
