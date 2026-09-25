// src/proxy.js
// ─────────────────────────────────────────────────────────────────────────────
// "High-Security Gatekeeper" — EGY PYRAMID
// Next.js 16 · Edge Runtime · 2026
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
// ─── Ratelimit ───────────────────────────────────────────────────────────
const redis = Redis.fromEnv();

// ذاكرة محلية لتخزين الـ IPs المحظورة مؤقتاً (توفير Commands لـ Upstash)
const localBannedCache = new Map();
const MAX_BODY_SIZE = 1024 * 100; // 100KB كحد أقصى للطلبات العادية

// 1. رادار الثانية: يمنع الانفجارات البرمجية اللحظية
const instantLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 s"), // 3 طلبات في الثانية الواحدة
    prefix: "rl_instant",
});

// 2. رادار الدقيقة: "بحر" للزائر الحقيقي لمنع الحظر الزائف أثناء التنقل السريع
const shortTermLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"), // 60 طلب في الدقيقة الواحدة
    prefix: "rl_short",
});

// 3. رادار الساعة: "المصيدة" للبوت الصبور وتأمين تصفح المسلسلات الطويلة
const longTermLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 h"), // 200 طلب في الساعة الواحدة
    prefix: "rl_long",
});

// 4. رادار البحث اللحظي: براح للكتابة ومنع للانفجار أثناء تحديث النتائج
const searchInstantLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(6, "6 s"), // 6 طلبات في 6 ثواني
    prefix: "rl_search_instant",
});

// 5. رادار البحث المتوسط: يمنع التنقيب المستمر وتكرار الاستعلامات
const searchShortLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(25, "1 m"), // 25 طلب في الدقيقة الواحدة
    prefix: "rl_search_short",
});

// 6. رادار البحث الطويل: "القفل" النهائي للبوت الصبور الذي يبحث عن كامل محتوى الموقع
const searchLongLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 h"), // 60 طلب في الساعة الواحدة
    prefix: "rl_search_long",
});

// اسمح للبوت بـ 50 طلب في كل 5 ثواني (هذا رقم عادل جداً لأي بوت)
const pgNetLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "5 s"),
    prefix: "rl_pgnet",
});

// ─── Matcher Config ───────────────────────────────────────────────────────────

export const config = {
    matcher: [
        "/api/:path*",
        /*
         * استثناء كل الملفات الثابتة والأيقونات لتجنب تشغيل الميدل وير عليها بلا داعي
         */
        "/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.*|.*\\.(?:png|jpg|jpeg|webp|avif|ico|svg)).*)",
    ],
};

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Static files that are allowed to pass through.
 * Any other .txt, .json, or system path will be 404ed immediately.
 */
const WHITELISTED_STATIC_PATHS = new Set([
    "/robots.txt",
    "/ads.txt",
    "/sitemap.xml",
    "/manifest.json",
    "/manifest.webmanifest",
    "/sellers.json", // أضفه هنا إذا كان موجوداً فعلياً في public
]);

const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://egypyramid.vercel.app"
).replace(/\/+$/, "");

/** Known scraping libraries — matched against lowercased User-Agent */
const BAD_BOT_SIGNATURES = [
    "scrapy",
    "python-requests",
    "python-urllib",
    "curl/",
    "wget/",
    "libwww-perl",
    "go-http-client",
    "java/",
    "httpclient",
    "axios/",
    "node-fetch",
    "php/",
    "ruby",
    "perl/",
    "aiohttp",
    "okhttp",
    "postmanruntime",
    "pycurl",
    "mechanize",
    "lwp-trivial",
    "urllib",
    "httpx",
    "httpie",
    "got/",
    "superagent",
    "request/",
    "undici/",
    "headlesschrome",
    "puppeteer",
    "playwright",
    "selenium",
    "webdriver",
    "phantomjs",
    "cheerio",
    "cypress",
    "fasthttp",
    "golang",
    "rust-http",
    "zgrab",
    "hackney",
    "libcurl",
    "ptst",
];
/**
 * Legitimate crawlers that must NEVER be blocked.
 * Checked BEFORE any other rule — if matched, request passes immediately.
 */
