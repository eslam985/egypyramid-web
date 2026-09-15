// /media/es/DDrive/projects/web-Next/egypyramid-web/src/services/MediaService.js
import { supabase } from "@/lib/supabase";

class MediaService {
  // قاعدة ثابتة لكل استعلامات الميديا لتجنب التكرار
  baseMediaQuery() {
    return supabase
      .from("medias")
      .select(
        "id, title, story, slug, poster_url, rating, year, media_type, category, labels, created_at",
      )
      .eq("is_ready", true)
      .not("poster_url", "is", null)
      .not("story", "is", null);
  }

  async getHomeData() {
    return await Promise.all([
      this.baseMediaQuery()
        .in("media_type", ["movie"])
        .order("created_at", { ascending: false })
        .limit(6),
      this.baseMediaQuery()
        .in("media_type", ["series", "tv"])
        .order("created_at", { ascending: false })
        .limit(6),
      this.baseMediaQuery().order("rating", { ascending: false }).limit(12),
      supabase
        .from("episodes")
        .select(
          "id, episode_number, media_id, created_at, medias!inner(id, title, slug, poster_url, media_type, category, is_ready, story)",
        )
        .eq("medias.is_ready", true)
        .not("medias.poster_url", "is", null)
        .not("medias.story", "is", null)
        .in("medias.media_type", ["series", "tv"])
        .order("created_at", { ascending: false })
        .limit(12),
      this.baseMediaQuery()
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase.from("genres").select("id, name, slug, media_genres(media_id)"),
    ]);
  }

  // src/services/MediaService.js

  async getMediaByCategory(category, page = 1, itemsPerPage = 24) {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    const searchType =
      category === "tv" || category === "series" ? "series" : "movie";

    // أضفنا { count: 'exact' } لجلب العدد الكلي للصفحات
    return await this.baseMediaQuery()
      .eq("media_type", searchType)
      .order("created_at", { ascending: false })
      .range(from, to, { count: "exact" });
  }

  // دالة جلب تفاصيل ميديا محددة (فيلم أو مسلسل)
  async getMediaDetails(slug) {
    const potentialId = parseInt(slug.split("-")[0], 10);
    let query = supabase
      .from("medias")
      .select(
        "id, title, story, slug, poster_url, rating, year, media_type, category, labels, runtime, duration_iso, created_at, seasons(id, season_number), episodes(id, episode_number, slug), media_genres(genres(id, name, slug))",
      )
      .eq("is_ready", true)
      .not("poster_url", "is", null)
      .not("story", "is", null);

    // التحقق بالـ ID أولاً لسرعة الأداء، وإذا فشل يبحث بالـ slug
    if (!isNaN(potentialId) && potentialId > 0) {
      query = query.eq("id", potentialId);
    } else {
      query = query.eq("slug", slug);
    }

    return await query.limit(1).maybeSingle();
  }

  // دالة جلب المحتوى المشابه بناءً على التصنيف (Genre)
  async getRelatedMedia(genreId, currentMediaId, limit = 10) {
    return await supabase
      .from("medias")
      .select(
        "id, title, story, slug, poster_url, rating, year, media_type, category, labels, media_genres!inner(genre_id)",
      )
      .eq("is_ready", true)
      .not("poster_url", "is", null)
      .not("story", "is", null)
      .eq("media_genres.genre_id", genreId)
      .neq("id", currentMediaId) // استبعاد العنصر الحالي
      .limit(limit);
  }

  // 1. جلب بيانات الحلقة لـ الميتا داتا
  async getEpisodeForMetadata(mediaId) {
    return await supabase
      .from("episodes")
      .select(`episode_number, medias!inner(title, story, poster_url, year)`)
      .eq("medias.id", mediaId)
      .limit(1)
      .single();
  }

  // 2. جلب بيانات الحلقة لصفحة المشاهدة
  async getWatchPageEpisode(mediaId) {
    return await supabase
      .from("episodes")
      .select(
        `
            id, episode_number, slug, created_at,
            medias!inner(
                id, title, story, poster_url, slug, labels, year, rating,
                media_genres(genres(id, name, slug))
            ),
            links(id, server_name, url, quality)
        `,
      )
      .eq("medias.id", mediaId)
      .or("last_check_status.neq.broken,last_check_status.is.null", {
        foreignTable: "links",
      })
      .order("episode_number", { ascending: true })
      .limit(1)
      .single();
  }

  // 3. جلب كل الحلقات لمسلسل معين
  async getAllEpisodesByMediaId(mediaId) {
    return await supabase
      .from("episodes")
      .select("id, episode_number")
      .eq("media_id", mediaId)
      .order("episode_number", { ascending: true });
  }

