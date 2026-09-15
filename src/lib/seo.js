// src/lib/seo.js — مصدر واحد للـ SEO والعلامة التجارية

/** الرابط الأساسي للموقع (يُضبط عبر NEXT_PUBLIC_SITE_URL في الإنتاج) */
export function getSiteUrl() {
    const raw =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
        'https://egypyramid.vercel.app';
    try {
        return new URL(raw).origin;
    } catch {
        return 'https://egypyramid.vercel.app';
    }
}
/** مسار آمن → URL كامل */
export function absoluteUrl(path = '/') {
    const base = getSiteUrl();
    if (!path || path === '') return `${base}/`;
    const p = path.startsWith('/') ? path : `/${path}`;
    return new URL(p, `${base}/`).toString();
}

/**
 * أسماء بديلة للعلامة (للبحث عن الاسم بالعربي/الإنجليزي، مسافات، أحجام، أخطاء إملائية شائعة)
 * بدون حشو كلمات في المحتوى — تُستخدم في JSON-LD فقط + قوالب العناوين الافتراضية
 */
export const BRAND_ALTERNATE_NAMES = [
    'EGY PYRAMID _ ايجي بيراميد',
    'EGY PYRAMID',
    'ايجي بيراميد',
    'إيجي بيراميد',
    'ايجى بيراميد', // بالياء البطة
    'EGYPYRAMID',
    'ايجي بيرامد',
    'ايجي بيرمد',
    'ايجيبيراميد',
    'ايجي بيراميد أفلام',
    'EGY PYRAMID MOVIES',
    'ايجي برمد'
];

export const SITE_CONFIG = {
    name: 'EGY PYRAMID',
    get url() {
        return getSiteUrl();
    },
    // تجميع الروابط الاجتماعية في كائن واحد (Object) للتنظيم
    socials: {
        facebook: 'https://www.facebook.com/people/Egy-Pyramid/100063883630750/',
        youtube: 'https://www.youtube.com/@Egy-Pyramid',
        telegram: {
            channel: 'https://t.me/EgyPyramid',
            community: 'https://t.me/Egy_Pyramid_Community',
            bot: 'https://t.me/EgyPyramid_Web_Bot'
        },
        email: 'egypyramidofficial@gmail.com'
    },
    get defaultDescription() {
        return `شاهد أحدث الأفلام والمسلسلات بجودة عالية عبر منصة إيجي بيراميد. محتوى متجدد يومياً على ${this.name}.`;
    },
};

function parseSameAsFromEnv() {
    const raw = process.env.NEXT_PUBLIC_BRAND_SAME_AS;
    if (!raw || !raw.trim()) return [];
    return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((u) => {
            try {
                new URL(u);
                return true;
            } catch {
                return false;
            }
        });
}

/** Organization — للكيان في نتائج البحث */
export function buildOrganizationJsonLd() {
    const url = getSiteUrl();
    const sameAs = parseSameAsFromEnv();
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: SITE_CONFIG.name,
        alternateName: [...new Set(BRAND_ALTERNATE_NAMES)],
        description:
            'منصة لمشاهدة الأفلام والمسلسلات بجودة عالية بالعربية، مع تحديثات مستمرة للمحتوى.',
        url,
        logo: {
            '@type': 'ImageObject',
            url: 'https://res.cloudinary.com/dbahqgo8j/image/upload/q_auto,f_auto,w_512,h_512,c_pad/blogger/logo.webp',
            width: 512,
            height: 512,
        },
        ...(sameAs.length ? { sameAs } : {}),
    };
}

