// /media/es/DDrive/projects/web-Next.js/src/components/download/ServerDownloader.js
'use client';
import { useState, useEffect } from 'react';
import { ExternalLink, ArrowDownToLine, Clock, CheckCircle } from 'lucide-react';

export default function ServerDownloader({ links }) {
    const [countdown, setCountdown] = useState(5);
    const isReady = countdown === 0;

    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [countdown]);

    if (!links || links.length === 0) return null;

    const transformToDownloadLink = (url) => {
        if (!url) return url;
        // 1. Archive.org (تحويل الـ Embed أو الـ Details لرابط تحميل)
        if (url.includes('archive.org')) {
            // لو الرابط فيه embed أو details حولهم لـ download
            return url.replace('/embed/', '/download/').replace('/details/', '/download/');
        }


        // 2. VOE (تحويل Embed أو رابط عادي إلى Download)
        if (url.includes('voe.sx')) {
            if (url.includes('/e/')) return url.replace('/e/', '/') + '/download';
            return url.endsWith('/download') ? url : `${url.split('?')[0]}/download`;
        }

        // 3. Lulustream (تغيير /e/ إلى /d/)
        if (url.includes('lulustream.com')) {
            return url.replace('/e/', '/d/');
        }

        // 4. Mixdrop (تحويل /e/ إلى /f/ وإضافة ?download)
        if (url.includes('mixdrop')) {
            let cleanUrl = url.replace('/e/', '/f/').split('?')[0];
            return `${cleanUrl}?download`;
        }

        // 5. Myvidplay (تحويل /e/ إلى /d/ وإضافة الهاش) doodstream
        if (url.includes('myvidplay.com') || url.includes('playmogo.com')) {
            let cleanUrl = url.replace('/e/', '/d/');
            return cleanUrl.includes('#download_now') ? cleanUrl : `${cleanUrl}#download_now`;
        }

        // 6. Streamtape (تغيير /e/ إلى /v/ ليظهر زر التحميل)
        if (url.includes('streamtape.com')) {
            return url.replace('/e/', '/v/');
        }

        // 7. سيرفرك الخاص (Hugging Face) - إضافة d=true
        if (url.includes('hf.space')) {
            return url.includes('d=true') ? url : `${url}${url.includes('?') ? '&' : '?'}d=true`;
        }
        // 8. Vidtube (النمط الذكي: تحويل الرابط لداونلود مباشر بلاحقة _h)
        // 8. Vidtube (النمط الذكي - النسخة الصحيحة)
        if (url.includes('vidtube.one')) {
            // بناخد الجزء الأخير من الرابط وننظفه
            let vidId = url.split('/').pop().replace('embed-', '').replace('.html', '');

            // التعديل هنا: أضفنا $ قبل القوس و / قبل الكلمة
            return `https://vidtube.one/d/${vidId}_h`;
        }


        return url;
    };



    const getSafeLink = (url) => {
        if (!url || typeof url !== 'string') return '#';
        // التأكد إن الرابط بيبدأ ببروتوكول آمن
        const isSafe = url.startsWith('http://') || url.startsWith('https://');
        return isSafe ? transformToDownloadLink(url) : '#';
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* هيدر ذكي يظهر حالة التجهيز */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-fuluid-h3 font-black flex items-center gap-3 text-[var(--foreground)] uppercase tracking-tighter">
                    <ArrowDownToLine className="text-[var(--accent)]" size={20} />
                    روابط التحميل المتاحة
                </h2>
                {!isReady && (
                    <div className="flex items-center gap-2 text-amber-800 dark:text-[var(--accent)] font-black text-[12px] uppercase bg-amber-100 dark:bg-[var(--accent)]/10 px-3 py-1 rounded-full border border-amber-200 dark:border-[var(--accent)]/20 shadow-sm">
                        <Clock size={14} className="animate-pulse text-amber-700 dark:text-[var(--accent)]" />
                        <span>جاري تجهيز الروابط: {countdown}ث</span>
                    </div>

                )}
            </div>

            <div className="grid gap-fluid-gap  md:grid-cols-2">
                {links.map((link) => (
                    <div
                        key={link.id}
                        className={`group relative flex items-center justify-between p-fluid-p bg-[var(--card-bg)] rounded-[2.5rem] border duration-500 overflow-hidden ${isReady ? 'border-white/5 lg:hover:border-[var(--accent)]/40 lg:hover:bg-white/5' : 'border-white/5 opacity-80'
                            }`}
                    >
                        <div className="flex items-center gap-4 z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center duration-500 ${isReady ? 'bg-[var(--accent)]/10 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--background)]' : 'bg-white/5 text-slate-500'
                                }`}>
                                {isReady ? <CheckCircle size={20} /> : <ExternalLink size={20} />}
                            </div>
                            <div>
                                <h3 className="font-black text-xs md:text-sm uppercase tracking-tight">
                                    {(() => {
                                        // لو السيرفر تليجرام وفيه رقم جزء (P1, P2...)
                                        if (link.server_name.toLowerCase().includes('telegram_direct')) {
                                            const partMatch = link.server_name.match(/p(\d+)/i);
                                            return partMatch
                                                ? `تحميل تليجرام - الجزء ${partMatch[1]}`
                                                : "تحميل تليجرام (رابط مباشر)";
                                        }
                                        // لو أي سيرفر تاني اعرض الاسم زي ما هو
                                        return link.server_name;
                                    })()}
                                </h3>
                                <p className="text-[6px] font-bold opacity-80 uppercase tracking-[0.2em] mt-1">يدعم الاستكمال المباشر</p>
                            </div>
                        </div>

                        <div className="z-10">
                            {isReady ? (
                                // السطر القديم: href={link.url}
                                // السطر الجديد:
                                <a
                                    href={getSafeLink(link.url)} // هنا بنشغل الدالة عشان تحول الرابط
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3.5 bg-(--accent) text-black/70! rounded-2xl font-black text-[10px] uppercase no-underline lg:hover:scale-105 active:scale-95 shadow-xl shadow-(--accent)/20"
                                >
                                    تحميل الآن
                                </a>

                            ) : (
                                <div className="w-24 h-10 bg-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                                    <div className="w-full h-1 bg-white/10 rounded-full mx-4 overflow-hidden">
                                        <div
                                            className="h-full bg-(--accent) duration-1000"
                                            style={{ width: `${(5 - countdown) * 20}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