const GOOD_BOT_SIGNATURES = [
    "googlebot",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "twitterbot",
    "linkedinbot",
    "applebot",
    "ia_archiver",
    "archive.org",
    "semrushbot",
    "ahrefsbot",
    "mj12bot",
    "dotbot",
    "petalbot",
    "lighthouse",
    "googleother",
    "google-inspection",
    "adsbot-google",
    "mediapartners-google",
    "vercel-favicon",
    "vercel-favicon/1.0",
    "googlebot-image",
    "googlebot-video",
    "google-read-aloud",
    "google-snippet",
    "adsbot-google-mobile",
    "google-lens",
    "GoogleAssociationService", // 👈 أضف هذا السطر هنا ليتمكن بوت جوجل من فحص روابط التطبيقات
    "google-site-verification", // 👈 أضف هذا السطر هنا بدقة للسماح لبوت أرشفة وتوثيق جوجل بالدخول بدون حظر 403
    "facebot",
    "facebookexternalhit",
    "meta-externalagent",
    "meta-webindexer", // البوت الذي ظهر في اللوج الخاص بك (Meta AI)
    "meta-externalads", // البوت المسؤول عن تحسين الإعلانات والمنتجات التجارية
    "meta-externalfetcher", // البوت المسؤول عن تصفح الروابط بناءً على طلب المستخدم المباشر
    "networkingextension",
    "apple-touch-icon",
    "vercel-screenshot",
    "chatgpt-user",
    "oai-searchbot",
    "yandex",
    "gptbot",
    "claudebot",
    "WhatsApp",
    "grok",
    "xai",
    "grok-bot",
    "chatgpt-user",
    "oai-searchbot",
    "anthropic",
    "claude-web",
    "perplexity",
    "youbot",
    "ai-assistant",
];
// meta-webindexer/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)
/**
 * Chrome major versions that are not publicly released and strongly indicate
 * spoofed User-Agents. Update this list as new spoofing waves emerge.
 */
const SUSPICIOUS_CHROME_VERSIONS = new Set([
    "136",
    "131",
    "137",
    "138",
    "139",
    "140",
    "141",
    "142",
    "143",
    "144",
    "145",
    "146",
    "147",
    "148",
]);

/** API paths that require Bearer auth */
const PROTECTED_API_PATHS = ["/api/indexing"];

/**
 * Sensitive frontend paths.
 * Requests to these must either:
 *   a) Come from an internal Referer, OR
 *   b) Be a fresh browser navigation (no Referer) — allowed, but honey-pot
 *      logic will score them.
 * Direct programmatic access without a matching Referer earns suspect points.
 */
const SENSITIVE_PATHS = ["/privacy-policy", "/dmca"];

/** Download path prefix — receives the strictest Referer enforcement */
const DOWNLOAD_PATH_PREFIX = "/download";

// ─── CSP Builder ─────────────────────────────────────────────────────────────

function buildCSP() {
    const directives = {
        "default-src": ["'self'"],

        "connect-src": [
            "'self'",
            SITE_URL,
            "https:", // يحل مشكلة اتصالات الإعلانات الديناميكية
            "wss://*.supabase.co", // سيرفراتك الخاصة محمية بدقة
            "wss://*.pusher.com",
        ],

        "script-src": [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https:", // يسمح بتشغيل ملفات الإعلانات البرمجية الآمنة
        ],

        "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
        ],

        "font-src": [
            "'self'",
            "data:",
            "https://fonts.gstatic.com",
            "https://*.vercel.com",
            "https://vercel.live",
            "https://*.vercel.live",
        ],

        "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https:", // اختصار لكل القائمة الطويلة! الصور لا تشكل خطراً برمجياً
        ],

        "media-src": ["*", "data:", "blob:"], // ممتاز، يضمن تشغيل الفيديو من أي مكان

        "frame-src": [
            "'self'",
            "https:", // يحل مشكلة تغير نطاقات Mixdrop, Doodstream, Streamtape و Voe للأبد!
        ],

        "frame-ancestors": ["'self'", "https://*.blogspot.com"], // ممتاز لحماية موقعك من الـ Iframe التخريبي

        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
    };

    return Object.entries(directives)
        .map(([key, vals]) => (vals.length ? `${key} ${vals.join(" ")}` : key))
        .join("; ");
}

// ─── Security Headers ─────────────────────────────────────────────────────────
function applySecurityHeaders(response) {
    const h = response.headers; // 👈 لازم التعريف يكون الأول
    h.set("x-middleware-cache", "no-cache"); // 👈 بعدين الاستخدام
    h.set("Content-Security-Policy", buildCSP());
    // NOTE: HSTS is also set in next.config.js for non-dev. Setting it here
    // too is safe — Edge will win and it covers all environments.
    h.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
    );
    h.set("X-Content-Type-Options", "nosniff");
    h.set("Referrer-Policy", "strict-origin-when-cross-origin");
    h.set("X-Frame-Options", "SAMEORIGIN");
    h.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), picture-in-picture=*, screen-wake-lock=*, autoplay=*, encrypted-media=*",
    );
    h.set("X-XSS-Protection", "1; mode=block");
    return response;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fast 403 JSON — reused shape everywhere */
