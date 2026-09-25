// /media/es/DDrive/projects/web-Next.js/src/components/common/SectionHeader.js
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SectionHeader({ title, subtitle, icon: Icon, href }) {
    return (
        <div className="group/header flex items-end justify-between mb-2 px-2 relative">
            <div className="flex items-center gap-5">
                {/* الأيقونة: إضافة تركة الـ Pulse الهادي */}
                <div className="relative group-hover/header:scale-110 transition-transform duration-500">
                    {/* التوهج الخلفي: خليناه animate-pulse خفيف */}
                    <div className="absolute inset-0 bg-(--accent)/20 blur-2xl rounded-full animate-pulse opacity-0 group-hover/header:opacity-100 transition-opacity" />

                    <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-(--accent)/20 to-transparent flex items-center justify-center text-(--accent) border border-(--accent)/20 shadow-[inset_0_0_15px_rgba(202,138,4,0.3)] group-hover/header:rotate-12 duration-500 overflow-hidden">
                        {/* تركة: لمعة بتعدي على الأيقونة نفسها */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent -translate-y-full group-hover/header:translate-y-full transition-transform duration-700" />
                        <Icon size={28} className="drop-shadow-[0_0_8px_rgba(202,138,4,0.5)]" />
                    </div>
                </div>

                <div className="space-y-1">
                    {/* العنوان: استخدام text-fluid-h2 مباشرة */}
                    <h2 className="text-fluid-h2 font-black text-(--foreground) tracking-tighter duration-500 group-hover/header:translate-x-2 group-hover/header:text-(--accent)">
                        {title}
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* الخط الديكوري: خليته Gradient */}
                        <span className="w-8 h-[3px] bg-linear-to-r from-(--accent) to-transparent rounded-full group-hover/header:w-16 duration-500" />

                        <p className="text-fluid-xs uppercase tracking-[0.4em] text-(--foreground)/73 font-bold antialiased">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* زرار "عرض الكل": ضبط المتغيرات والـ Hover */}
            <Link
                href={href}
                prefetch={false} // ✅ ضيف السطر ده هنا
                className="group/btn hidden sm:flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-(--card-bg) backdrop-blur-xl text-fluid-xs font-black text-(--foreground) border border-white/5 hover:border-(--accent)/40 duration-500 hover:shadow-[0_20px_40px_-15px_rgba(202,138,4,0.2)] active:scale-95 no-underline relative overflow-hidden"
            >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-(--accent)/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                <span className="relative z-10 uppercase tracking-widest transition-colors duration-300 group-hover/btn:text-(--accent)">
                    عرض الكل
                </span>

                {/* سهم الحركة: تركة الـ "Bounce" */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5 group-hover/btn:bg-(--accent) group-hover/btn:text-slate-950 group-hover/btn:rotate-[-10deg] duration-500">
                    <ChevronLeft size={16} className="group-hover/btn:-translate-x-0.5 transition-transform duration-300" />
                </div>
            </Link>
        </div>
    );
}
