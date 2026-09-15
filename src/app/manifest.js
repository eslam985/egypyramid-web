// src/app/manifest.js

export default function manifest() {
    return {
        name: 'EGY PYRAMID | مشاهدة أفلام ومسلسلات بجودة عالية',
        short_name: 'EGY PYRAMID',
        description: 'شاهد أحدث الأفلام والمسلسلات بجودة عالية. منصة EGY PYRAMID لمحتوى متجدد يومياً.',

        start_url: '/',
        scope: '/',

        display: 'standalone',
        orientation: 'portrait',

        background_color: '#0f172a',
        theme_color: '#0f172a',

        lang: 'ar',
        dir: 'rtl',

        categories: ['entertainment', 'video'],

        icons: [
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],

        screenshots: [
            {
                src: 'https://res.cloudinary.com/dbahqgo8j/image/upload/q_auto,f_auto,w_1200,h_630,c_pad,b_black/blogger/logo.webp',
                sizes: '1200x630',
                type: 'image/webp',
                form_factor: 'wide',
                label: 'EGY PYRAMID - الصفحة الرئيسية',
            },
        ],

        shortcuts: [
            {
                name: 'أحدث الأفلام',
                short_name: 'الأفلام',
                description: 'تصفح أحدث الأفلام المضافة',
                url: '/movie',
                icons: [
                    {
                        src: '/icon.png',
                        sizes: '96x96',
                        type: 'image/png',
                    },
                ],
            },
            {
                name: 'أحدث المسلسلات',
                short_name: 'المسلسلات',
                description: 'تصفح أحدث المسلسلات المضافة',
                url: '/tv',
                icons: [
                    {
                        src: '/icon.png',
                        sizes: '96x96',
                        type: 'image/png',
                    },
                ],
            },
        ],
    };
}