const forbidden = (msg = "Forbidden", request) => {
    const url = request?.nextUrl?.pathname || "unknown";
    const ua = request?.headers?.get("user-agent") || "no-ua";

    console.warn(`🛡️ Proxy Block [403]: ${msg} | Path: ${url} | UA: ${ua}`);

    return new NextResponse(`Access Denied: ${msg}`, {
        status: 403,
        headers: {
            "Content-Type": "text/plain",
            // كاش للرد ده لمدة 60 ثانية على الـ Edge
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
            Vary: "User-Agent", // 👈 سطر جوهري لمنع خدمة الـ 403 للمستخدمين الحقيقيين بالخطأ
            "x-block-reason": msg, // اختياري للتشخيص
        },
    });
};
/** Is the Referer header coming from our own site? */
function isInternalReferer(request) {
    const referer = request.headers.get("referer") || "";
    if (!referer) return false;
    try {
        return new URL(referer).origin === new URL(SITE_URL).origin;
    } catch {
        return false;
    }
}

// ─── 1. Good-Bot Allow-list ───────────────────────────────────────────────────

/**
 * Returns true if the UA belongs to a trusted crawler.
 * These bypass ALL subsequent checks.
 */
function isGoodBot(ua) {
    const lower = ua.toLowerCase();
    return GOOD_BOT_SIGNATURES.some((sig) => lower.includes(sig));
}

// ─── 2. Known-Bad Bot Signatures ─────────────────────────────────────────────

function hasKnownBadSignature(ua) {
    const lower = ua.toLowerCase();
    return BAD_BOT_SIGNATURES.some((sig) => lower.includes(sig));
}

// ─── 3. UA Sanity / Spoofing Detection ───────────────────────────────────────

/**
 * Detects spoofed "modern browser" UAs by cross-referencing headers that
 * real browsers always send alongside a modern User-Agent.
 *
 * Score increments:
 *   +2  — UA claims mobile Chrome but sec-ch-ua is absent
 *   +2  — UA claims Chrome but sec-fetch-site / sec-fetch-mode absent
 *   +1  — UA claims Chrome but accept-language absent
 *   +2  — Chrome version is in our suspicious-version set
 *   +1  — UA claims Windows + mobile (impossible combo)
 *
 * Threshold ≥ 3 → treat as bot.
 */
function uaSpoofScore(request, pathname) {
    const ua = request.headers.get("user-agent") || "";
    const uaLow = ua.toLowerCase();
    const { searchParams } = request.nextUrl; // 👈 سحب البارامترز من الرابط
    let score = 0;

    // 1. القعدة الذهبية: المتصفحات البشرية تبدأ بـ Mozilla/
    // إذا لم يبدأ بـ Mozilla ولم يكن Googlebot (اللي استثنيناه فوق)، ارفع السكور فوراً
    if (!ua.startsWith("Mozilla/") && ua !== "") {
        score += 3; // حظر فوري (Threshold >= 3)
    }
    // 🛡️ منطق "الثقة المكتسبة": لو الزائر جاي من منصة كبيرة، اديله رصيد إيجابي
    // fbclid (Facebook), gclid (Google Ads), tclid (Telegram - if used)
    // 🛡️ منطق "الثقة المكتسبة": أي زائر جاي من رابط تتبع (Marketing/Social)
    const trustMarkers = [
        "fbclid",
        "gclid",
        "utm_source",
        "utm_medium",
        "msclkid",
    ];

    if (trustMarkers.some((marker) => searchParams.has(marker))) {
        score -= 1;
    }
    // صيد مباشر لأدوات الـ Headless التي لا تغير الـ UA بالكامل
    if (uaLow.includes("headlesschrome")) score += 5;

    const isMobileClaim = /mobile|android/i.test(ua);
    const isChromeClaim = /chrome\//i.test(ua);
    const isWindowsClaim = /windows nt/i.test(ua);

    if (isChromeClaim) {
        // 1. المتصفحات الحقيقية ترسل Sec-Fetch headers في طلبات الصفحات
        if (!pathname.startsWith("/api/")) {
            if (!request.headers.get("sec-fetch-site")) score += 2;
            if (!request.headers.get("sec-fetch-mode")) score += 1;
            if (!request.headers.get("sec-fetch-dest")) score += 1;
        }

        // 2. المتصفحات الحقيقية ترسل دائماً Accept-Language (بأي لغة كانت)
        // البوتات الخام غالباً لا ترسل هذا الهيدر نهائياً
        if (!request.headers.get("accept-language")) {
            score += 2;
        }

        // 3. كروم الحديث (خاصة الموبايل) يرسل Sec-CH-UA بشكل أساسي
        if (!request.headers.get("sec-ch-ua")) {
            score += 1;
        }

        // 4. فحص النسخ المشبوهة (مثل نسخة 141 التي ظهرت في اللوج)
        const chromeMatch = ua.match(/Chrome\/(\d+)/i);
        if (chromeMatch && SUSPICIOUS_CHROME_VERSIONS.has(chromeMatch[1])) {
            score += 1;
        }
    }

    // تزييف مستحيل: ويندوز وموبايل في نفس الوقت
    if (isWindowsClaim && isMobileClaim) {
        score += 2;
    }

    // ✅ الرادار: طباعة المحاولات المشبوهة في اللوجات قبل إرجاع النتيجة
    if (score > 0) {
        console.log(
            `🔍 [Suspicious Check] Path: ${pathname} | Score: ${score} | UA: ${ua}`,
        );
    }

    return score;
}

