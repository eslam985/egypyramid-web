// /media/es/DDrive/projects/web-Next.js/src/components/navbar/NavLinks.js
// src/components/navbar/NavLinks.js
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function NavLinks() {
    return (
        <div className="flex items-center gap-6">
            {/* الرئيسية */}
            <Link
                prefetch={false}
                href="/"
                className="group relative py-2 text-sm font-bold text-slate-600 dark:text-slate-300 lg:hover:text-yellow-600 dark:hover:text-yellow-500 duration-300 no-underline"
            >
                الرئيسية
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-600 dark:bg-yellow-500 duration-300 group-hover:w-full"></span>
            </Link>

            {/* رابط رمضان 2026 */}
            <Link
                href="/genre/ramadan-2026"
                prefetch={false}
                className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--background) dark:bg-yellow-600/10 border border-yellow-500/40 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-500 font-black text-sm no-underline shadow-sm lg:hover:scale-105 duration-300 overflow-hidden group"
            >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <Sparkles size={16} className="animate-spin-slow text-yellow-600 dark:text-yellow-400" />
                <span className="relative">رمضان 2026</span>
            </Link>
        </div>
    );
}
