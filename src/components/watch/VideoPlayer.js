// /media/es/DDrive/projects/web-Next/egypyramid-web/src/components/watch/VideoPlayer.js
'use client';
import { useState, useEffect } from 'react';

import { Play, Lightbulb, LightbulbOff } from 'lucide-react';

export default function VideoPlayer({ videoUrl, posterUrl, isCinemaMode, toggleCinema }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
    }, [videoUrl]);
    // 1. تأمين الرابط (أضف هذا السطر فوق)
    const safeVideoUrl = videoUrl?.startsWith('https://') ? videoUrl : '';
    // 3. تحديث الـ Referrer Policy (بعض السيرفرات تطلب معرفة المصدر للعمل)
    const refPolicy = "strict-origin-when-cross-origin";
    return (
        // ✅ شيلنا isCinemaMode overlay من هنا — CinemaPortal في WatchPageClient بيتكفل بيه
        // VideoPlayer مسؤوليته المشغل فقط
        <section className="relative space-y-4 animate-fade-in-up">

            {/* الأزرار العلوية */}
            <div className="flex justify-between items-center mb-2 px-2">
                <div className="flex gap-2"></div>
                <button
                    onClick={toggleCinema}
                    className={`group relative py-2 px-4 rounded-xl border  transition-all flex items-center gap-2 text-[12px] font-black uppercase tracking-tighter ${isCinemaMode
                        ? 'bg-(--background) text-(--accent) border-white/20 opacity-100 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                        : 'glass-card text-(--foreground)/80 t-slate-200 hover:text-(--accent) border-white/10 ' // رفعنا الـ opacity واللون
                        }`}
                >

                    {isCinemaMode ? <LightbulbOff size={14} className="animate-pulse" /> : <Lightbulb size={14} />}
                    <span>{isCinemaMode ? 'إغلاق السينما' : 'وضع السينما'}</span>
                </button>
            </div>

            {/* المشغل */}
            <div className={`relative aspect-video bg-black rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-700 ease-out ${isCinemaMode
                ? 'ring-8 ring-(--accent)/10 border-(--accent)/30 scale-[1.02] md:scale-110  md:mt-10'
                : 'border-(--accent)/30'
                }`}>

                {/* ✅ صورة البوستر كـ Placeholder خلف المشغل */}
                {!isCinemaMode && posterUrl && (
                    <div className="absolute inset-0 z-0 opacity-40 blur-sm">
                        <img
                            src={posterUrl}
                            alt="poster"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                    </div>
                )}
                {isLoading && videoUrl && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
                        <div className="w-10 h-10 border-4 border-(--accent)/20 border-t-(--accent) rounded-full animate-spin" />
                    </div>
                )}

                {videoUrl ? (
                    <div className="relative z-10 w-full h-full">
                        <iframe
                            src={safeVideoUrl} // استخدام الرابط المؤمن
                            onLoad={() => setIsLoading(false)}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy={refPolicy} // منع تسريب بيانات  موقعك للسيرفر
                            scrolling="no"
                            title="EGY PYRAMID Player"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 gap-6 backdrop-blur-xl">
                        <div className="relative group">
                            <div className="absolThis content is blocked. Contact the site owner to fix the issue.ute inset-0 bg-(--accent) blur-3xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
                            <Play size={70} className="relative text-(--accent) fill-(--accent) drop-shadow-2xl" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-white font-black tracking-[0.3em] text-[12px] uppercase animate-pulse">
                                جاري تحضير السيرفر
                            </span>
                            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-(--accent) animate-shimmer" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-(--accent)/5 to-transparent pointer-events-none" />
            </div>
        </section>
    );
}