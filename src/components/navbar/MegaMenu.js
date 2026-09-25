// /media/es/DDrive/projects/web-Next/egypyramid-web/src/components/navbar/MegaMenu.js
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MegaMenu({
    genres,
    navbarRef,
    onClose,
    onMouseEnter,
    onMouseLeave
}) {
    const menuRef = useRef(null);
    const router = useRouter();

    const handleLinkClick = (e, href) => {
        e.preventDefault();
        router.push(href);
        setTimeout(onClose, 150);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current?.contains(e.target) || navbarRef.current?.contains(e.target)) {
                return;
            }
            onClose();
        };

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose, navbarRef]);

    if (!navbarRef.current) return null;

    const navbarRect = navbarRef.current.getBoundingClientRect();

    const menuStyle = {
        position: 'fixed',
        top: `${navbarRect.bottom}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '95%',
        maxWidth: '1280px',
        // ✅ الحل: z-index أعلى من أي iframe Stacking Context
        // الـ iframe بيخلق browsing context مستقل — الحل الوحيد هو z-index عالي جداً
        // nav عنده z-50 (= 50)، iframe بيطغى عليه بسبب طبيعته
        // نرفع MegaMenu لـ 9999 لضمان ظهوره فوق الـ iframe دايماً
        zIndex: 9999,
    };

    return createPortal(
        <div
            ref={menuRef}
            style={menuStyle}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="glass-card animate-slide-down p-fluid-p shadow-2xl border-t-2 border-accent/60 bg-black/15 backdrop-blur-md transition-colors duration-300"
        >
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <span className="h-px w-8 bg-(--accent)/50"></span>
                    <h3 className="text-fluid-xs uppercase tracking-[0.3em] text-(--accent) font-black">
                        تصفح حسب النوع
                    </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-fluid-gap">
                    {genres.map((genre) => (
                        <Link
                            key={genre.id}
                            href={`/genre/${genre.slug}`}
                            prefetch={false}
                            onClick={() => handleLinkClick(event, `/genre/${genre.slug}`)}
                            className="group relative flex items-center sm:gap-1 sm:px-2 gap-3 px-4 py-2 bg-(--background)/50 border border-slate-200 dark:border-slate-800 rounded-xl duration-300 hover:text-(--foreground) hover:bg-(--accent)/10 hover:border-(--accent)/20 hover:-translate-y-1 no-underline overflow-hidden backdrop-blur-sm"
                        >
                            <span className="w-1.5 h-1.5 bg-(--accent) rounded-full shadow-[0_0_8px_var(--accent)] group-hover:scale-150 transition-transform"></span>
                            <span className="text-fluid-p font-medium text-(--foreground)  dark:group-hover:text-white transition-colors">
                                {genre.name}
                            </span>
                            <div className="card-shine"></div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}