  // 4. جلب المحتوى المشابه مع الفولباك (القسم -> الكلمة الدلالية -> الأحدث)
  async getWatchRelatedMedia(targetType, mediaId, genreId, label) {
    // المحاولة الأولى: بالقسم
    if (genreId) {
      const { data } = await supabase
        .from("medias")
        .select(
          "id, title, slug, poster_url, rating, year, media_type, media_genres!inner(genre_id)",
        )
        .eq("media_genres.genre_id", genreId)
        .eq("media_type", targetType)
        .neq("id", mediaId)
        .limit(12);
      if (data && data.length > 0) return data;
    }

    // المحاولة الثانية: بالكلمة الدلالية
    if (label) {
      const { data } = await supabase
        .from("medias")
        .select("id, title, slug, poster_url, rating, year, media_type")
        .ilike("labels", `%${label}%`)
        .eq("media_type", targetType)
        .neq("id", mediaId)
        .limit(12);
      if (data && data.length > 0) return data;
    }

    // المحاولة الثالثة (الأخيرة): الأحدث
    const { data } = await supabase
      .from("medias")
      .select(
        "id, title, story, poster_url, slug, labels, year, rating, media_type",
      )
      .eq("media_type", targetType)
      .neq("id", mediaId)
      .order("created_at", { ascending: false })
      .limit(12);

    return data || [];
  }

  // جلب معرف السيزون برقم السيزون والـ ID الخاص بالمسلسل
  async getSeasonData(mediaId, seasonNumber) {
    return await supabase
      .from("seasons")
      .select("id")
      .eq("media_id", mediaId)
      .eq("season_number", seasonNumber)
      .single();
  }

  // جلب حلقات سيزون معين مع دعم الحلقات التي ليس لها سيزون (Legacy)
  async getSeasonEpisodes(mediaId, seasonId) {
    let query = supabase
      .from("episodes")
      .select("id, episode_number, slug, created_at, season_id")
      .eq("media_id", mediaId);

    if (seasonId) {
      query = query.or(`season_id.eq.${seasonId},season_id.is.null`);
    } else {
      query = query.is("season_id", null);
    }

    return await query.order("episode_number", { ascending: true });
  }

  // جلب بيانات حلقة معينة بكافة تفاصيلها (الميديا، الموسم، الروابط)
  async getSpecificEpisode(mediaId, seasonNumber, episodeNumber) {
    return await supabase
      .from("episodes")
      .select(
        `
            id, episode_number, slug, created_at,
            seasons!inner(id, season_number),
            medias!inner(
                id, title, story, poster_url, slug, labels, year, rating, media_type, category, runtime, duration_iso,
                media_genres(genres(id, name, slug))
            ),
            links(id, server_name, url, quality, link_type)
        `,
      )
      .eq("medias.id", mediaId)
      .eq("episode_number", episodeNumber)
      .eq("seasons.season_number", seasonNumber)
      .or("last_check_status.neq.broken,last_check_status.is.null", {
        foreignTable: "links",
      })
      .single();
  }

  // جلب بيانات الحلقة/الفيلم للتحميل (بدون الاعتماد على الموسم)
  async getEpisodeWithoutSeason(mediaId, category, episodeNumber) {
    let query = supabase
      .from("episodes")
      .select(
        `
            id, episode_number, slug, created_at,
            medias!inner(
                id, title, story, poster_url, slug, labels, year, media_type, category, rating, runtime, duration_iso,
                media_genres(genres(id, name, slug))
            ),
            links(id, server_name, url, quality, link_type)
        `,
      )
      .eq("medias.id", mediaId)
      .or("last_check_status.neq.broken,last_check_status.is.null", {
        foreignTable: "links",
      });

    // المنطق: لو فيلم نجلب السجل الأول، لو مسلسل نجلب برقم الحلقة
    if (category === "movie") {
      query = query.order("episode_number", { ascending: true }).limit(1);
    } else {
      query = query.eq("episode_number", parseInt(episodeNumber, 10));
    }

    return await query.single();
  }

