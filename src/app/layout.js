// src/app/layout.js
import { Cairo } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Breadcrumbs from "../components/common/Breadcrumbs";
import {
  constructMetadata,
  buildWebSiteWithOrganizationGraph,
  serializeJsonLd,
  SITE_CONFIG,
  viewportConfig,
} from "@/lib/seo";
import "./globals.css";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar"; // استدعي المكون السيرفر اللي عملناه
import { Suspense } from "react"; // مهم جداً للـ 100
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import AntiAdblock from "@/components/ads/AntiAdblock";
import MonetizationEngine from "../components/ads/MonetizationEngine";
// 1. شيل { ssr: false } من هنا خالص
const Footer = dynamic(() => import("../components/Footer"));
const BackToTop = dynamic(() => import("../components/BackToTop"));
export const revalidate = 3600; // الموقع هيحدث نفسه تلقائياً كل ساعة لو فيه تحديثات جديدة
export const viewport = viewportConfig;
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
  // ✅ تحسين: تحديد الأحرف المستخدمة فقط لتقليل حجم الخط
  adjustFontFallback: true,
  variable: "--font-cairo", // ✅ ضيف السطر ده عشان نربطه بـ Tailwind لو احتجت
});
// src/app/layout.js
export const metadata = {
  // 1. أضف هذا السطر فوراً (القاعدة الأساسية للروابط)
  metadataBase: new URL("https://egypyramid.vercel.app"),

  ...constructMetadata({
    manifest: "/manifest.json",
    title: {
      default: `${SITE_CONFIG.name} | مشاهدة أحدث الأفلام والمسلسلات بجودة عالية`,
      template: `%s | ${SITE_CONFIG.name}`,
    },
    description: SITE_CONFIG.defaultDescription,
  }),
  // 2. أضف هذا الجزء لضمان وجود رابط كنسي افتراضي لكل صفحات الموقع
  alternates: {
    canonical: "/",
  },

  other: {
    cbbd4fcf68241cd92d02c8c3448eb023c8afb46e:
      "cbbd4fcf68241cd92d02c8c3448eb023c8afb46e",
  },
};

export default async function RootLayout({ children }) {
  const siteGraphLd = buildWebSiteWithOrganizationGraph();

  return (
    <html lang="ar-EG" dir="rtl" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="rYTEb-Ob4kJMCp7tqf-aoMBDK9BpigLTl4n2T_h6WK8"
        />
        {/* حقن الـ Schema الأساسية للموقع */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteGraphLd) }}
        />

        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://voe.sx" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://streamtape.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://voe.sx" />
        <link rel="dns-prefetch" href="https://mixdrop.co" />
        <link rel="dns-prefetch" href="https://streamtape.com" />
        <link rel="dns-prefetch" href="https://doodstream.com" />
        {/* ✅ Resource Hints للتحميل الأسرع */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

        {/* ✅ تحسين Viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </head>

      <body className={cairo.className} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={false}
          disableTransitionOnChange={false} // ✅ تحسين الأداء
        >
          <Suspense
            fallback={
              <div className="h-16 w-full bg-(--background)/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800" />
            }
          >
            <Navbar />
          </Suspense>
          <Breadcrumbs />
          <main className="m-w-350 mx-auto min-h-screen bg-(--background) pb-fluid-p space-y-fluid-section overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <BackToTop />
          {/* الـ Portal لوضع السينما */}
          <div id="cinema-portal-root" />
        </ThemeProvider>
        <SpeedInsights />
        <GoogleAnalytics gaId="G-NS45YP2TXJ" />
        <VercelAnalytics />
        <MonetizationEngine />
        <AntiAdblock /> {/* المكون الجديد هنا */}
        {/* 🛡️ مصيدة البوتات (Honeypot) - لا تقم بحذفها أو تعديلها */}
        <a
          href="/api/v1/system-sync"
          aria-hidden="true"
          tabIndex={-1}
          style={{
            display: "none",
            position: "absolute",
            left: "-9999px",
            zIndex: -1,
            opacity: 0,
            pointerEvents: "none",
          }}
          rel="nofollow"
        >
          System Sync
        </a>
      </body>
    </html>
  );
}
