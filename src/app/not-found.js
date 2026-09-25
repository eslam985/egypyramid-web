// src/app/not-found.js
import Link from "next/link";

/** بدون canonical مضلل — الصفحة تُرجع 404 فعلياً */
export const metadata = {
  title: "الصفحة غير موجودة",
  description: "الصفحة التي طلبتها غير متوفرة.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-(--background) flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-lg animate-fade-in-up">
        {/* الرقم */}
        <div className="relative">
          <span
            className="text-[180px] md:text-[220px] font-black leading-none text-transparent"
            style={{ WebkitTextStroke: "2px rgba(202,138,4,0.2)" }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-fluid-h2 font-black text-(--foreground) tracking-tighter">
            الصفحة غير موجودة
          </h1>
          <p className="text-(--foreground)/50 text-sm leading-relaxed">
            يبدو أن هذه الصفحة انتقلت إلى مكان آخر أو لم تعد موجودة.
            <br />
            تحقق من الرابط أو ارجع للصفحة الرئيسية.
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            prefetch={false}
            href="/"
            className="px-8 py-4 bg-(--accent) text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_20px_40px_rgba(202,138,4,0.3)] hover:-translate-y-1 no-underline"
          >
            الرئيسية
          </Link>
          <Link
            prefetch={false}
            href="/genre/movies"
            className="px-8 py-4 glass-card text-(--foreground) rounded-2xl font-black text-sm uppercase tracking-widest hover:border-(--accent)/40 hover:text-(--accent) no-underline"
          >
            تصفح الأفلام
          </Link>
        </div>
      </div>
    </main>
  );
}
