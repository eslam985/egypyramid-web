// src/app/dmca/page.js
import { constructMetadata } from '../../lib/seo'; // 1. ربط السيو

// 2. سيو الصفحة مع منع الأرشفة لتركيز قوة الموقع في الأفلام
export const metadata = constructMetadata({
    title: 'DMCA Policy',
    description: 'DMCA Copyright Infringement Notification for PYRAMID EGY.',
    noIndex: true
});

export default function DMCAPage() {
    return (
        <main className="text-left max-w-4xl mx-auto py-fluid-section px-fluid-p min-h-screen">
            {/* 3. العنوان بتنسيق Fluid مع أنيميشن */}
            <h1 className="text-fluid-h1 font-black mb-10 text-(--accent) animate-fade-in-up tracking-tighter">
                DMCA Policy
            </h1>

            <div className="space-y-8 text-fluid-p leading-relaxed text-(--foreground)/80 font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <p>
                    <strong className="text-(--foreground)">PYRAMID EGY</strong> is an indexing and embedding service for multimedia content available publicly on the internet.
                    We do not host, store, or upload any media files, videos, or content on our servers.
                </p>

                {/* 4. تنبيه إخلاء المسؤولية: استخدام الـ Accent كخلفية خفيفة */}
                <div className="border-r-4 border-(--accent) pr-6 bg-(--accent)/5 py-6 rounded-l-2xl shadow-sm italic">
                    All content featured on this website is provided by third-party services and is embedded from external platforms.
                    We take intellectual property rights very seriously and will act promptly upon receiving valid notices of copyright infringement.
                </div>

                <h2 className="text-fluid-h2 font-black text-(--foreground) mt-10 tracking-tight">
                    Infringement Notification
                </h2>

                <p>
                    If you are the copyright owner of content which appears on <strong className="text-(--foreground)">PYRAMID EGY</strong>, you must notify us in writing to take action.
                </p>

                {/* 5. استخدام كلاس الـ glass-card الجاهز عندك */}
                <div className="glass-card p-8 border-(--accent)/10 shadow-2xl space-y-4">
                    <h3 className="text-fluid-h3 font-black text-(--accent) mb-4">Required Information:</h3>
                    <ul className="list-disc list-inside space-y-3 text-sm md:text-base font-bold opacity-90">
                        <li>Physical or electronic signature of the owner.</li>
                        <li>Identification of the copyrighted work infringed.</li>
                        <li>Contact information (Email, Address, Phone).</li>
                        <li>A statement of good faith belief regarding unauthorized use.</li>
                    </ul>
                </div>

                <div className="pt-10 border-t border-(--accent)/20">

                    <p className="text-fluid-xs uppercase  tracking-[0.2em] font-black opacity-60">
                        Please send all infringement notices to:
                        <a
                            href="mailto:egypyramidofficial@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-(--accent)! ml-3 select-all hover:underline cursor-pointer transition-colors"
                        >
                            egypyramidofficial@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}
