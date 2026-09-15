// /media/es/DDrive/projects/web-Next/egypyramid-web/src/components/NavbarClient.js
'use client';
import { useState, useRef } from 'react'; // شيلنا useEffect
import LogoSite from './navbar/LogoSite';
import NavLinks from './navbar/NavLinks';
import GenresTrigger from './navbar/GenresTrigger';
import { Menu } from 'lucide-react';

// التعديل في السطور من 5 لـ 11 (استبدلهم بـ دا):
import dynamic from 'next/dynamic';

const MegaMenu = dynamic(() => import('./navbar/MegaMenu'));
const MobileMenu = dynamic(() => import('./navbar/MobileMenu'));
const SearchBar = dynamic(() => import('./navbar/SearchBar'));
const ThemeToggle = dynamic(() => import('./navbar/ThemeToggle'));

export default function Navbar({ initialGenres = [] }) { // استقبال الأقسام كـ Prop
  const [genres] = useState(initialGenres); // نستخدم الأقسام الجاهزة فوراً
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const navbarRef = useRef(null);
  const menuTimeoutRef = useRef(null);

  const handleOpen = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleClose = () => {
    menuTimeoutRef.current = setTimeout(() => setIsMegaMenuOpen(false), 300);
  };

  return (
    <>
      <nav
        ref={navbarRef}
        // ✅ الإصلاح الجوهري:
        // "isolate" تُنشئ Stacking Context صريح مستقل
        // هذا يضمن أن z-50 على nav يعمل بالنسبة للـ viewport مباشرة
        // وليس داخل أي Stacking Context خارجي
        //
        // "z-[9998]" أعلى من MegaMenu (9999) بفارق واحد لأن MegaMenu يُرسم خارج الـ nav
        // لكن أعلى من كل محتوى الصفحة (iframe, ServerList, RelatedSidebar)
        //
        // backdrop-blur-md ينشئ Stacking Context — لذا يجب أن يكون z-index الـ nav عالياً جداً
        className="sticky top-0 w-full bg-(--background)/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 isolate"
        style={{ zIndex: 9998 }}
      >
        <div className="max-w-350 mx-auto px-4 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden group p-3 rounded-xl bg-slate-100/5 border border-slate-100/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 active:scale-90"
              aria-label="فتح القائمة"
            >
              <Menu size={26} className="group-hover:scale-110 transition-transform" />
            </button>
            <ThemeToggle />
          </div>

          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <NavLinks />
            <GenresTrigger
              isOpen={isMegaMenuOpen}
              onOpen={handleOpen}
              onClose={handleClose}
            />
            <SearchBar />
          </div>

          <LogoSite />
        </div>
      </nav>

      {/* MegaMenu يُرسم خارج الـ nav عبر Portal بـ z-index: 9999 — فوق الـ nav مباشرة */}
      {isMegaMenuOpen && (
        <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
          <MegaMenu
            genres={genres}
            onClose={() => setIsMegaMenuOpen(false)}
            navbarRef={navbarRef}
          />
        </div>
      )}

      {/* MobileMenu بـ z-index: 9999 — فوق كل حاجة */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        genres={genres}
        query={query}
        setQuery={setQuery}
      />
    </>
  );
}