// src/components/common/Breadcrumbs.js
// ✅ مكوّن Breadcrumbs عالمي ديناميكي — يقرأ المسار تلقائياً
// يُستدعى مرة واحدة في layout.js ويعمل في كل الصفحات

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';
const SEGMENT_LABELS = {
  movie: 'أفلام',
  tv: 'مسلسلات',
  genre: 'التصنيفات',
  watch: 'مشاهدة',
  episode: 'حلقة',
  download: 'تحميل',
  season: 'موسم',
  dmca: 'DMCA',
  'privacy-policy': 'سياسة الخصوصية',
};

const SKIP_AS_LABEL = new Set(['episode', 'season', 'download']);

function decodeSegment(segment) {
  try { return decodeURIComponent(segment); } catch { return segment; }
}

function formatLabel(segment) {
  const decoded = decodeSegment(segment);
  if (SEGMENT_LABELS[decoded]) return SEGMENT_LABELS[decoded];
  if (decoded.includes('-')) {
    return decoded.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0, 40);
  }
  return decoded;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(seg => Boolean(seg) && seg !== 'index');
  const crumbs = [];
  let i = 0;

  while (i < segments.length) {
    const seg = segments[i];
    const decoded = decodeSegment(seg);
    const href = '/' + segments.slice(0, i + 1).join('/');

    if (SKIP_AS_LABEL.has(decoded) && segments[i + 1] && /^\d+$/.test(segments[i + 1])) {
      const number = segments[i + 1];
      const combinedHref = '/' + segments.slice(0, i + 2).join('/');
      const label = `${SEGMENT_LABELS[decoded] || decoded} ${number}`;
      crumbs.push({ label, href: combinedHref });
      i += 2;
      continue;
    }

    if (decoded) {
      crumbs.push({ label: formatLabel(decoded), href });
    }
    i++;
  }

  if (crumbs.length === 0) return null;

  return (
    <>
      <nav aria-label="breadcrumb" className="max-w-350 mx-auto no-scrollbar flex bg-(--background) items-center gap-1.5 overflow-x-auto whitespace-nowrap mb-3 pt-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 md:text-xs ">
        <Link prefetch={false} href="/" aria-label="العودة للصفحة الرئيسية" className="shrink-0 transition-colors hover:text-(--accent) no-underline flex items-center gap-1">
          <Home size={20} className="opacity-70" aria-hidden="true" />
          <span className="hidden sm:inline">الرئيسية</span>
        </Link>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={crumb.href} className="flex items-center gap-1.5 shrink-0">
              <ChevronLeft size={11} className="opacity-40 shrink-0" />
              {isLast ? (
                <span className="text-[#996903] shrink-0 max-w-30 truncate md:max-w-60">{crumb.label}</span>
              ) : (
                <Link prefetch={false} href={crumb.href} className="shrink-0 transition-colors hover:text-(--accent) no-underline max-w-25 truncate md:max-w-45" title={crumb.label}>
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