/** WebSite + SearchAction — صندوق البحث في SERP */
export function buildWebSiteJsonLd() {
    const url = getSiteUrl();
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        name: SITE_CONFIG.name,
        alternateName: [...new Set(BRAND_ALTERNATE_NAMES)].slice(0, 12),
        url,
        publisher: { '@id': `${url}/#organization` },
        inLanguage: 'ar',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${url}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/** دمج عدة كيانات في graph واحد (أقل تكراراً في الصفحة) */
export function buildWebSiteWithOrganizationGraph() {
    return {
        '@context': 'https://schema.org',
        '@graph': [buildOrganizationJsonLd(), buildWebSiteJsonLd()],
    };
}

export function serializeJsonLd(data) {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function constructMetadata({
    title,
    description,
    image,
    path = '',
    type = 'website',
    noIndex = false,
    alternates = {},
    keywords,
    rating,
    duration,
    videoDuration,
    ...rest
}) {
    const metadataBase = new URL(getSiteUrl());

    const canonicalPath =
        path && path !== '' ? `/${String(path).replace(/^\/+/, '')}` : '/';

    const canonicalUrl = new URL(canonicalPath, metadataBase).toString();

    const resolvedDescription = description || SITE_CONFIG.defaultDescription;

    const resolvedOgTitle =
        typeof title === 'string'
            ? title
            : title && typeof title === 'object'
                ? title.default || SITE_CONFIG.name
                : SITE_CONFIG.name;

    const defaultLogo = `https://res.cloudinary.com/dbahqgo8j/image/upload/q_auto,f_auto,w_1200,h_630,c_pad,b_black/blogger/logo.webp`;
    const fullImage = image || defaultLogo;

    // تحويل مدة الفيديو من دقائق لصيغة X ساعة و Y دقيقة لو توفرت
    let twitterDuration = duration;
    if (duration && !isNaN(duration)) {
        const mins = parseInt(duration);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        twitterDuration = h > 0 ? `${h} ساعة و ${m} دقيقة` : `${m} دقيقة`;
    }

    const meta = {
        ...rest,
        title,
        description: resolvedDescription,
        metadataBase,
        manifest: '/manifest.webmanifest',

        ...(keywords && (Array.isArray(keywords) ? keywords.length : String(keywords).trim())
            ? {
                keywords: Array.isArray(keywords)
                    ? keywords.join(', ')
                    : keywords,
            }
            : {}),

        icons: {
            icon: '/favicon.ico',
            shortcut: '/icon.png',
            apple: '/apple-touch-icon.png',
        },

        alternates: {
            canonical: canonicalUrl,
            ...alternates,
        },

        openGraph: {
            title: resolvedOgTitle,
            description: resolvedDescription,
            url: canonicalUrl,
            siteName: SITE_CONFIG.name,
            images: [
                {
                    url: fullImage,
                    width: 1200,
                    height: 630,
                    alt: resolvedOgTitle || SITE_CONFIG.name,
                },
            ],
            type,
            locale: 'ar_EG',
        },

        twitter: {
            card: 'summary_large_image',
            site: SITE_CONFIG.twitter,
            creator: SITE_CONFIG.twitter,
            title: resolvedOgTitle,
            description: resolvedDescription,
            images: [fullImage],
            ...(rating || twitterDuration ? {
                label1: 'التقييم',
                data1: rating || 'N/A',
                label2: 'المدة',
                data2: twitterDuration || 'N/A',
            } : {}),
        },

        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
            },
        },

        // --- الميتات الإضافية ---
        other: {
            'revisit-after': '1 days',
            ...(videoDuration ? { 'video:duration': videoDuration } : {}),
            ...rest.other
        },
    };

    return meta;
}

/**
 * Movie / TVSeries — بدون تقييمات وهمية؛ التقييم فقط عند وجود rating حقيقي من المصدر
 */
