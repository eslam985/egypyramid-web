// /media/es/DDrive/projects/web-Next/egypyramid-web/src/app/[category]/[slug]/season/[season]/download/[episode]/page.js

// 1. تعديل مسارات الـ Import (زودنا ../ لأننا دخلنا مجلد أعمق)
// استخدام @ يضمن الوصول للمسار الصحيح بغض النظر عن عمق المجلد
import { cache } from "react";
import { mediaService } from "@/services/MediaService";
import DownloadCard from "@/components/download/DownloadCard";
import ServerDownloader from "@/components/download/ServerDownloader";
import { constructMetadata } from "@/lib/seo";

export const revalidate = 3600;

// نظام الـ Cache لعدم تكرار الطلب في الميتا داتا وجسم الصفحة
const getEpisodeData = cache(async (mediaId, season, episode) => {
  return await mediaService.getSpecificEpisode(mediaId, season, episode);
});

export async function generateMetadata({ params }) {
  const { category, slug: encodedSlug, episode, season } = await params; // أضفنا season
  const decodedSlug = decodeURIComponent(encodedSlug);
  // 👈 السطر الجديد لاستخراج الـ ID
  // 2) fix bug - src/app/[category]/[slug]/download/[episode]/page.js
  const mediaId = parseInt(decodedSlug.split("-")[0], 10); // بدل split('-') مباشرة
  if (Number.isNaN(mediaId)) {
    return constructMetadata({ title: "تحميل مباشر 4K", noIndex: true });
  }
  const { data: epData } = await getEpisodeData(mediaId, season, episode);
  if (!epData)
    return constructMetadata({
      title: "تحميل مباشر",
      noIndex: true,
      path: `/${category}/${encodedSlug}/download/${episode}`,
    });

  const mediaTitle = epData.medias.title;

  // عنوان يستهدف الباحث عن التحميل
  const dynamicTitle = `مشاهدة  ${mediaTitle} اون لاين مجانا | ايجي بيراميد - EGY PYRAMID`;

  return constructMetadata({
    title: dynamicTitle,
    description: `روابط تحميل مباشرة وسريعة لـ ${mediaTitle}. شاهد وحمل بجودة عالية على EGY PYRAMID. ${epData.medias.story?.slice(0, 100)}`,
    image: epData.medias.poster_url,
    path: `/${category}/${encodedSlug}/season/${season}/episode/${episode}/download`, // 👈 تعديل المسار ليعكس المجلد الجديد
    type: "video.other",
    rating: epData.medias.rating,
    duration: epData.medias.runtime,
    videoDuration: epData.medias.duration_iso,
    noIndex: true, // مهم جداً عشان صفحات التحميل ما تظهرش في نتائج البحث
  });
}
export default async function DownloadPage({ params }) {
  // 2. جلب البيانات من params (رقم الحلقة بقى متاح هنا مباشرة باسم episode)
  const { category, slug: encodedSlug, episode, season } = await params; // أضفنا season
  const decodedSlug = decodeURIComponent(encodedSlug);
  // 👈 السطر الجديد لاستخراج الـ ID
  const mediaId = decodedSlug.split("-")[0];

  // استدعاء البيانات من الـ Cache مباشرة
  const { data: epData, error } = await getEpisodeData(
    mediaId,
    season,
    parseInt(episode),
  );

  if (error || !epData) {
    console.error("Supabase Error Details:", error?.message, error?.details); // 👈 مكانه الصحيح هنا
    return (
      <div className="p-20 text-center">
        عذراً، لم يتم العثور على روابط تحميل لهذه الحلقة.
      </div>
    );
  }
  // 5. فلترة الروابط
  // 5. فلترة الروابط: هنسمح بظهور السيرفرات اللي بتدعم التحميل + استبعاد سيرفرات المشاهدة البحتة
  // 5. فلترة الروابط: منع التكرار والسيرفرات غير المرغوبة
  // 1. القائمة المسموحة والممنوعة
  const forbiddenForDownload = [
    "vidsrc",
    "embed",
    "player",
    "archive",
    "telegram_direct",
    "telegram_direct_p1",
    "telegram_direct_p2",
    "telegram_direct_p3",
    "telegram_direct_p4",
  ];
  // 1. القائمة المسموحة (شاملة أي جزء )
  const supportedList = [
    "vidtube",
    "voe",
    "lulustream",
    "doodstream",
    "streamtape",
    "mixdrop",
  ];

  // 2. الترتيب (لاحظ وضعنا الأجزاء في البداية)
  const downloadPriority = [
    "mixdrop",
    "streamtape",
    "voe",
    "vidtube",
    "lulustream",
    "doodstream",
  ];
  const seenUrls = new Set();
  const downloadLinks = epData.links
    ?.filter((link) => {
      const name = link.server_name.toLowerCase();
      const url = link.url.trim();

      const isSupported = supportedList.some((s) => name.includes(s));
      if (seenUrls.has(url)) return false;

      if (isSupported && !forbiddenForDownload.includes(name)) {
        seenUrls.add(url);
        return true;
      }
      return false;
    })
    // 3. إضافة الترتيب الذكي هنا
    .sort((a, b) => {
      const indexA = downloadPriority.indexOf(a.server_name.toLowerCase());
      const indexB = downloadPriority.indexOf(b.server_name.toLowerCase());

      // لو السيرفر مش في القائمة ياخد رقم كبير عشان ينزل تحت
      const priorityA = indexA === -1 ? 99 : indexA;
      const priorityB = indexB === -1 ? 99 : indexB;

      return priorityA - priorityB;
    });
  return (
    <main className="max-w-350 mx-auto min-h-screen bg-(--background) py-fluid-section transition-colors duration-500">
      <div className=" px-fluid-p space-y-fluid-gap">
        {/* 2. كارت التحميل الأساسي */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <DownloadCard
            mediaTitle={epData.medias.title}
            posterUrl={epData.medias.poster_url}
            subTitle={
              category === "movie"
                ? "تحميل الفيلم بجودة عالية"
                : `تحميل الحلقة ${epData.episode_number}`
            }
          />
        </div>

        {/* 3. قائمة السيرفرات: استخدام الـ Glass Look */}
        <div
          className="max-w-6xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {downloadLinks?.length > 0 ? (
            <ServerDownloader links={downloadLinks} />
          ) : (
            <div className="glass-card p-12 text-center border-dashed border-(--foreground)/10">
              {/* استخدام text-fluid-p للرسالة التحذيرية */}
              <p className="text-fluid-p text-(--foreground)/40 font-black uppercase tracking-widest">
                لا توجد روابط تحميل متاحة حالياً
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
