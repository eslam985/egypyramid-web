"use client";
import Link from "next/link";
import { Download } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import ServerList from "./ServerList";

import { useState, useMemo } from "react";
export default function WatchContainer({
  links,
  mediaTitle,
  subTitle,
  category,
  slug,
  episodeNumber,
  isCinemaMode,
  toggleCinema,
  season,
}) {
  const sortedLinks = useMemo(() => {
    if (!links) return [];
    const forbidden = ["archive", "telegram_direct", "download", "direct"];

    // ✅ التعديل هنا: حط السيرفرات اللي عايزها تظهر الأول في بداية المصفوفة
    // والـ vk و ok في الآخر عشان ميكنونش هم الـ default لو مش شغالين كويس
    const priority = [
      "vk",
      "ok",
      "streamtape",
      "mixdrop",
      "voe",
      "vidtube",
      "lulustream",
      "doodstream",
    ];
    return [...links]
      .filter((link) => !forbidden.includes(link.server_name.toLowerCase()))
      .sort((a, b) => {
        const indexA = priority.indexOf(a.server_name.toLowerCase());
        const indexB = priority.indexOf(b.server_name.toLowerCase());
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  }, [links]);

  // 1. نبدأ بـ States فاضية عشان نضمن الترتيب
  // ابدأ بأول سيرفر في المصفوفة المرتبة فوراً (بدون useEffect)
  const [activeVideoUrl, setActiveVideoUrl] = useState(
    sortedLinks[0]?.url || "",
  );
  const [activeServerId, setActiveServerId] = useState(
    sortedLinks[0]?.id || null,
  );
  // دالة التغيير اليدوي (لما الزائر يدوس بنفسه)
  const handleServerChange = (url, id) => {
    setActiveVideoUrl(url);
    setActiveServerId(id);
  };

  return (
    // ✅ شيلنا overflow-hidden من هنا — كان بيخلي الـ iframe يتقطع
    // وبيسبب ظهور RelatedSidebar فوقه على الموبايل
    // w-full + min-w-0 كافيين لمنع التمدد الأفقي
    <div className="w-full min-w-0 grid lg:grid-cols-10 gap-6 items-start">
      {/* قائمة السيرفرات */}
      <div
        className={`lg:col-span-2 min-w-0 order-2 lg:order-1 duration-500 ${
          isCinemaMode ? "opacity-10 pointer-events-none" : ""
        }`}
      >
        <ServerList
          links={sortedLinks}
          activeServer={activeServerId}
          onServerChange={handleServerChange}
        />
      </div>

      {/* المشغل والمعلومات */}
      <div className="lg:col-span-8 min-w-0 order-1 lg:order-2 space-y-6">
        {/* معلومات العمل */}
        <div
          className={`p-6 bg-(--background) rounded-[2.5rem] border border-white/5 shadow-2xl duration-500 ${
            isCinemaMode
              ? "opacity-0 pointer-events-none scale-95 h-0 overflow-hidden p-0 m-0"
              : "opacity-100"
          }`}
        >
          <h1 className="text-sm md:text-3xl font-black text-(--foreground) tracking-tight">
            {mediaTitle}
          </h1>
          <p className="text-amber-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-widest mt-2">
            {subTitle}
          </p>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
            <Link
              prefetch={false}
              href={
                category === "movie"
                  ? `/${category}/${slug}/download/1`
                  : `/${category}/${slug}/season/${season}/download/${episodeNumber || 1}`
              }
              className="px-6 py-3 glass-card text-(--foreground) rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-(--accent) hover:text-slate-950 no-underline"
            >
              <Download size={16} /> سيرفرات التحميل
            </Link>
          </div>
        </div>

        <VideoPlayer
          videoUrl={activeVideoUrl}
          isCinemaMode={isCinemaMode}
          toggleCinema={toggleCinema}
        />
      </div>
    </div>
  );
}
