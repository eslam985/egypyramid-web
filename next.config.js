import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // السطر الجديد لحل مشكلة الـ Blocked request
    allowedDevOrigins: ['192.168.1.105'],
    // ✅ خلي دي بره زي ما هي للـ Dev
    // turbopack: {}, // اختيارية لو بتواجه مشاكل في الـ Dev شيل الكومنت

    experimental: {
        optimizeCss: true,
        optimizePackageImports: [
            'lucide-react',
            '@supabase/supabase-js',
            'framer-motion'
        ],
        scrollRestoration: true,
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
        styledComponents: true,
    },

    images: {
        qualities: [65, 75], // ضف السطر ده عشان نحدد جودة الصور اللي بيولدها Next.js (65-75 هو توازن ممتاز بين الجودة والحجم)
        unoptimized: true,
        minimumCacheTTL: 31536000,
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'image.tmdb.org' },
            { protocol: 'https', hostname: '*.cloudinary.com' },
            { protocol: 'https', hostname: 'voe.sx' },
        ],
    },


    // ✅ تحسين الـ Headers لتسريع التحميل
    async headers() {
        // نطبق الهيدرز فقط لو إحنا مش في وضع الـ Dev
        if (process.env.NODE_ENV === 'development') return [];

        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-Frame-Options', // يمنع عرض موقعك داخل iframe في مواقع غريبة
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options', // يمنع المتصفح من تخمين نوع الملف (يحمي من حقن السكريبتات)
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy', // يحمي خصوصية روابط موقعك عند الانتقال لمواقع خارجية
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Strict-Transport-Security', // يجبر المتصفح على استخدام HTTPS دائماً
                        value: 'max-age=31536000; includeSubDomains; preload'
                    }
                ],

            },
            // Headers خاصة بالصور
            {
                source: '/_next/image/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Headers خاصة بالـ Static Assets
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/index',
                destination: '/',
                permanent: true, // مهم جداً عشان الـ SEO يعرف إن ده تغيير نهائي
            },
        ]
    },
};


// في آخر الملف خالص بدلاً من export default nextConfig
export default withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})(nextConfig);