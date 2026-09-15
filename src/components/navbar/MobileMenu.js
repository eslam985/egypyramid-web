// src/components/navbar/MobileMenu.js
'use client';

import Link from 'next/link';
import { Search, Sparkles, ChevronDown } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';

export default function MobileMenu({ isOpen, onClose, genres }) { // شيلنا query و setQuery

    const { query, setQuery, results, loading, goToSearchPage } = useSearch();


    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop: z-index أعلى من كل محتوى الصفحة */}
            <div
                // ✅ z-[9999] يضمن الظهور فوق iframe وServerList وRelatedSidebar
                className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
                style={{ zIndex: 9999 }}
                onClick={onClose}
            />

            {/* السايد بار: z-index أعلى من الـ Backdrop */}
            <div
                className="fixed top-0 right-0 h-screen w-[75%] max-w-75 bg-(--background) text-(--foreground) border-l border-slate-200/10 shadow-2xl md:hidden flex flex-col transition-colors duration-300 animate-in slide-in-from-right"
                // ✅ z-[10000] فوق الـ Backdrop بخطوة واحدة
                style={{ zIndex: 10000 }}
            >
                {/* رأس القائمة */}
                <div className="flex-none">
                    <Link
                        prefetch={false}
                        href="/"
                        aria-label="EGY PYRAMID"
                        className="group flex items-center justify-end pl-4  pt-1 no-underline transition-all duration-300 active:scale-95"
                    >
                        {/* إضافة gap-1 لضبط المسافة بين النص والـ Badge بدقة */}
                        <h1 className="flex items-center  flex-row-reverse gap-1.5 font-black tracking-tighter text-2xl select-none antialiased">

                            {/* EGY Badge: تحسين الأنيميشن والظل */}
                            <span className="bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded-sm text-[10px] font-black shadow-sm group-hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] group-hover:-translate-y-1.5 transition-all duration-500 ease-out uppercase leading-none">
                                EGY
                            </span>

                            {/* PYRAMID Text: إضافة لمعة خفيفة (Optional) */}
                            <span className="relative bg-linear-to-r from-yellow-600 via-yellow-400 to-yellow-600 dark:from-yellow-400 dark:via-yellow-200 dark:to-yellow-500 bg-clip-text text-transparent transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(202,138,4,0.3)]">
                                PYRAMID
                            </span>

                        </h1>
                    </Link>
                </div>

                {/* جسم القائمة */}
                <div className="flex-1 overflow-y-auto px-1 pt-2 space-y-8 pb-10">

                    {/* شريط البحث الذكي المطور */}
                    <div className="relative group mb-2">
                        <form onSubmit={(e) => goToSearchPage(e, onClose)}>
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ابحث عن فيلم أو مسلسل..."
                                className="w-full bg-(--card-bg) border border-slate-200/10 rounded-2xl py-3 px-4 pl-12 outline-none focus:ring-2 focus:ring-(--accent)/20 focus:border-(--accent) text-sm text-(--foreground) transition-all shadow-sm"
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Search size={18} />
                            </button>
                        </form>

                        {/* ✅ قائمة الاقتراحات الاحترافية (تشبه الديسكتوب) */}
                        {query && (results.length > 0 || loading) && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-87.5 overflow-y-auto custom-scrollbar">
                                    {loading ? (
                                        <div className="p-4 text-center text-xs text-slate-500 font-bold animate-pulse">جاري البحث...</div>
                                    ) : (
                                        results.map(item => (
                                            <Link
                                                key={item.id}
                                                href={`/${item.category === 'tv' ? 'tv' : 'movie'}/${item.slug}`}
                                                prefetch={false}
                                                onClick={onClose}
                                                className="flex items-center gap-4 p-3 hover:bg-(--accent)/10 border-b border-slate-100 dark:border-white/5 last:border-0 no-underline transition-colors"
                                            >
                                                {/* بوستر صغير محسّن */}
                                                <div className="relative w-10 h-14 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-sm">
                                                    <img
                                                        src={item.poster_url}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                    />
                                                </div>

                                                {/* معلومات الفيلم */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-xs font-black text-slate-800 dark:text-white truncate">
                                                        {item.title}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-bold">
                                                            {item.year}
                                                        </span>
                                                        <span className="text-[9px] text-(--accent) font-black uppercase tracking-tighter">
                                                            {item.category === 'tv' ? 'مسلسل' : 'فيلم'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>

                                {/* زر عرض الكل لجعلها مطابقة تماماً للديسكتوب */}
                                <button
                                    onClick={(e) => goToSearchPage(e, onClose)}
                                    className="w-full py-3 bg-slate-50 dark:bg-white/5 text-[10px] font-black text-(--accent) border-t border-slate-100 dark:border-white/5 active:bg-(--accent) active:text-white transition-all"
                                >
                                    عرض كل النتائج
                                </button>
                            </div>
                        )}
                    </div>



                    {/* الروابط الأساسية */}
                    <div className="flex flex-col gap-2 mb-3">
                        <Link
                            href="/"
                            prefetch={false}
                            onClick={onClose}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-(--card-bg) border border-slate-200/10 text-(--foreground) font-bold no-underline hover:bg-(--accent)/5 transition-all shadow-sm"
                        >
                            <span className="w-1.5 h-6 bg-(--accent) rounded-full"></span>
                            الرئيسية
                        </Link>

                        <Link
                            href="/genre/ramadan-2026"
                            prefetch={false}
                            onClick={onClose}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-(--accent)/10 border border-(--accent)/20 text-(--accent) font-black no-underline shadow-sm relative overflow-hidden group"
                        >
                            <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></span>
                            <Sparkles size={20} />
                            رمضان 2026
                        </Link>
                    </div>

                    {/* قسم التصنيفات */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black px-2 flex items-center justify-between">
                            تصفح التصنيفات
                            <ChevronDown size={12} />
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                            {genres?.map((genre) => (
                                <Link
                                    key={genre.id}
                                    href={`/genre/${genre.slug}`}
                                    prefetch={false}
                                    onClick={onClose}
                                    className="p-2 bg-(--card-bg) border border-slate-200/10 rounded-xl text-center text-xs font-bold text-(--foreground)] opacity-80 hover:opacity-100 hover:border-(--accent)/50 hover:text-(--accent) transition-all shadow-sm active:scale-95"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}