  async getAllGenres() {
    const { data: genres, error } = await supabase
      .from("genres")
      .select(`id, name, slug, media_genres(media_id)`);

    if (error) throw error;

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

    const mergedGenresMap = {};

    genres?.forEach((g) => {
      const count = g.media_genres ? g.media_genres.length : 0;
      if (count === 0) return;

      const mapping = genreMapping[g.name] || genreMapping[g.slug];
      const finalName = mapping ? mapping.name : g.name;
      const finalSlug = mapping ? mapping.slug : g.slug;

      if (mergedGenresMap[finalSlug]) {
        mergedGenresMap[finalSlug].workCount += count;
      } else {
        mergedGenresMap[finalSlug] = {
          id: g.id,
          name: finalName,
          slug: finalSlug,
          workCount: count,
        };
      }
    });

    return Object.values(mergedGenresMap).sort(
      (a, b) => b.workCount - a.workCount,
    );
  }

  // جلب محتوى صفحات الأقسام والـ Slugs المتنوعة مع نظام الصفحات
  async getCategoryPageData(slug, page = 1, itemsPerPage = 24) {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let mediaList = [];
    let pageTitle = slug;
    let totalCount = 0;

    // 1. أحدث الحلقات
    if (slug === "latest-episodes") {
      pageTitle = "أحدث الحلقات المضافة";
      const { data: episodesData, count: epCount } = await supabase
        .from("episodes")
        .select(
          "episode_number, created_at, media_id, medias!inner(id, title, slug, poster_url, media_type, category, rating, year, is_ready, story)",
          { count: "planned" },
        )
        .eq("medias.is_ready", true)
        .not("medias.poster_url", "is", null)
        .not("medias.story", "is", null)
        .in("medias.media_type", ["series", "tv"])
        .order("created_at", { ascending: false })
        .range(from, to * 2);

      if (episodesData) {
        const uniqueMedias = [];
        const seenIds = new Set();
        for (const ep of episodesData) {
          if (!seenIds.has(ep.media_id)) {
            seenIds.add(ep.media_id);
            uniqueMedias.push({
              ...ep.medias,
              episode_label: `الحلقة ${ep.episode_number}`,
              unique_key: `${ep.medias.id}-${ep.episode_number}`,
            });
          }
          if (uniqueMedias.length >= itemsPerPage) break;
        }
        totalCount = epCount
          ? Math.ceil(epCount * (uniqueMedias.length / episodesData.length))
          : seenIds.size;
        mediaList = uniqueMedias;
      }
      return { mediaList, totalCount, pageTitle };
    }

    // 2. الحالات الخاصة (أفلام، مسلسلات، الأعلى تقييماً)
    if (["movies", "series", "top-rated"].includes(slug)) {
      let query = supabase
        .from("medias")
        .select(
          "id, title, story, slug, poster_url, rating, year, media_type, category, labels, created_at",
          { count: "planned" },
        )
        .eq("is_ready", true)
        .not("poster_url", "is", null)
        .not("story", "is", null);

      if (slug === "movies") {
        query = query.eq("media_type", "movie");
        pageTitle =
          "مشاهدة أحدث الأفلام اون لاين مجانا | ايجي بيراميد - EGY PYRAMID";
      } else if (slug === "series") {
        query = query.in("media_type", ["series", "tv"]);
        pageTitle =
          "مشاهدة أحدث المسلسلات اون لاين مجانا | ايجي بيراميد - EGY PYRAMID";
      } else if (slug === "top-rated") {
        query = query.order("rating", { ascending: false });
        pageTitle =
          "مشاهدة الاعمال الأعلى تقييماً اون لاين مجانا | ايجي بيراميد - EGY PYRAMID";
      }

      const { data, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);
      mediaList = (data || []).map((m) => ({ ...m, unique_key: m.id }));
      totalCount = count || 0;
      return { mediaList, totalCount, pageTitle };
    }

    // 3. الأقسام (Genres) الموحدة
    const { data: genre } = await supabase
      .from("genres")
      .select("id, name")
      .eq("slug", slug)
      .single();

    if (genre) {
      pageTitle = genre.name;
      const { data, count } = await supabase
        .from("medias")
        .select(
          "id, title, story, slug, poster_url, rating, year, media_type, category, labels, created_at, media_genres!inner(genre_id)",
          { count: "planned" },
        )
        .eq("is_ready", true)
        .not("poster_url", "is", null)
        .not("story", "is", null)
        .eq("media_genres.genre_id", genre.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      mediaList = data || [];
      totalCount = count || 0;
      return { mediaList, totalCount, pageTitle };
    }

    // 4. خطة بديلة (Fallback) للبحث في الـ Labels
    const { data, count } = await supabase
      .from("medias")
      .select(
        "id, title, story, slug, poster_url, rating, year, media_type, category, labels, created_at",
        { count: "planned" },
      )
      .eq("is_ready", true)
      .not("poster_url", "is", null)
      .not("story", "is", null)
      .ilike("labels", `%${slug}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    mediaList = data || [];
    totalCount = count || 0;
    pageTitle = slug;

    return { mediaList, totalCount, pageTitle };
  }

  // جلب نتائج البحث
  // جلب نتائج البحث (محدثة لدعم الفلاتر المتعددة والتوافق مع الكود القديم)
  async searchMedia(queryOrFilters, fallbackType = "all", limit = 48, page = 1) {
    // دعم التوافق مع الاستدعاء القديم (نص) والاستدعاء الجديد (كائن Filters)
    let filters = {};
    if (typeof queryOrFilters === "string") {
      filters = { query: queryOrFilters, type: fallbackType };
    } else {
      filters = queryOrFilters || {};
      limit = filters.limit || limit;
      page = filters.page || page;
    }

    const { query, type = "all", year, genreId, label, sort } = filters;

    // إذا لم يكن هناك أي فلتر أو كلمة بحث (بما في ذلك الترتيب الافتراضي)، نوقف التنفيذ
    if ((!query || query.length < 2) && !year && !genreId && !label && type === "all" && (!sort || sort === "created_at_desc")) {
      return { results: [], totalCount: 0 };
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // إذا كان البحث يحتوي على genreId، نحتاج لعمل join مع جدول media_genres
    let selectString = "id, title, story, slug, poster_url, rating, year, media_type, category, labels, created_at";
    if (genreId) {
      selectString += ", media_genres!inner(genre_id)";
    }

    let dbQuery = supabase
      .from("medias")
      .select(selectString, { count: "exact" })
      .eq("is_ready", true)
      .not("poster_url", "is", null)
      .not("story", "is", null);

    // تطبيق الفلاتر
    if (query && query.length >= 2) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,story.ilike.%${query}%,labels.ilike.%${query}%`);
    }

    if (type === "movie") dbQuery = dbQuery.eq("media_type", "movie");
    if (type === "series") dbQuery = dbQuery.in("media_type", ["series", "tv"]);
    if (year) dbQuery = dbQuery.eq("year", year);
    if (genreId) dbQuery = dbQuery.eq("media_genres.genre_id", genreId);
    if (label) dbQuery = dbQuery.ilike("labels", `%${label}%`);

    // تطبيق الترتيب
    switch (sort) {
      case "rating_desc":
        dbQuery = dbQuery.order("rating", { ascending: false });
        break;
      case "year_desc":
        dbQuery = dbQuery.order("year", { ascending: false });
        break;
      case "year_asc":
        dbQuery = dbQuery.order("year", { ascending: true });
        break;
      case "created_at_asc":
        dbQuery = dbQuery.order("created_at", { ascending: true });
        break;
      case "created_at_desc":
      default:
        dbQuery = dbQuery.order("created_at", { ascending: false });
        break;
    }

    const { data, count } = await dbQuery.range(from, to);

    return {
      results: data || [],
      totalCount: count || 0,
    };
  } 
// جلب نطاق السنوات (من الأحدث للأقدم) الموجودة فعلياً في قاعدة البيانات
  async getAvailableYears() {
    // جلب أحدث سنة
    const { data: maxData } = await supabase
      .from("medias")
      .select("year")
      .eq("is_ready", true)
      .not("year", "is", null)
      .order("year", { ascending: false })
      .limit(1)
      .maybeSingle();

    // جلب أقدم سنة
    const { data: minData } = await supabase
      .from("medias")
      .select("year")
      .eq("is_ready", true)
      .not("year", "is", null)
      .order("year", { ascending: true })
      .limit(1)
      .maybeSingle();

    const maxYear = maxData?.year ? parseInt(maxData.year, 10) : new Date().getFullYear();
    const minYear = minData?.year ? parseInt(minData.year, 10) : 1970;

    const years = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }
  async getSitemapData(limit = 5000) {
    const [medias, episodes] = await Promise.all([
      supabase
        .from("medias")
        .select("slug, updated_at, category")
        .eq("is_ready", true)
        .not("poster_url", "is", null)
        .not("story", "is", null)
        .limit(limit),
      supabase
        .from("episodes")
        .select(
          `
          episode_number, updated_at, 
          medias!inner(slug, category, is_ready, poster_url, story),
          seasons(season_number)
        `,
        )
        .eq("medias.is_ready", true)
        .not("medias.poster_url", "is", null)
        .not("medias.story", "is", null)
        .limit(limit),
    ]);

    return {
      medias: medias.data || [],
      episodes: episodes.data || [],
    };
  }
}

export const mediaService = new MediaService();