// ─── 4. Rate / Honey-Pot Logic ────────────────────────────────────────────────

/**
 * Honey-pot score for /privacy-policy and other sensitive non-API paths.
 *
 * Edge Functions are stateless so we can't track IPs across invocations.
 * Instead we score the SINGLE request we have in front of us:
 *
 *   +3  — No Referer AND no Accept header (headless fetch)
 *   +2  — Accept header is exactly `* / *` (curl/wget default)
 *   +2  — No sec-fetch-dest (real browsers always set it)
 *   +1  — X-Forwarded-For contains multiple hops (proxy chain)
 *   +1  — No accept-encoding
 *
 * Threshold ≥ 3 → 403.
 */
function honeypotScore(request) {
    let score = 0;
    const referer = request.headers.get("referer") || "";
    const accept = request.headers.get("accept") || "";
    const secDest = request.headers.get("sec-fetch-dest") || "";
    const xff = request.headers.get("x-forwarded-for") || "";
    const encoding = request.headers.get("accept-encoding") || "";

    if (!referer && !accept) score += 3;
    if (accept === "*/*") score += 2;
    if (!secDest) score += 2;
    if (!encoding) score += 1;
    if (xff.split(",").length > 2) score += 1; // more than 2 proxy hops is suspicious

    return score;
}

// ─── 5. CORS Handler ──────────────────────────────────────────────────────────

function handleCORS(request, response) {
    const origin = request.headers.get("origin") || "";

    if (request.method === "OPTIONS") {
        const preflight = new NextResponse(null, { status: 204 });
        preflight.headers.set("Access-Control-Allow-Origin", SITE_URL);
        preflight.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        preflight.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        );
        preflight.headers.set("Access-Control-Max-Age", "86400");
        return { blocked: false, response: preflight };
    }

    if (origin && origin !== SITE_URL) {
        return {
            blocked: true,
            response: NextResponse.json(
                { error: "CORS: Origin not allowed" },
                { status: 403 },
            ),
        };
    }

    response.headers.set("Access-Control-Allow-Origin", SITE_URL);
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Vary", "Origin");
    return { blocked: false, response };
}

// ─── 6. API Auth Guard ────────────────────────────────────────────────────────

function guardIndexingAPI(request) {
    const secret = process.env.INDEXING_SECRET;
    const authHeader = request.headers.get("authorization") || "";

    if (!secret) {
        return NextResponse.json(
            { error: "Server misconfiguration" },
            { status: 500 },
        );
    }

    const expected = `Bearer ${secret}`;
    // Constant-time comparison to avoid timing attacks
    if (authHeader.length !== expected.length || authHeader !== expected) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null;
}

// ─── Main Proxy Function ──────────────────────────────────────────────────────
// 🛡️ القائمة السوداء الثابتة (مخصصة لعناوين الخوادم السحابية فقط Data Centers)
const BLOCKED_IPS = [
    "23.168.24.18", // Tritan
    "152.53.18.243", // netcup
    "159.195.65.124", // Hetzner
    // "51.36.42.148" // t13d2013h2_a09f3c656075_7f
];

// 🛡️ بصمات السكريبتات الآلية (السلاح المضاد للـ IPs المنزلية والديناميكية)
const BLOCKED_JA4 = [
    "t13d1717h1_5b57614c22b0_3c", // بصمة السكريبت المهاجم
    // "t13d1516h2_8daaf6152771_d8a2da3f94cd",
    // "t13d2013h2_a09f3c656075_7f0f34a4126d",
    // "t13d2013h2_a09f3c656075_7f"
];

