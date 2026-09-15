// src/components/download/DownloadCard.js
import { Download, ShieldCheck, Zap } from 'lucide-react';
import { optimizeCloudinary } from '@/lib/helpers'; // ✅ استيراد الدالة اللي عملناها
import Image from 'next/image'; // ✅ استخدام Image لسرعة التحميل

export default function DownloadCard({ mediaTitle, subTitle, posterUrl }) {
    return (
        <section className="glass-card p-fuluid-p md:p-10 rounded-[3rem] shadow-2xl border border-white/5 animate-fadeInUp overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-(--accent)/10 blur-[80px] -z-10" />

            <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* 1. البوستر: تعديل المقاس لـ 300px وإضافة fetchPriority */}
                <div className="relative shrink-0 w-40 h-56 rounded-4xl overflow-hidden shadow-2xl border-4 border-white/5 bg-slate-800">
                    <Image
                        src={optimizeCloudinary(posterUrl, 300)}
                        alt={mediaTitle}
                        fill
                        unoptimized
                        priority={true} // ✅ لأنها LCP في الصفحة دي
                        fetchPriority="high" // 🚀 حل مشكلة الـ Discovery
                        className="object-cover"
                    />
                </div>

                <div className="flex-1 text-center md:text-right space-y-4">
                    <div className="space-y-1">
                        {/* 2. التباين: تغميق اللون الأخضر ليتخطى فحص الـ Accessibility */}
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 text-[12px] font-black uppercase tracking-widest rounded-full border border-emerald-300 dark:border-emerald-500/20 inline-flex items-center gap-2">
                            <ShieldCheck size={12} /> رابط فحص آمن
                        </span>


                        <h1 className="text-2xl md:text-4xl font-black text-(--foreground) tracking-tighter">
                            تحميل {mediaTitle}
                        </h1>

                        {/* 3. التباين: إزالة الـ opacity من النص الـ Accent ليكون مقروءاً */}
                        <p className="text-yellow-700 font-bold text-sm uppercase tracking-widest">
                            {subTitle}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold opacity-70"> {/* رفعنا الـ opacity شوية */}
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Zap size={14} className="text-amber-500" /> روابط مباشرة
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Download size={14} className="text-amber-500" /> يدعم الاستكمال
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
