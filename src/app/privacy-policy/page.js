// src/app/privacy-policy/page.js
import { constructMetadata } from '../../lib/seo'; // 1. ربط السيو

// 2. سيو الصفحة عشان جوجل يحترمها
export const metadata = constructMetadata({
    title: 'Privacy Policy',
    description: 'Learn more about how we handle your privacy at PYRAMID EGY.',
    noIndex: true // تركة: صفحات القوانين مش محتاجينها تنافس في البحث
});

export default function PrivacyPolicy() {
    return (
      <main className="text-left max-w-4xl mx-auto py-fluid-section px-fluid-p min-h-screen">
        {/* 3. إضافة أنيميشن الدخول */}
        <h1 className="text-fluid-h1 font-black mb-2 text-(--accent) animate-fade-in-up tracking-tighter">
          Privacy Policy
        </h1>
        <p
          className="text-xs uppercase text-(--accent) tracking-widest font-black opacity-50 mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          Last Updated: May 2026
        </p>

        <div
          className="space-y-8 text-fluid-p text-(--foreground)/80 font-medium animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <section className="glass-card border-(--foreground)/5">
            <p className="leading-relaxed">
              At <strong className="text-(--foreground)">PYRAMID EGY</strong>,
              we consider the privacy of our visitors to be extremely important.
              This document outlines the types of personal information received
              and collected.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-fluid-h2 font-black text-(--foreground) tracking-tight">
              Log Files
            </h2>
            <p className="leading-relaxed border-r-2 border-(--accent)/30 pr-4">
              Like many other Web sites, we make use of log files to analyze
              trends, administer the site, and track user’s movement around the
              site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-fluid-h2 font-black text-(--foreground) tracking-tight">
              Cookies and Web Beacons
            </h2>
            <p className="leading-relaxed border-r-2 border-(--accent)/30 pr-4">
              We use cookies to store information about visitors preferences,
              record user-specific information on which pages the user access or
              visit.
            </p>
            <p className="leading-relaxed border-r-2 border-(--accent)/30 pr-4 mt-4 italic text-sm">
              Note: We have no access to or control over cookies used by
              third-party advertisers or video players.
            </p>
            <section className="space-y-4">
              <h2 className="text-fluid-h2 font-black text-(--foreground) tracking-tight">
                Third-Party Advertisers
              </h2>
              <p className="leading-relaxed border-r-2 border-(--accent)/30 pr-4">
                We partner with third-party advertising networks to display ads
                on our site. These companies may use cookies and other
                technologies to track your online activity. We have no control
                over the content of these ads or the data collected by these
                third-party networks.
              </p>
            </section>
          </section>
          <div className="pt-10 border-t border-(--foreground)/5">
            <p className="text-fluid-xs uppercase tracking-widest font-black opacity-60">
              For more information, contact us:
              <a
                href="mailto:egypyramidofficial@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--accent)! ml-2 select-all hover:underline transition-colors"
              >
                egypyramidofficial@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
    );
}
