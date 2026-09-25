'use client';
import { Send, BellRing, Sparkles, Users, Bot } from 'lucide-react';

export default function TelegramBanner() {
    return (
        <section className="px-3">
            <div className="relative overflow-hidden bg-linear-to-br from-(--accent) via-(--accent) to-orange-500 dark:to-orange-600 rounded-[2.5rem] md:rounded-[3.5rem] p-3 md:p-fluid-p flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-8 shadow-[0_40px_80px_-20px_rgba(202,138,4,0.3)] border-4 border-white/20 duration-500">

                {/* 1. زينة خلفية حركية */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/20 blur-[80px] rounded-full animate-pulse" />

                {/* 2. النص الخلفي */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] select-none pointer-events-none uppercase tracking-[0.2em]">
                    <span className="text-[10rem] md:text-[18rem] font-black italic rotate-[-5deg] text-slate-950 stroke-text" style={{ WebkitTextStroke: '2px rgba(2, 6, 23, 0.5)' }}>
                        TELEGRAM
                    </span>
                </div>

                {/* 3. محتوى النص */}
                <div className="relative z-10 flex-1 space-y-6 text-center lg:text-right">
                    <div className="inline-flex items-center gap-2 bg-slate-950/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-slate-950 font-black text-fluid-xs uppercase tracking-widest animate-bounce">
                        <BellRing size={14} /> لا تفوت أي حلقة بعد اليوم
                    </div>

                    <h2 className="text-fluid-h1 font-black text-slate-950 leading-none tracking-tighter drop-shadow-sm">
                        عالم الحصريات
                        <span className="block text-white drop-shadow-md mt-2">
                            بين يديك الآن
                        </span>
                    </h2>

                    <p className="text-slate-950/70 dark:text-slate-900/80 font-bold text-fluid-p max-w-xl mx-auto lg:mr-0 leading-relaxed">
                        انضم لأكثر من <span className="bg-slate-950 text-white px-2 py-0.5 rounded-lg shadow-lg">50,000</span> متابع واستلم روابط المشاهدة المباشرة.
                    </p>
                </div>

                {/* 4. الأزرار الثلاثة */}
                <div className="relative z-10 w-full lg:w-auto flex flex-col gap-4">
                    {/* زر القناة - الأساسي */}
                    <TelegramButton
                        href="https://t.me/egypyramid"
                        text="انضم للقناة"
                        Icon={Send}
                        isPrimary
                    />

                    {/* أزرار فرعية (الجروب والبوت) */}
                    <div className="flex flex-row gap-1 md:gap-3">
                        <TelegramButton
                            href="https://t.me/Egy_Pyramid_Community"
                            text="المجتمع"
                            Icon={Users}
                        />
                        <TelegramButton
                            href="https://t.me/EgyPyramid_Web_Bot"
                            text="البوت الذكي"
                            Icon={Bot}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

// مكون فرعي للأزرار لتقليل تكرار الكود
function TelegramButton({ href, text, Icon, isPrimary = false }) {
    return (
        <a
            href={href}
            target="_blank"
            className={`group relative flex items-center justify-center gap-1 p-1 md:gap-3 md:px-8 md:py-5 rounded-3xl font-black text-fluid-xs md:text-base shadow-xl duration-500 hover:-translate-y-1 no-underline overflow-hidden active:scale-95 flex-1 
            ${isPrimary
                    ? 'bg-slate-950 text-white hover:bg-white hover:text-slate-950'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-slate-950 hover:bg-slate-950 hover:text-white lg:w-60'}`}
        >
            <div className={`p-2 rounded-xl transition-colors ${isPrimary ? 'bg-white/10 group-hover:bg-slate-900/5' : 'bg-slate-950/10 group-hover:bg-white/10'}`}>
                <Icon size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            </div>

            <span className="relative z-10">{text}</span>

            {isPrimary && <Sparkles size={16} className="text-(--accent) absolute top-3 right-4 opacity-0 group-hover:opacity-100 duration-500 group-hover:scale-125" />}

            {/* تأثير اللمعة */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </a>
    );
}