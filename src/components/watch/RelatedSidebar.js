// src/components/watch/RelatedSidebar.js
'use client';
import Link from 'next/link';
import { Star, ChevronLeft } from 'lucide-react';
import { optimizeCloudinary } from '@/lib/helpers';

export default function RelatedSidebar({ related, title }) {
    if (!related || related.length === 0) return null;

    return (
        <section className="glass-card p-5 md:p-6 rounded-[2rem] shadow-2xl border border-white/5 space-y-5 animate-fade-in-up w-full max-w-full min-w-0 overflow-hidden">

            <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-[var(--foreground)] opacity-50 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-[var(--accent)] rounded-full"></span>
                    {title}
                </h2>
                <ChevronLeft size={14} className="text-white/20 md:hidden animate-pulse" />
            </div>

            <div className="flex flex-row overflow-x-auto gap-4 no-scrollbar md:flex-col md:overflow-visible pb-2 touch-pan-x snap-x snap-mandatory">
                {related.map((item) => (
                    <Link
                    prefetch={false}
                        key={item.id}
                        href={`/${item.category || 'movie'}/${item.slug}/watch`}
                        className="group flex flex-col shrink-0 w-[130px] gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 md:flex-row md:w-full md:bg-transparent md:border-transparent md:hover:border-white/5 snap-start"
                    >
                        <div className="relative shrink-0 w-full aspect-[2/3] md:w-14 md:h-[72px] rounded-xl overflow-hidden shadow-lg border border-white/5">
                            <img
                                // نبعت 120 بكسل عرض بس للـ Sidebar
                                src={optimizeCloudinary(item.poster_url, 80)}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt={item.title}
                                loading="lazy"
                                // نصيحة: ضيف دول عشان المتصفح يعرف المقاس قبل التحميل
                                width={56}
                                height={84}
                            />
                        </div>

                        <div className="flex flex-col justify-center min-w-0 px-1 md:px-0">
                            <h3 className="text-[11px] font-black text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors leading-tight mb-1">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2 opacity-80">
                                <Star size={10} className="fill-[var(--accent)] text-[var(--accent)]" />
                                <span className="text-[9px] font-bold text-slate-800 dark:text-slate-300">{item.rating || '8.2'}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}