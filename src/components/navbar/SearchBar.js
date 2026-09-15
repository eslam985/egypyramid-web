// /media/es/DDrive/projects/web-Next/egypyramid-web/src/components/navbar/SearchBar.js
'use client';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useSearch } from '../../hooks/useSearch';
import Image from 'next/image'; // ✅ الاستيراد المفقود
export default function SearchBar() {
    // 🚀 استدعاء كل شيء جاهز من الـ Hook المطور
    const { query, setQuery, results, loading, goToSearchPage } = useSearch();

    return (
        <div className="relative flex-1 max-w-md group">
            {/* الـ Input مع Glow Effect متكيف */}
            <form
                onSubmit={(e) => goToSearchPage(e)}
                className="relative flex-1 max-w-md group"
            >
                <input
                    type="search" // تغيير لـ search
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن فيلم أو مسلسل..."
                    className="w-full bg-slate-200/5 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-full py-2.5 pl-2 pr-5 outline-none focus:ring-4 focus:ring-yellow-500/10 dark:focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white dark:focus:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-500 transition-all duration-300 shadow-sm"
                />

                {/* الأيقونة بتتغير لونها ذكياً */}
                <Search
                    size={18}
                    className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors duration-300"
                />

                {/* نتائج البحث السريع (The Result Dropdown) */}
                {results.length > 0 && query && (
                    <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden z-100 animate-slideDown  saturate-150">
                        <div className="max-h-100 w-full max-w-3xl mx-auto overflow-y-auto custom-scrollbar">
                            {results.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/${item.category === 'tv' ? 'tv' : 'movie'}/${item.slug}`}
                                    prefetch={false}
                                    onClick={() => setQuery('')} // 👈 عشان تقفل المنيو بعد الاختيار
                                    className="group/item flex items-center gap-4 p-3 hover:bg-yellow-500/10 transition-all duration-200 no-underline border-b border-slate-100 dark:border-slate-800 last:border-0"
                                >
                                    {/* بوستر الفيلم */}
                                    <div className="relative w-12 h-16 flex-none overflow-hidden rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                                        <Image
                                            src={item.poster_url || '/placeholder.jpg'}
                                            alt={item.title}
                                            fill // 👈 دي اللي هتحل المشكلة، بتخلي الصورة تملأ الـ div الأب
                                            sizes="48px" // 👈 إضافة ذكية عشان المتصفح يعرف إنها صورة صغيرة فيحملها بأصغر حجم
                                            className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-yellow-600 dark:group-hover/item:text-yellow-500 truncate transition-colors">
                                            {item.title}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/item:bg-yellow-500/20 group-hover/item:text-yellow-600 dark:group-hover/item:text-yellow-400 transition-colors font-medium">
                                                {item.year}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter font-bold">
                                                {item.category === 'tv' ? 'مسلسل' : 'فيلم'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* زرار "عرض الكل" */}
                        {/* زرار "عرض الكل" المطور */}
                        <button
                            type="submit" // خليه submit عشان يتبع الـ form
                            className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-yellow-500 hover:text-slate-900 text-xs font-black text-yellow-600 dark:text-yellow-500 transition-all duration-300 border-t border-slate-100 dark:border-slate-800"
                        >
                            {loading ? 'جاري التحميل...' : 'مشاهدة كل النتائج'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
