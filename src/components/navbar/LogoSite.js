// /media/es/DDrive/projects/web-Next.js/src/components/navbar/LogoSite.js
{/* الجزء الأيمن: اللوجو */ }
// src/components/navbar/LogoSite.js
import Link from 'next/link';

export default function LogoSite() {
    return (
        <div className="flex-none">
            <Link
                prefetch={false}
                href="/"
                aria-label="EGY PYRAMID"
                className="group flex items-center no-underline duration-300 active:scale-95"
            >
                {/* إضافة gap-1 لضبط المسافة بين النص والـ Badge بدقة */}
                <h1 className="flex items-center flex-row-reverse gap-1.5 font-black tracking-tighter text-2xl select-none antialiased">

                    {/* EGY Badge: تحسين الأنيميشن والظل */}
                    <span className="bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded-sm text-[10px] font-black shadow-sm group-hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] group-hover:-translate-y-1.5 duration-500 ease-out uppercase leading-none">
                        EGY
                    </span>

                    {/* PYRAMID Text: إضافة لمعة خفيفة (Optional) */}
                    <span className="relative bg-linear-to-r from-yellow-600 via-yellow-400 to-yellow-600 dark:from-yellow-400 dark:via-yellow-200 dark:to-yellow-500 bg-clip-text text-transparent duration-500 group-hover:drop-shadow-[0_0_8px_rgba(202,138,4,0.3)]">
                        PYRAMID
                    </span>

                </h1>
            </Link>
        </div>
    );
}