export async function proxy(request) {
    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const ja4Digest = request.headers.get("x-vercel-ja4-digest") || "No-JA4";
    const ua = request.headers.get("user-agent") || "";
    const uaLow = ua.toLowerCase();

    // 🛡️ [Hard Block] البوابة الأمنية الموحدة: صد فوري للـ IPs والبصمات
    const isBannedJA4 =
        ja4Digest !== "No-JA4" &&
        BLOCKED_JA4.some((banned) => ja4Digest.startsWith(banned));

    if (BLOCKED_IPS.includes(ip) || isBannedJA4) {
        console.log(
            `🛑 Blocked by Hard-Block-Policy: IP ${ip} | JA4 ${ja4Digest}`,
        );

        localBannedCache.set(ip, {
            expiry: Date.now() + 24 * 60 * 60 * 1000,
            reason: "Blacklisted IP/JA4 Signature",
        });

        return new Response("Access Denied", { status: 403 });
    }

    // 🔍 طباعة تفاصيل الزائر للتحليل في Vercel Logs
    console.log(`🔍 [Incoming] IP: ${ip} | JA4: ${ja4Digest} | UA: ${ua}`);
    // 🛡️ ممر سريع وآمن لـ Loader.io
    if (
        request.nextUrl.pathname.startsWith("/loaderio-") ||
        uaLow.includes("loader.io")
    ) {
        return applySecurityHeaders(NextResponse.next());
    }
    const { pathname } = request.nextUrl;

    // 🛡️ [White-List Shield] استثناءات فورية للأنظمة الصديقة قبل أي فحص أمني
    const authHeader = request.headers.get("authorization") || "";
    const isIndexingAuth =
        authHeader === `Bearer ${process.env.INDEXING_SECRET}`;

    // 1. استثناء الأنظمة الصديقة (pg_net) - بحد أقصى مسموح (مثلاً 50 طلب في 5 ثواني)
    if (uaLow.includes("pg_net")) {
        const pgNetRes = await pgNetLimit.limit(ip);

        // إذا تخطى الحد المسموح
        if (!pgNetRes.success) {
            // حظر لمدة 60 ثانية فقط ثم يفك تلقائياً
            await redis.set(`banned:${ip}`, "active", { ex: 60 });

            console.log(`🛑 pg_net Banned for 60s due to burst: IP ${ip}`);

            return new Response(
                JSON.stringify({
                    error: "Rate limit exceeded. Cooling down 60s",
                }),
                {
                    status: 429,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        return applySecurityHeaders(NextResponse.next());
    }

    // تمرير بقية الأنظمة الصديقة كالمعتاد
    if (
        isIndexingAuth ||
        uaLow.includes("telegrambot") ||
        uaLow.includes("egypyramid-internal-bot") ||
        uaLow.includes("cron-job.org")
    ) {
        return applySecurityHeaders(NextResponse.next());
    }

    // 2. تمرير جميع مسارات الـ API بأمان (باستثناء البحث والمصيدة لضمان عدم اختراق النظام)
    if (
        pathname.startsWith("/api/") &&
        !pathname.startsWith("/api/search") &&
        pathname !== "/api/admin-v2" &&
        pathname !== "/api/v1/system-sync"
    ) {
        return applySecurityHeaders(NextResponse.next());
    }

    // 3. استثناء ملفات الـ SEO الأساسية من أي فحص أمني
    if (
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml" ||
        pathname === "/ads.txt" ||
        pathname === "/manifest.json" ||
        pathname.includes("favicon")
    ) {
        return applySecurityHeaders(NextResponse.next());
    }

    // 4. استثناء محركات البحث الرسمية (Good Bots) قبل أي فحص هيدر
    if (typeof isGoodBot === "function" && isGoodBot(ua)) {
        return applySecurityHeaders(NextResponse.next());
    }

    // 🛡️ [Anti-Scraper Shield] كشف السكريبتات التي تزيف الـ User-Agent
    let isScraper = false;

    const acceptLang = request.headers.get("accept-language");
    const secChUa = request.headers.get("sec-ch-ua");

    // 1. المتصفحات الحقيقية ترسل Accept-Language. 
    // نستثني الـ UA الناقص أو اللي شكله AI/Tool عشان ما نمنعش المساعدين الشرعيين
    const isIncompleteMozilla = ua.startsWith("Mozilla/") && ua.length < 80 && !ua.includes("Chrome/") && !ua.includes("Firefox/") && !ua.includes("Safari/");
    
    if (!acceptLang && !isIncompleteMozilla) {
        isScraper = true;
    }

    // 2. كشف تزييف الكروم (نسخة مخففة)
    // بنحظر فقط لو ادعى إنه كروم + مفيش sec-ch-ua + وفي نفس الوقت مفيش Accept-Language أو شكله مشبوه
    // عشان نسمح للأدوات الشرعية اللي بتبعت UA كروم من غير Client Hints
    if (ua.includes("Chrome/") && !secChUa) {
        const chromeVerMatch = ua.match(/Chrome\/(\d+)/);
        const isModernChrome = chromeVerMatch && parseInt(chromeVerMatch[1]) > 110;
        
        // لو كروم حديث + مفيش sec-ch-ua + ومفيش Accept-Language → سكريبر
        // لو معاه Accept-Language يبقى نسيبه يعدي والـ uaSpoofScore يتصرف معاه
        if (isModernChrome && !acceptLang) {
            isScraper = true;
        }
    }

    // 3. 🚨 كشف تزييف الآيفون وسفاري (إصياد البوت المتسلل لصفحات الـ watch)
    // سكريبتات الكشط الذكية تضع User-Agent لآيفون وسفاري، لكنها أحياناً تُسرب هيدرات الكروم بالخطأ،
    // أو تستخدم مكتبات Chromium مدمجة مع تعديل الاسم فقط. متصفح سفاري الحقيقي على الآيفون مستحيل أن يرسل sec-ch-ua.
    if (uaLow.includes("iphone") && !uaLow.includes("crios") && secChUa) {
        isScraper = true;
    }

    // إذا تم اكتشاف أنه بوت، قم بصدّه فوراً قبل أن يستهلك موارد Upstash
    if (isScraper) {
        console.log(
            `🛑 Blocked Scraper (Header Mismatch): IP ${ip} | UA ${ua}`,
        );
        // يمكنك هنا أيضاً إضافته فوراً إلى localBannedCache لتخفيف الضغط
        localBannedCache.set(ip, {
            bannedAt: Date.now(),
            expiration: Date.now() + 30 * 60 * 1000,
            reason: "Scraper Header Mismatch",
        });
        return new Response("Access Denied", { status: 403 });
    }

    // 1. جلب البصمة وطباعتها في اللوج (للمراقبة والتحليل مستقبلاً)
    if (ja4Digest) console.log("MY_JA4_FINGERPRINT:", ja4Digest);

    // 🛡️ [Local Memory Shield] فحص فوري للـ IP إذا كان محظوراً محلياً
    if (localBannedCache.has(ip)) {
        const data = localBannedCache.get(ip);
        const now = Date.now();

        if (now < data.expiry) {
            const remainingMs = data.expiry - now;
            const minutes = Math.ceil(remainingMs / (60 * 1000));

            const arabicMsg = `عذراً، تم تقييد وصولك مؤقتاً لحماية الموقع.`;
            const englishMsg = `Access restricted for ${minutes} min(s).`;
            const reasonMsg = `السبب: ${data.reason || "نشاط غير طبيعي"}`;

            return new NextResponse(
                `🛡️ [system security]\n\n` +
                    `${arabicMsg}\n` +
                    `${reasonMsg}\n\n` +
                    `${englishMsg}\n` +
                    `Reason: ${data.reason || "Unusual activity"}\n\n` +
                    `Remaining time: ${minutes} minute(s).`,
                {
                    status: 429,
                    headers: {
                        "Retry-After": (minutes * 60).toString(),
                        "Content-Type": "text/plain; charset=utf-8",
                    },
                },
            );
        }
        localBannedCache.delete(ip);
    }

    // 🛡️ [Bot Signature Hardening] حظر فوري للبوتات المعروفة بالهجوم السريع وكشط المحتوى
    if (
        (uaLow.includes("ptst") || uaLow.includes("headlesschrome")) &&
        (pathname.includes("search") || pathname.startsWith("/api/"))
    ) {
        // سجن الـ IP محلياً لمدة 30 دقيقة لحماية خوادم Upstash و Vercel من الضرب المتتابع
        localBannedCache.set(ip, {
            expiry: Date.now() + 30 * 60 * 1000,
            reason: "Scraping Tool Blocked",
        });
        return new Response("Access Denied", { status: 403 });
    }

    // 🛡️ [Edge Abort] حماية ملفات النظام
    // 🛡️ [Edge Abort] حظر فوري وموسع لأي محاولة وصول لملفات النظام، المفاتيح، أو المجلدات المخفية
    const lowerPath = pathname.toLowerCase();
    if (
        lowerPath.includes("/.env") ||
        lowerPath.includes("/.git") ||
        lowerPath.includes("/.cursor") ||
        lowerPath.includes("/.openai") ||
        lowerPath.includes("credentials") ||
        (lowerPath.endsWith(".json") && !lowerPath.includes("manifest.json"))
    ) {
        console.log(
            `🛑 Hard Blocked Sensitive File Access: IP ${ip} | Path ${pathname}`,
        );
        localBannedCache.set(ip, {
            expiry: Date.now() + 24 * 60 * 60 * 1000,
            reason: "Attempted to read restricted system files or keys",
        });
        return new Response("Access Denied", { status: 403 });
    }

    const isSystemPath = pathname.startsWith("/.well-known/");
    const isStaticFile = /.(txt|json|webmanifest)$/i.test(pathname);

    if (isSystemPath || isStaticFile) {
        if (!WHITELISTED_STATIC_PATHS.has(pathname)) {
            return new NextResponse(null, { status: 404 });
        }
    }

    // 1. بيئة التطوير: تمرير كل شيء
    if (process.env.NODE_ENV === "development") {
        return NextResponse.next();
    }

    // 🛡️ [Fail-fast] بعد الاستثناءات: الصد المبكر للبقية
    if (!ua || ua.length < 10) return forbidden("Malformed Request", request);

    // 🛡️ [Fail-fast] 2: فحص الـ Body Size للطلبات التي تحمل بيانات (POST/PUT)
    const contentLength = parseInt(
        request.headers.get("content-length") || "0",
    );
    if (
        ["POST", "PUT", "PATCH"].includes(request.method) &&
        contentLength > MAX_BODY_SIZE &&
        !pathname.startsWith("/api/admin")
    ) {
        return forbidden("Payload Too Large", request);
    }

    // 5. 🛡️ حماية الملفات النصية من البوتات "المشبوهة فقط"
    // (هنا لن يدخل جوجل لأنه تم تمريره في الخطوة السابقة)
    if (pathname.endsWith(".xml") || pathname.endsWith(".txt")) {
        if (uaSpoofScore(request, pathname) >= 3) {
            return forbidden("Shield: Access denied to system files", request);
        }
    }
    // 🍯 المصيدة المتقدمة (Honeypot Trap): صيد وحظر السكريبتات الغبية قبل استهلاك موارد الرادار
    if (
        pathname === "/api/admin-v2" ||
        pathname === "/wp-login.php" ||
        pathname === "/api/v1/system-sync"
    ) {
        console.log(
            `🍯 HONEYPOT TRIGGERED! Scraper Caught: IP ${ip} | UA ${ua}`,
        );

        try {
            await redis.set(`banned:${ip}`, "active", { ex: 2592000 });
        } catch (e) {
            console.error("Redis Failed on Honeypot", e);
        }

        localBannedCache.set(ip, {
            expiry: Date.now() + 24 * 60 * 60 * 1000,
            reason: "Caught in Honeypot (Scraper Bot)",
        });

        return new NextResponse(
            JSON.stringify({ status: "success", data: [] }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    // 6. ── منظومة الحماية (Upstash / Redis) ──
    try {
        // 1. فحص هل الـ IP مسجون حالياً؟
        const banTTL = await redis.ttl(`banned:${ip}`);
        if (banTTL > 0) {
            const minutesLeft = Math.ceil(banTTL / 60);

            const arabicMsg = `عذراً، تم تقييد وصولك مؤقتاً لحماية الموقع.`;
            const englishMsg = `Access restricted for ${minutesLeft} min(s).`;

            return new NextResponse(
                `🛡️ [system security]\n\n` +
                    `${arabicMsg}\n` +
                    `السبب: تم اكتشاف نشاط مفرط مسبقاً\n\n` +
                    `${englishMsg}\n` +
                    `Reason: Previous excessive activity detected\n\n` +
                    `Remaining time: ${minutesLeft} minute(s).`,
                {
                    status: 429,
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                },
            );
        }

        // 2. تجهيز الوعود (Promises)
        const limitPromises = [
            instantLimit.limit(ip),
            shortTermLimit.limit(ip),
            longTermLimit.limit(ip),
        ];

        // 3. إضافة رادارات البحث الثلاثة "فقط" لو المسار بحث
        const isSearchPath =
            pathname.startsWith("/api/search") || pathname === "/search";
        if (isSearchPath) {
            limitPromises.push(searchInstantLimit.limit(ip));
            limitPromises.push(searchShortLimit.limit(ip));
            limitPromises.push(searchLongLimit.limit(ip));
        }

        const results = await Promise.all(limitPromises);

        // 4. تفكيك النتائج بدقة (التفكيك حسب الترتيب)
        const [instRes, shRes, loRes, sInstRes, sShRes, sLoRes] = results;

        // تحديد هل فشل أي رادار عام أو رادار بحث
        const generalFailed =
            !instRes.success || !shRes.success || !loRes.success;
        const searchFailed =
            isSearchPath &&
            sInstRes &&
            (!sInstRes.success || !sShRes.success || !sLoRes.success);

        if (generalFailed || searchFailed) {
            let reason = "";

            // 🕵️ استخدام مصطلحات وصفية بدلاً من الأرقام الرياضية لتعمية صاحب البوت
            if (searchFailed) {
                if (!sInstRes.success) reason = "تكرار البحث بشكل آلي سريع";
                else if (!sShRes.success) reason = "نشاط بحث مكثف غير طبيعي";
                else reason = "تجاوز الحد المسموح به لعمليات البحث";
            } else {
                if (!instRes.success) reason = "تتابع نقرات سريع (تصفح آلي)";
                else if (!shRes.success) reason = "معدل استهلاك مرتفع للموارد";
                else reason = "تجاوز حصة الاستخدام العادل";
            }

            // تسجيل المخالفة وحساب العقوبة التصاعدية
            const violations = await redis.incr(`record:${ip}`);
            await redis.expire(`record:${ip}`, 86400);

            // وضع سقف أقصى للمخالفات (مثلاً 50 مخالفة كحد أقصى للحساب البرمي)
            const cappedViolations = Math.min(violations, 50);
            const penaltyMinutes = cappedViolations * 2; // أقصى مدة حظر ستكون 100 دقيقة ولن تنكسر المعادلة أبداً

            // تنفيذ الحظر المركزي والمحلي
            await redis.set(`banned:${ip}`, "active", {
                ex: penaltyMinutes * 60,
            });

            localBannedCache.set(ip, {
                expiry: Date.now() + penaltyMinutes * 60 * 1000,
                reason: reason,
            });

            // 📝 رسالة احترافية غامضة لصاحب البوت وواضحة للمستخدم العادي
            const penaltyMsg =
                `🛡️ [system security]\n\n` +
                `تم تقييد الوصول مؤقتاً لمدة ${penaltyMinutes} دقيقة.\n` +
                `السبب: ${reason}.\n\n` +
                `Access restricted for ${penaltyMinutes} min(s) due to: Unusual Activity.`;

            return new NextResponse(penaltyMsg, {
                status: 429,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
            });
        }
    } catch (error) {
        console.error("⚠️ Upstash Fail-safe Triggered:", error.message);

        // إذا سقطت Upstash تحت الضغط، نقوم بحظر هذا الـ IP محلياً في الـ Edge لمدة دقيقتين احتياطياً
        // لمنعه من استغلال الـ Fail-open لتمرير هجومه
        localBannedCache.set(ip, {
            expiry: Date.now() + 2 * 60 * 1000,
            reason: "Resource Lock Protection",
        });

        // تمرير الطلب الحالي فقط، ولكن الطلب القادم بعد فمتوثانية سيصطدم بالـ localBannedCache فوق ويقف!
        return applySecurityHeaders(NextResponse.next());
    }

    // ── STEP 1: Block known scraping library signatures ───────────────────────
    if (hasKnownBadSignature(ua)) {
        return forbidden("Forbidden: bad bot", request);
    }

    // ── STEP 2: UA spoof detection
    if (!pathname.startsWith("/api/")) {
        if (uaSpoofScore(request, pathname) >= 3) {
            return forbidden("Forbidden: suspicious client", request);
        }
    }
    // ── STEP 3: Download path protection ─────────────────────────────────────
    if (pathname.includes(DOWNLOAD_PATH_PREFIX)) {
        if (!isInternalReferer(request)) {
            const hScore = honeypotScore(request);
            if (hScore >= 3) {
                return forbidden(
                    "Forbidden: direct download access denied",
                    request,
                );
            }
        }
        if (uaSpoofScore(request, pathname) >= 3) {
            return forbidden(
                "Forbidden: suspicious client on download path",
                request,
            );
        }
    }

    // ── STEP 4: Sensitive frontend pages honey-pot ────────────────────────────
    if (SENSITIVE_PATHS.some((p) => pathname.startsWith(p))) {
        const hScore = honeypotScore(request);
        if (hScore >= 3) {
            return forbidden("Forbidden: automated access detected", request);
        }
    }

    // ── STEP 5: API-specific guards ───────────────────────────────────────────
    if (pathname.startsWith("/api/")) {
        // 5a. Bad-bot check on API (UA spoof is less reliable in API context,
        //     but signature check already ran in STEP 1)

        // 5b. Protected indexing endpoint — CORS + auth
        if (PROTECTED_API_PATHS.some((p) => pathname.startsWith(p))) {
            const tempResponse = NextResponse.next();
            const corsResult = handleCORS(request, tempResponse);

            if (corsResult.blocked) return corsResult.response;
            if (request.method === "OPTIONS") return corsResult.response;

            const authError = guardIndexingAPI(request);
            if (authError) return authError;
        }
    }

    // ── STEP 6: Apply security headers to every passing request ───────────────
    return applySecurityHeaders(NextResponse.next());
}
