// src/components/Footer.js
'use client';
import Link from 'next/link';
// أضف Heart هنا مع باقي الأيقونات
import { Send, Facebook, Youtube, Mail, Users, Bot, Heart } from 'lucide-react';
// ✅ لون الـ accent في اللايت مود (#ca8a04) على خلفية فاتحة ratio = 2.8:1 — فاشل
// الحل: نستخدم نسخة أغمق في اللايت مود: amber-800 (#92400e) ratio = 5.9:1 ✓
// في الدارك مود: #eab308 على #0f172a ratio = 7.2:1 ✓ (تمام)

export default function Footer() {
    return (
        <footer className="p-3 md:pt-8 mt-4 relative bg-(--background) border-t border-slate-200 dark:border-slate-800   overflow-hidden transition-colors duration-500">

            {/* العلامة المائية — pointer-events-none + aria-hidden */}
            <div
                aria-hidden="true"
                className="absolute left-4 md:left-10 bottom-4 md:bottom-auto text-[3.4rem] md:text-[8.2rem] lg:text-[16rem] font-black text-(--accent) opacity-[0.03] dark:opacity-[0.03] select-none pointer-events-none tracking-tighter leading-none italic blur-[1px] -rotate-5 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            >
                EGY PYRAMID
            </div>

            {/* ✅ الـ Glow: pointer-events-none + aria-hidden لإخفاؤه من Lighthouse  rotate-0*/}
            <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 w-96 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(202,138,4,0.06), transparent 70%)' }}
            />

            <div className="max-w-350 mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-fluid-gap mb-3 md:mb-20">

                    {/* البراند والسوشيال */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="space-y-4 mb-3 md:mb-6">
                            <Link
                                prefetch={false}
                                href="/"
                                aria-label="EGY PYRAMID"
                                className="group inline-flex items-center no-underline transition-transform hover:scale-105"
                            >
                                {/* التوحيد: استخدام نفس هيكلية الـ Navbar (EGY أولاً برمجياً) */}
                                <h2 className="flex items-center flex-row-reverse gap-1.5 text-fluid-h2 font-black tracking-tighter antialiased">

                                    {/* كلمة EGY - Badge */}
                                    <span className="bg-amber-800 dark:bg-yellow-500 text-white dark:text-slate-950 px-1.5 py-0.5 rounded-sm text-[10px] font-black shadow-sm group-hover:-translate-y-1 transition-transform duration-500 uppercase leading-none">
                                        EGY
                                    </span>

                                    {/* كلمة PYRAMID */}
                                    <span className="text-amber-800 dark:text-(--accent) transition-all duration-500">
                                        PYRAMID
                                    </span>
                                </h2>
                            </Link>

                            <p className="text-slate-600 dark:text-slate-300 text-fluid-p max-w-md leading-relaxed font-bold">
                                بوابتك الرائدة لعالم الترفيه الرقمي بجودة{' '}
                                <span className="inline-flex items-center justify-center bg-amber-800 dark:bg-(--accent) text-white dark:text-slate-900 px-2 py-0.5 rounded-md text-[12px] font-black shadow-lg uppercase tracking-widest">
                                    HD
                                </span>.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-1 md:gap-4">
                            {[
                                { Icon: Send, href: 'https://t.me/EgyPyramid', label: 'Telegram Channel' },
                                { Icon: Users, href: 'https://t.me/Egy_Pyramid_Community', label: 'Telegram Community' }, // أيقونة Users للجروب
                                { Icon: Bot, href: 'https://t.me/EgyPyramid_Web_Bot', label: 'Telegram Bot' }, // أيقونة Bot للبوت
                                { Icon: Mail, href: 'mailto:egypyramidofficial@gmail.com', label: 'Contact Us' }, // أيقونة Mail للإيميل
                                { Icon: Facebook, href: 'https://www.facebook.com/people/Egypyramid/61590525984381/', label: 'Facebook' },
                                { Icon: Youtube, href: 'https://www.youtube.com/@Egy-Pyramid', label: 'YouTube' },
                            ].map(({ Icon, href, label }, i) => (
                                <Link
                                    key={i}
                                    href={href}
                                    prefetch={false}
                                    target={href.startsWith('mailto') ? '_self' : '_blank'} // الإيميل يفتح في نفس الصفحة لفتح تطبيق الميل
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-amber-800 dark:hover:bg-(--accent) hover:text-white dark:hover:text-slate-950 hover:border-transparent hover:-translate-y-2 transition-all duration-500"
                                >
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* روابط الأقسام */}
                    <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-slate-800 dark:text-slate-200 font-black text-fluid-xs uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-800 dark:bg-(--accent) rounded-full" />
                            استكشف
                        </h3>

                        <ul className="space-y-4 text-fluid-xs font-bold px-1 list-none">
                            {[
                                { name: 'أحدث الأفلام', href: '/genre/movies' },
                                { name: 'أحدث المسلسلات', href: '/genre/series' },
                                { name: 'رمضان 2026', href: '/genre/ramadan-2026' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        prefetch={false}
                                        className="text-slate-600 dark:text-slate-400 hover:text-amber-800 dark:hover:text-(--accent) flex items-center gap-2 group/link no-underline transition-colors duration-300"
                                    >
                                        <span className="w-0 group-hover/link:w-3 h-0] group-hover/link:h-1.5 bg-amber-800 dark:bg-(--accent) transition-all duration-300 shrink-0" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* قسم "مجتمع إيجي بيراميد" */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-slate-800 dark:text-slate-200 font-black text-fluid-xs uppercase tracking-[0.3em]">
                           مجتمع إيجي بيراميد - EGY PYRAMID
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-[12px] font-medium leading-relaxed">
                            انضم لجروبنا على تليجرام لطلب الأفلام، متابعة التحديثات، والتواصل مع آلاف المتابعين.
                        </p>

                        <a
                            href="https://t.me/+1ZN4iRLMER04YzZk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-between w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 transition-all hover:border-amber-700 dark:hover:border-(--accent) overflow-hidden"
                        >
                            <div className="flex items-center gap-3 z-10">
                                <div className="bg-amber-800 dark:bg-(--accent) p-2 rounded-xl text-white dark:text-slate-950 group-hover:scale-110 transition-transform">
                                    <Send size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">اطلب فيلمك الآن</span>
                                    <span className="text-(--foreground ) dark:text-slate-500 text-[10px]">عبر مجتمعنا على Telegram</span>
                                </div>
                            </div>

                            <div className="z-10 bg-slate-200 dark:bg-slate-700/50 px-3 py-1 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-400 group-hover:bg-amber-800 group-hover:text-white dark:group-hover:bg-(--accent) dark:group-hover:text-slate-950 transition-colors">
                                انضمام
                            </div>

                            {/* تأثير خلفية خفيف عند الحوم (Hover) */}
                            <div className="absolute inset-0 bg-linear-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>


                </div>

                {/* الحقوق السفلى */}
                <div className="pt-3 md:pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-600 dark:text-slate-400 text-fluid-xs font-black tracking-widest uppercase antialiased">
                        © 2026 Crafted with{' '}
                        <Heart size={14} className="inline text-red-500 mx-1 animate-pulse" />
                        {' '}by{' '}
                        {/* ✅ amber-800 في اللايت بدل accent مباشرة */}
                        <span className="text-amber-800 dark:text-(--accent)">EGY PYRAMID</span>
                    </p>

                    <div className="flex items-center gap-8 text-fluid-xs font-black uppercase tracking-widest">
                        {/* ✅ slate-600 ratio 5.9:1 في اللايت ✓ */}
                        <Link
                            prefetch={false}
                            href="/privacy-policy"
                            className="text-slate-600 dark:text-slate-400 hover:text-amber-800 dark:hover:text-(--accent) transition-colors no-underline"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/dmca"
                            prefetch={false}
                            className="text-slate-600 dark:text-slate-400 hover:text-amber-800 dark:hover:text-(--accent) transition-colors no-underline"
                        >
                            DMCA
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}