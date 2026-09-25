// src/components/watch/EpisodeSelector.js
import Link from 'next/link';
import { Download, ChevronLeft, ChevronRight, List } from 'lucide-react';

export default function EpisodeSelector({
    epData,
    allEpisodes,
    category,
    encodedSlug,
    season, // 👈 أضفنا ده هنا
    firstGenre,
    firstLabel,
    isCinemaMode
}) {

    const currentEpNum = epData?.episode_number;
    const prevEp = allEpisodes?.find(e => e.episode_number === currentEpNum - 1);
    const nextEp = allEpisodes?.find(e => e.episode_number === currentEpNum + 1);

    return (
        <div className={`flex flex-col gap-4 duration-500 ${isCinemaMode ? 'opacity-0 invisible pointer-events-none' : 'opacity-100'
            }`}>

            {/* أزرار التنقل */}
            {category === 'tv' && (prevEp || nextEp) && (
                <div className="flex gap-2">
                    {prevEp && (
                        <Link
                        prefetch={false}
                            href={`/${category}/${encodedSlug}/season/${season}/episode/${prevEp.episode_number}`}
                            className="flex-1 py-3 bg-white/5 border border-white/5 text-[var(--foreground)] rounded-2xl text-center no-underline text-[10px] font-black flex items-center justify-center gap-1 lg:hover:bg-white/10"
                        >
                            <ChevronRight size={14} /> السابق
                        </Link>
                    )}
                    {nextEp && (
                        <Link
                        prefetch={false}
                            href={`/${category}/${encodedSlug}/season/${season}/episode/${nextEp.episode_number}`}

                            className="flex-1 py-3 bg-[var(--accent)] text-[var(--background)] rounded-2xl text-center no-underline text-[10px] font-black flex items-center justify-center gap-1 lg:hover:scale-[1.02] shadow-lg shadow-[var(--accent)]/10"
                        >
                            التالي <ChevronLeft size={14} />
                        </Link>
                    )}
                </div>
            )}

            {/* قائمة الحلقات */}
            {category === 'tv' && allEpisodes?.length > 1 && (
                <section className="glass-card p-4  rounded-4xl shadow-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black text-(--foreground) flex items-center gap-2 opacity-70">
                            <List size={14} className="text-(--accent)" /> قائمة الحلقات
                        </h2>
                        <span className="text-[12px] font-bold  uppercase">{allEpisodes.length} EP</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 max-h-100 overflow-y-auto pr-2">
                        {allEpisodes.map((ep) => (
                            <Link
                            prefetch={false}
                                key={ep.id}
                                href={`/${category}/${encodedSlug}/season/${season}/episode/${ep.episode_number}`}
                                className={`aspect-square  rounded-xl border flex flex-col items-center justify-center no-underline relative ${currentEpNum === ep.episode_number
                                    ? 'bg-(--accent) border-(--accent)/70  shadow-md'
                                    : 'bg-white/5 border-white/5 lg:hover:border-(--accent)/40 lg:hover:bg-white/10'
                                    }`}
                            >
                                <span className={`text-[12px] font-black ${currentEpNum === ep.episode_number
                                    ? 'text-black/70 dark:text-white'
                                    : 'text-(--foreground)'
                                    }`}>
                                    {ep.episode_number}
                                </span>
                                {currentEpNum === ep.episode_number && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-(var(--background))  rounded-full border-2 border-[var(--accent)]" />
                                )}
                            </Link>
                        ))}
                    </div>

                    <br />

                    {/* كارت المعلومات */}
                    <div className="p-4 bg-[var(--card-bg)] rounded-3xl border border-white/5 shadow-xl group">
                        <h3 className="text-sm md:text-base font-black text-[var(--foreground)] line-clamp-1 mb-1 group-hover:text-[var(--accent)] transition-colors">
                            {epData?.medias?.title}
                        </h3>

                        <div className="flex items-center justify-between">
                            <span className="text-yellow-800 dark:text-yellow-400 text-[9px] font-black uppercase tracking-widest opacity-90">
                                {category === 'movie'
                                    ? (firstGenre?.name || firstLabel || 'Movie')
                                    : `Episode ${currentEpNum}`}
                            </span>
                            {/* ✅ الإصلاح: أضفنا رقم الحلقة للرابط
                                القديم: /download       → 404 لأن المسار غير موجود
                                الجديد: /download/[ep]  → المسار الصح */}
                            <Link
                            prefetch={false}
                                href={
                                    category === 'movie'
                                        ? `/${category}/${encodedSlug}/download/1`
                                        : `/${category}/${encodedSlug}/season/${season}/download/${currentEpNum || 1}`
                                }
                                aria-label={`تحميل ${epData?.medias?.title || 'الحلقة'} بجودة عالية`}
                                className="p-2 bg-(--accent) text-black/70! rounded-xl lg:hover:scale-110 shadow-lg shadow-(--accent)/20 flex items-center justify-center pointer"
                            >
                                <Download size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}