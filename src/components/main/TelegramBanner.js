"use client";
import { Send, BellRing, Sparkles, Users, Bot } from "lucide-react";

export default function TelegramBanner() {
  return (
    <section className="px-3">
      <div className="relative overflow-hidden bg-gradient-to-br from-(--accent) to-orange-500 rounded-[2.5rem] md:rounded-[3.5rem] p-3 md:p-fluid-p flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-8 shadow-lg border border-white/10">
        {/* 1. زينة خلفية حركية */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />

        {/* 2. النص الخلفي */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] select-none pointer-events-none uppercase">
          <span className="text- md:text- font-black italic text-slate-950">
            TELEGRAM
          </span>
        </div>

        {/* 3. محتوى النص */}
        <div className="relative z-10 flex-1 space-y-6 text-center lg:text-right">
          <div className="inline-flex items-center gap-2 bg-slate-950/10 px-4 py-2 rounded-full border border-white/10 text-slate-950 font-black text-fluid-xs uppercase tracking-widest">
            <BellRing size={14} /> لا تفوت أي حلقة بعد اليوم
          </div>

          <h2 className="text-fluid-h1 font-black text-slate-950 leading-none tracking-tighter drop-shadow-sm">
            عالم الحصريات
            <span className="block text-white drop-shadow-md mt-2">
              بين يديك الآن
            </span>
          </h2>

          <p className="text-slate-950/70 dark:text-slate-900/80 font-bold text-fluid-p max-w-xl mx-auto lg:mr-0 leading-relaxed">
            انضم لأكثر من{" "}
            <span className="bg-slate-950 text-white px-2 py-0.5 rounded-lg shadow-lg">
              50,000
            </span>{" "}
            متابع واستلم روابط المشاهدة المباشرة.
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
      className={`flex items-center justify-center gap-1 p-1 md:gap-3 md:px-8 md:py-5 rounded-3xl font-black text-fluid-xs md:text-base shadow-md transition-colors duration-200 no-underline active:scale-95 flex-1
            ${
              isPrimary
                ? "bg-slate-950 text-white lg:hover:bg-white lg:hover:text-slate-950"
                : "bg-white/20 border border-white/20 text-slate-950 lg:hover:bg-slate-950 lg:hover:text-white lg:w-60"
            }`}
    >
      <div className="p-2 rounded-xl bg-white/10">
        <Icon size={20} />
      </div>
      <span>{text}</span>
    </a>
  );
}
