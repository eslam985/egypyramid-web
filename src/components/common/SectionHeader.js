// /media/es/DDrive/projects/web-Next.js/src/components/common/SectionHeader.js
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SectionHeader({ title, subtitle, icon: Icon, href }) {
    return (
        <div className="flex items-end justify-between mb-2 px-2 relative">
            <div className="flex items-center gap-5">
                {/* الأيقونة: إضافة تركة الـ Pulse الهادي */}
                <div className="relative">
                    <div className="relative w-14 h-14 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) border border-(--accent)/20">
                        <Icon size={28} />
                    </div>
                </div>

                <div className="space-y-1">
                    {/* العنوان: استخدام text-fluid-h2 مباشرة */}
                    <h2 className="text-fluid-h2 font-black text-(--foreground) tracking-tighter">
                        {title}
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* الخط الديكوري: خليته Gradient */}
                        <span className="w-8 h- bg-(--accent) rounded-full" />

                        <p className="text-fluid-xs uppercase tracking-[0.4em] text-(--foreground)/73 font-bold antialiased">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* زرار "عرض الكل": ضبط المتغيرات والـ Hover */}
            <Link
                href={href}
                prefetch={false}
                className="hidden sm:flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-(--card-bg) text-fluid-xs font-black text-(--foreground) border border-white/5 lg:hover:border-(--accent)/40 transition-colors duration-200 no-underline"
            >
                <span className="uppercase tracking-widest">
                    عرض الكل
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                    <ChevronLeft size={16} />
                </div>
            </Link>
        </div>
    );
}
