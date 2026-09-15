import { mediaService } from "@/services/MediaService";

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://egypyramid.vercel.app";

const [data, genres] = await Promise.all([
    mediaService.getSitemapData(5000), // أضف هذا السطر هنا
    mediaService.getAllGenres(),
  ]);

  const { medias, episodes } = data;

  // 1. روابط الأفلام والمسلسلات
  const mediaUrls = medias.map((item) => ({
    url: `${baseUrl}/${item.category || "movie"}/${item.slug}`,
    lastModified: new Date(item.updated_at),
    priority: 0.9,
  }));

  // 2. روابط الحلقات
  const episodeUrls = episodes.flatMap((ep) => {
    if (!ep.medias || ep.medias.category === "movie") return [];

    const sNum = ep.seasons?.season_number || 1;
    return [
      {
        url: `${baseUrl}/${ep.medias.category || "tv"}/${ep.medias.slug}/season/${sNum}/episode/${ep.episode_number}`,
        lastModified: new Date(ep.updated_at),
        priority: 0.8,
      },
    ];
  });

// 3. روابط التصنيفات (استخدام البيانات النظيفة من السيرفس)
    const genreUrls = genres.map((g) => ({
        url: `${baseUrl}/genre/${encodeURIComponent(g.slug)}`,
        lastModified: new Date(), 
        priority: 0.5
    }));

  const staticUrls = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/movie`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/tv`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/genre`, lastModified: new Date(), priority: 0.6 },
  ];

  return [...staticUrls, ...mediaUrls, ...episodeUrls, ...genreUrls];
}
