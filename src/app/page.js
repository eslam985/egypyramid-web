// /media/es/DDrive/projects/web-Next.js/src/app/page.js

import { supabase } from '@/lib/supabase';
import { constructMetadata } from '@/lib/seo';
import HeroSpotlight from '../components/main/HeroSpotlight';
import TopRatedSection from '../components/main/TopRatedSection';
import MoviesGrid from '../components/main/NewMoviesSection';
import SeriesGrid from '../components/main/NewSeriesSection';
import LatestEpisodes from '../components/main/LatestEpisodes';
import QuickGenres from '../components/main/QuickGenres';
import TelegramBanner from '../components/main/TelegramBanner';
import { mediaService } from '@/services/MediaService';
// export const revalidate = 30;
export const revalidate = 3600; // الموقع هيحدث نفسه تلقائياً كل ساعة لو فيه تحديثات جديدة


export const metadata = constructMetadata({
  title: 'مشاهدة أحدث الأفلام والمسلسلات أون لاين بجودة عالية | ايجي بيراميد - EGY PYRAMID',
  description:
    'تصفح أحدث الأفلام والمسلسلات والحلقات المضافة يومياً. محتوى متنوع بجودة عرض عالية وتجربة مشاهدة سلسة.',
  path: '/',
});

export default async function Home() {
  // استدعاء واحد فقط، كل التعقيد اختفى!
  const [movies, series, topRated, episodes, spotlightResult, genres] = await mediaService.getHomeData();

  const spotlight = spotlightResult.data || movies.data?.[0] || null;


  // تصفية الحلقات المتكررة للمسلسل الواحد في الرئيسية
  const uniqueEpisodes = [];
  const seenMediaIds = new Set();
  if (episodes.data) {
    for (const ep of episodes.data) {
      if (!seenMediaIds.has(ep.media_id)) {
        seenMediaIds.add(ep.media_id);
        uniqueEpisodes.push(ep);
      }
      if (uniqueEpisodes.length >= 8) break; // اعرض مثلاً أحدث 8 مسلسلات مختلفة
    }
  }


  return (
    <>

      <h1 className="sr-only">ايجي بيراميد - EGY PYRAMID</h1>
        <HeroSpotlight spotlight={spotlight} />

        <div className=" max-w-350 mx-auto  space-y-fluid-section">
          <QuickGenres genres={genres.data || []} />

          {/* نبعت الـ data مباشرة للسكاشن */}
          <TopRatedSection topRated={topRated} />
          <MoviesGrid movies={movies} />
          <SeriesGrid series={series} />

          <TelegramBanner />

          {/* التركة 3: نبعت الداتا مصفاة للـ LatestEpisodes */}
          <LatestEpisodes episodes={uniqueEpisodes} />

        </div>
    </>
  );
}