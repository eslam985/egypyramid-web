import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const API_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/indexing`;
const SECRET = process.env.INDEXING_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const LOG_FILE = "indexed_urls.txt";

async function archiveEverything() {
    let indexedUrls = [];
    if (fs.existsSync(LOG_FILE)) {
        indexedUrls = fs
            .readFileSync(LOG_FILE, "utf8")
            .split("\n")
            .filter(Boolean);
    }

    let allUrls = [];

    allUrls.push(`${BASE_URL}/`);
    allUrls.push(`${BASE_URL}/genre`);
    allUrls.push(`${BASE_URL}/movie`);
    allUrls.push(`${BASE_URL}/tv`);

    const genreMapping = {
        رومنسية: { name: "رومانسي", slug: "romance" },
        رومانسي: { name: "رومانسي", slug: "romance" },
        حركة: { name: "أكشن", slug: "action" },
        أكشن: { name: "أكشن", slug: "action" },
        تاريخ: { name: "تاريخي", slug: "historical" },
        تاريخي: { name: "تاريخي", slug: "historical" },
        كوميدي: { name: "كوميديا", slug: "comedy" },
        كوميديا: { name: "كوميديا", slug: "comedy" },
        "غرب أمريكي": { name: "غربي", slug: "western" },
        غربي: { name: "غربي", slug: "western" },
        Sport: { name: "رياضة", slug: "sports" },
        رياضة: { name: "رياضة", slug: "sports" },
        "خيال علمي وفانتازيا": { name: "خيال علمي", slug: "sci-fi" },
        "sci-fi": { name: "خيال علمي", slug: "sci-fi" },
        "خيال علمي": { name: "خيال علمي", slug: "sci-fi" },
    };

    const { data: genres } = await supabase.from("genres").select(`
        name, slug,
        media_genres(media_id)
    `);
    const uniqueGenres = new Set();
    genres?.forEach((g) => {
        const finalSlug =
            genreMapping[g.name]?.slug || genreMapping[g.slug]?.slug || g.slug;
        uniqueGenres.add(finalSlug);
    });
    uniqueGenres.forEach((slug) =>
        allUrls.push(`${BASE_URL}/genre/${encodeURIComponent(slug)}`),
    );

    const { data: medias } = await supabase
        .from("medias")
        .select("slug, category")
        .eq("is_ready", true)
        .not("poster_url", "is", null)
        .not("story", "is", null);
    medias?.forEach((m) => {
        const type =
            m.category === "series" || m.category === "tv" ? "tv" : "movie";

        allUrls.push(`${BASE_URL}/${type}/${m.slug}`);
    });

    // 3. المواسم
    const { data: seasons } = await supabase
        .from("seasons")
        .select(`season_number, medias ( slug, category )`);
    seasons?.forEach((s) => {
        if (
            s.medias &&
            (s.medias.category === "series" || s.medias.category === "tv")
        ) {
            allUrls.push(
                `${BASE_URL}/tv/${s.medias.slug}/season/${s.season_number}`,
            );
        }
    });

    // 4. الحلقات
    // جلب حلقات الأعمال الجاهزة فقط لمنع الخطأ والأرشفة العشوائية
    const { data: episodes } = await supabase
        .from("episodes")
        .select(
            `
            episode_number, 
            medias!inner(slug, category, is_ready, poster_url, story), 
            seasons(season_number)
        `,
        )
        .eq("medias.is_ready", true)
        .not("medias.poster_url", "is", null)
        .not("medias.story", "is", null);
    episodes?.forEach((ep) => {
        if (
            ep.medias &&
            (ep.medias.category === "series" || ep.medias.category === "tv")
        ) {
            const sNum = ep.seasons?.season_number || 1;
            allUrls.push(
                `${BASE_URL}/tv/${ep.medias.slug}/season/${sNum}/episode/${ep.episode_number}`,
            );
        }
    });

    const MAX_REQUESTS = 150; // الحد الأقصى المطلوب
    const urlsToProcess = [...new Set(allUrls)].filter(
        (url) => !indexedUrls.includes(url),
    );
    console.log(`📊 Total Links in Site: ${allUrls.length}`);
    console.log(`✅ Already Indexed: ${allUrls.length - urlsToProcess.length}`);
    console.log(
        `🚀 Remaining to Send (This Session Limit: ${MAX_REQUESTS}): ${urlsToProcess.length}`,
    );
    let consecutiveErrors = 0; // عداد الأخطاء المتتالية
    let requestCount = 0; // عداد الطلبات المرسلة

    for (let i = 0; i < urlsToProcess.length; i++) {
        if (requestCount >= MAX_REQUESTS) {
            console.log(
                `✅ [Quota Guard]: Reached ${MAX_REQUESTS}. Stopping...`,
            );
            break;
        }
        const currentUrl = urlsToProcess[i];
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SECRET}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: currentUrl }),
            });

            requestCount++;
            if (res.ok) {
                console.log(
                    `[${requestCount}/${MAX_REQUESTS}] Done: ${currentUrl}`,
                );
                fs.appendFileSync(LOG_FILE, currentUrl + "\n");
                consecutiveErrors = 0; // تصفير العداد عند أي نجاح
            } else {
                consecutiveErrors++; // زيادة العداد عند الفشل
                const errData = await res.json().catch(() => ({}));
                console.log(
                    `Failed [${res.status}]: ${currentUrl} - ${errData.error || "Unknown"}`,
                );

                if (res.status === 429 || consecutiveErrors >= 5) {
                    console.log(
                        `🚨 [Emergency Stop]: Too many consecutive errors or Rate Limit reached. stopping...`,
                    );
                    break;
                }
            }
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
        await new Promise((r) => setTimeout(r, 5000));
    }
}

archiveEverything();