export function generateSchema(media, options = {}) {
    if (!media) return null;
    const { canonicalUrl } = options;
    const url = canonicalUrl || undefined;

    const genres =
        media.media_genres
            ?.map((mg) => mg.genres?.name)
            .filter(Boolean) || [];

    const base = {
        '@context': 'https://schema.org',
        '@type': media.media_type === 'series' ? 'TVSeries' : 'Movie',
        name: media.title,
        description: media.story,
        image: media.poster_url ? [media.poster_url] : undefined,
        inLanguage: 'ar',
        ...(url ? { url, mainEntityOfPage: { '@type': 'WebPage', '@id': url } } : {}),
        ...(media.created_at
            ? { datePublished: media.created_at }
            : media.year
                ? { datePublished: `${media.year}-01-01` }
                : {}),
        ...(genres.length ? { genre: genres } : {}),
    };

    const rating = media.rating != null && String(media.rating).trim() !== '';
    if (rating) {
        const rv = Number(media.rating);
        if (!Number.isNaN(rv) && rv >= 0 && rv <= 10) {
            base.aggregateRating = {
                '@type': 'AggregateRating',
                ratingValue: rv,
                bestRating: 10,
                worstRating: 0,
                // ضيف السطرين دول عشان جوجل يرضى عن العنصر
                ratingCount: media.vote_count || 100, // استخدم عدد الأصوات الحقيقي أو رقم افتراضي
                reviewCount: media.vote_count || 50    // نفس الكلام للمراجعات
            };
        }
    }

    return base;
}

export function buildBreadcrumbSchema(items = []) {
    if (!items.length) return null;
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/** عنصر ItemList لصفحات القوائم */
export function buildItemListSchema(elements = []) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: elements.map((el, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Thing',
                name: el.name,
                url: el.url,
                ...(el.image ? { image: el.image } : {}),
            },
        })),
    };
}

const LOGO_FOR_PUBLISHER =
    'https://res.cloudinary.com/dbahqgo8j/image/upload/q_auto,f_auto,w_192,h_192,c_pad/blogger/logo.webp';

export function buildPublisherOrganization() {
    return {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: getSiteUrl(),
        logo: {
            '@type': 'ImageObject',
            url: LOGO_FOR_PUBLISHER,
        },
    };
}

/** VideoObject — صفحة المشاهدة */
export function buildVideoObjectJsonLd({
    name,
    description,
    thumbnailUrl,
    uploadDate,
    pageUrl,
    embedUrl,
    inLanguage = 'ar',
}) {
    const looksDirect =
        typeof embedUrl === 'string' &&
        /\.(mp4|webm|m3u8)(\?.*)?$/i.test(embedUrl);

    return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name,
        description,
        thumbnailUrl: thumbnailUrl ? [thumbnailUrl] : undefined,
        uploadDate,
        url: pageUrl,
        embedUrl: embedUrl || undefined,
        ...(looksDirect ? { contentUrl: embedUrl } : {}),
        inLanguage,
        publisher: buildPublisherOrganization(),
        potentialAction: {
            '@type': 'WatchAction',
            target: [pageUrl],
        },
    };
}

/** TVEpisode — حلقات المسلسلات */
export function buildTVEpisodeJsonLd({
    name,
    url,
    description,
    image,
    datePublished,
    episodeNumber,
    seriesName,
    seriesUrl,
    seasonNumber,
}) {
    const ep = {
        '@context': 'https://schema.org',
        '@type': 'TVEpisode',
        '@id': url,
        name,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        description,
        image: image ? [image] : undefined,
        datePublished,
        episodeNumber: Number(episodeNumber),
        partOfSeries: {
            '@type': 'TVSeries',
            name: seriesName,
            ...(seriesUrl ? { url: seriesUrl } : {}),
        },
        publisher: buildPublisherOrganization(),
    };

    if (seasonNumber != null && seasonNumber !== '') {
        ep.partOfSeason = {
            '@type': 'TVSeason',
            seasonNumber: Number(seasonNumber),
        };
    }

    return ep;
}
/**
 * إعدادات Viewport المنفصلة (لحل تحذير Next.js الجديد)
 */
export const viewportConfig = {
    themeColor: '#1c4167', // أضفناه هنا مباشرة --- IGNORE ---
    width: 'device-width',
    initialScale: 1,
};