// src/app/api/telegram/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// قوالب ديناميكية متعددة للأفلام والمسلسلات - تليجرام
// تجعل المنشور طبيعي، غير آلي، ويزيد التفاعل
// ============================================================

// تنظيف النص من HTML واختصاره
const cleanHtml = (text, maxLength = 300) => {
  if (!text) return "";
  let cleaned = text
    .replace(/<[^>]*>?/gm, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (cleaned.length > maxLength)
    cleaned = cleaned.substring(0, maxLength) + "…";
  return cleaned;
};

// استخراج اسماء الممثلين أو أبرز الأسماء (إذا وجدت)
const getActorsPreview = (movie) => {
  if (movie.actors && movie.actors.length) {
    const actorsList = movie.actors
      .slice(0, 2)
      .map((a) => a.name)
      .join("، ");
    return `🎭 بطولة: ${actorsList}`;
  }
  return "";
};

// تحويل مدة العرض إلى نص مقروء
const formatRuntime = (minutes) => {
  if (!minutes) return "غير محدد";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} دقيقة`;
  if (mins === 0) return `${hours} ساعة`;
  return `${hours} ساعة و ${mins} دقيقة`;
};

// الحصول على إيموجي عشوائي حسب النوع
const getRandomGenreEmoji = (labels) => {
  const genres = (labels || "").toLowerCase();
  if (genres.includes("اكشن")) return "💥⚡️🔫";
  if (genres.includes("كوميدي")) return "😂🤣🎭";
  if (genres.includes("دراما")) return "🎭🎬💔";
  if (genres.includes("رعب")) return "🔪👻😱";
  if (genres.includes("رومانسي")) return "💕😍💋";
  if (genres.includes("خيال")) return "🧙‍♂️🐉✨";
  if (genres.includes("اثارة")) return "🔫😱🔥";
  return "🎬🔥";
};

// مصفوفات القوالب – كل قالب دالة ترجع نص منسق (HTML للتليجرام)
// ===================== قوالب الأفلام =====================
const MOVIE_TEMPLATES = [
  // قالب 1: تشويقي مع وصف قصير
  (ctx) => `🎬 <b>🔥 فيلم جديد في السينما المنزلية!</b>

<b>🎥 الاسم:</b> ${ctx.title}
<b>⭐ التقييم:</b> ${ctx.rating} / 10
<b>📅 السنة:</b> ${ctx.year}
<b>⏳ المدة:</b> ${ctx.runtime}
<b>🎭 النوع:</b> ${ctx.labels}
${ctx.actors ? `\n${ctx.actors}` : ""}

<b>📖 القصة:</b>
${ctx.shortStory}

<b>🍿 لا تفوّت المتعة!</b>
${ctx.hashtags}

🔗 <b>رابط المشاهدة الفوري:</b>
${ctx.url}`,

  // قالب 2: أسلوب "مين متحمس؟"
  (
    ctx,
  ) => `${ctx.genreEmoji} <b>مين متحمس يشوف "${ctx.title}"؟</b> ${ctx.genreEmoji}

<b>🎬 معلومات سريعة:</b>
• السنة: ${ctx.year}
• التقييم: ${ctx.rating}
• النوع: ${ctx.labels}
• المدة: ${ctx.runtime}

${ctx.shortStory ? `✨ <b>مقتطف:</b> ${ctx.shortStory}\n` : ""}
<b>👀 شاهد الآن عبر الرابط التالي:</b>
${ctx.url}

${ctx.hashtags}
#EgyPyramid`,

  // قالب 3: قصير وحماسي
  (ctx) => `🎯 <b>فيلم السهرة:</b> ${ctx.title} (${ctx.year})

${ctx.genreEmoji} ${ctx.labels} • ⭐ ${ctx.rating}

${ctx.shortStory ? `📌 ${ctx.shortStory}\n` : ""}
👇 <b>للبدء في المشاهدة:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 4: توصية شخصية
  (ctx) => `💎 <b>توصية اليوم من فريق EgyPyramid:</b>

🎬 <b>${ctx.title}</b>
${ctx.year} • ${ctx.labels} • ⭐ ${ctx.rating}

${ctx.actors ? `🎭 ${ctx.actors}\n` : ""}
📖 ${ctx.shortStory || "قصة مشوّقة تنتظرك!"}

<b>⏰ المدة:</b> ${ctx.runtime}

<b>🎁 شاهد الآن مجاناً (بدون إزعاج):</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 5: أسلوب "هل تبحث عن..."
  (ctx) => `❓ <b>هل تبحث عن فيلم ممتع لقضاء وقتك؟</b>

✅ <b>${ctx.title}</b> هو الخيار المناسب لك!
⭐ التقييم: ${ctx.rating}
⏳ ${ctx.runtime}
🎭 ${ctx.labels}

${ctx.shortStory ? `📝 ${ctx.shortStory}\n` : ""}
🚀 <b>انطلق في المشاهدة من هنا:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 6: أسلوب "لا يفوتك"
  (ctx) => `🚨 <b>لا يفوتك: فيلم ${ctx.title}</b> 🚨

📆 ${ctx.year} | ⭐ ${ctx.rating}
🎭 ${ctx.labels}
⏱️ المدة: ${ctx.runtime}

${ctx.actors ? `🎭 ${ctx.actors}\n` : ""}
<b>📜 ملخص:</b> ${ctx.shortStory || "قصة تجذبك منذ البداية"}

🔻 <b>شاهد من الرابط أدناه:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 7: أسلوب مقارنة أو حماس
  (
    ctx,
  ) => `🎬✨ <b>${ctx.title}</b> – العمل الذي يبحث عنه عشاق ${ctx.primaryGenre} ✨🎬

<b>📊 المعلومات:</b>
• السنة: ${ctx.year}
• التقييم: ${ctx.rating} / 10
• المدة: ${ctx.runtime}
• النوع: ${ctx.labels}

<b>📖 القصة:</b> ${ctx.shortStory || "تشويق وإثارة حتى آخر لحظة"}

<b>🎟️ تفضل بالدخول:</b>
${ctx.url}

${ctx.hashtags}`,
];

// ===================== قوالب المسلسلات =====================
const SERIES_TEMPLATES = [
  // قالب 1: ماراثون الحلقات
  (ctx) => `📺 <b>🔥 مسلسل جديد كامل الحلقات – جاهز للماراثون!</b>

<b>🎬 الاسم:</b> ${ctx.title}
<b>⭐ التقييم:</b> ${ctx.rating}
<b>📅 السنة:</b> ${ctx.year}
<b>🎭 النوع:</b> ${ctx.labels}
${ctx.actors ? `\n${ctx.actors}` : ""}

<b>📖 القصة:</b>
${ctx.shortStory}

<b>🍿 ابدأ المشاهدة الآن ولا تفوت حلقة:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 2: تحفيزي للمتابعة
  (ctx) => `🔥 <b>${ctx.title}</b> – المسلسل اللي الكل بيتكلم عنه! 🔥

⭐ ${ctx.rating} | 📅 ${ctx.year} | 🎭 ${ctx.labels}

${ctx.shortStory ? `📌 ${ctx.shortStory}\n` : ""}
<b>⏳ لا تنتظر، شاهد الحلقات كاملة:</b>
${ctx.url}

${ctx.hashtags}
#مسلسل_جديد`,

  // قالب 3: أسلوب "مين بدأ؟"
  (ctx) => `🤔 <b>مين بدأ مسلسل "${ctx.title}"؟ وإيه رأيك فيه؟</b>

📺 ${ctx.year} • ${ctx.labels} • ⭐ ${ctx.rating}

${ctx.actors ? `🎭 ${ctx.actors}\n` : ""}
${ctx.shortStory ? `📖 ${ctx.shortStory}\n` : ""}

👇 <b>لبدء الماراثون:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 4: قصير مع رمز المسلسل
  (ctx) => `📡 <b>${ctx.title}</b> (${ctx.year})
${ctx.genreEmoji} ${ctx.labels} • ⭐ ${ctx.rating}

${ctx.shortStory ? `✏️ ${ctx.shortStory}\n` : ""}
🚀 <b>تابع الحلقات أولاً بأول:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 5: أسلوب "إدمان"
  (ctx) => `😍 <b>إدمان بمعنى الكلمة:</b> مسلسل ${ctx.title}

⏳ ${ctx.runtime} للحلقة | 🎭 ${ctx.labels}
⭐ تقييم ${ctx.rating}

${ctx.actors ? `🎭 ${ctx.actors}\n` : ""}
<b>📺 لا تقاوم، شاهد الآن:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 6: أسلوب تشويقي درامي
  (ctx) => `🎭 <b>دراما آسرة في ${ctx.title}</b> – مش هتقدر توقف!

📅 ${ctx.year} | ${ctx.labels}
⭐ التقييم: ${ctx.rating}

${ctx.shortStory ? `📜 ${ctx.shortStory}\n` : ""}
🔻 <b>ابدأ المشاهدة فوراً:</b>
${ctx.url}

${ctx.hashtags}`,

  // قالب 7: أسلوب "أنتظرك"
  (ctx) => `⏳ <b>عاوز تضيع وقتك في حاجة مفيدة؟</b> ${ctx.title} في انتظارك!

⭐ ${ctx.rating} | 🎭 ${ctx.labels} | ⏱️ ${ctx.runtime}

${ctx.shortStory ? `📄 ${ctx.shortStory}\n` : ""}
👆 <b>اضغط للمشاهدة:</b>
${ctx.url}

${ctx.hashtags}`,
];

// دالة اختيار قالب عشوائي وإنشاء النص
function buildTelegramMessage(movie, isSeries, shortStory, hashtags, fullUrl) {
  // تحضير السياق المشترك
  const runtimeFormatted =
    typeof movie.runtime === "number"
      ? formatRuntime(movie.runtime)
      : movie.runtime || "غير محدد";
  const labels = movie.labels || "غير محدد";
  const rating = movie.rating || "N/A";
  const year = movie.year || "N/A";
  const primaryGenre =
    (movie.labels || "").split(",")[0] || (isSeries ? "دراما" : "أكشن");
  const genreEmoji = getRandomGenreEmoji(movie.labels);
  const actorsText = getActorsPreview(movie);

  const context = {
    title: movie.title,
    year: year,
    rating: rating,
    runtime: runtimeFormatted,
    labels: labels,
    primaryGenre: primaryGenre,
    genreEmoji: genreEmoji,
    shortStory: shortStory,
    hashtags: hashtags,
    url: fullUrl,
    actors: actorsText,
  };

  // اختيار مكتبة القوالب حسب النوع
  const templates = isSeries ? SERIES_TEMPLATES : MOVIE_TEMPLATES;
  const randomIndex = Math.floor(Math.random() * templates.length);
  let message = templates[randomIndex](context);

  // تأكد من وجود الرابط في النص (في حال نسي القالب)
  if (!message.includes(fullUrl)) {
    message += `\n\n🔗 <b>رابط المشاهدة:</b>\n${fullUrl}`;
  }

  // التأكد من وجود الهاشتاج الرئيسي
  if (!message.includes("#EgyPyramid")) {
    message += `\n#EgyPyramid`;
  }

  // إضافة فواصل جميلة لو بدا النص طويلاً جداً (تليجرام يقبل 1024 لكن نحن أقل)
  return message.slice(0, 3800); // أمان
}

// بناء أزرار التفاعل (يمكن تنويعها عشوائياً لكن سنبقيها ثابتة للمصداقية)
function getReplyMarkup(fullUrl) {
  return JSON.stringify({
    inline_keyboard: [
      [{ text: "🍿 شاهد الآن (الموقع الرسمي)", url: fullUrl }],
      [
        { text: "👥 الجروب", url: "https://t.me/Egy_Pyramid_Community" },
        { text: "🤖 البوت", url: "https://t.me/EgyPyramid_Web_Bot" },
      ],
    ],
  });
}

// ============================================================
// API الرئيسي
// ============================================================
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // 1. فحص الفاصل الزمني (cooldown) – 60 دقيقة كحد أدنى
    const MIN_MINUTES = 60;
    const { data: lastNotified } = await supabase
      .from("medias")
      .select("updated_at")
      .eq("is_notified", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (lastNotified) {
      const lastTime = new Date(lastNotified.updated_at).getTime();
      const currentTime = new Date().getTime();
      const diffInMinutes = (currentTime - lastTime) / (1000 * 60);
      if (diffInMinutes < MIN_MINUTES) {
        console.log(
          `⏳ تأجيل النشر: آخر بوست منذ ${Math.round(diffInMinutes)} دقيقة.`,
        );
        return NextResponse.json({ message: "Rate limited" }, { status: 200 });
      }
    }

    // 2. سحب ID الفيلم الأقدم غير المنشور
    const { data: pendingMovie, error: fetchError } = await supabase
      .from("medias")
      .select("id")
      .eq("is_ready", true)
      .eq("is_notified", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !pendingMovie) {
      console.log("✅ لا يوجد أفلام أو مسلسلات في الطابور.");
      return NextResponse.json(
        { message: "No pending movies to notify" },
        { status: 200 },
      );
    }

    // 3. القفل الذري (Atomic Lock)
    const { data: lockedMovies, error: lockError } = await supabase
      .from("medias")
      .update({ is_notified: true, updated_at: new Date().toISOString() })
      .eq("id", pendingMovie.id)
      .eq("is_notified", false)
      .select("*");

    if (lockError || !lockedMovies || lockedMovies.length === 0) {
      console.log(`⛔ تم إلغاء الطلب: تمت معالجة هذا العمل بواسطة عملية أخرى.`);
      return NextResponse.json(
        { message: "Locked by another process" },
        { status: 200 },
      );
    }

    const movie = lockedMovies[0];
    console.log(`🚀 تم قفل العمل وجاري النشر الديناميكي: ${movie.title}`);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://egypyramid.vercel.app";

    const isSeries = movie.category === "series" || movie.category === "tv";
    const categoryPath = isSeries ? "tv" : "movie";
    const fullUrl = `${siteUrl}/${categoryPath}/${movie.slug}`;

    // تحضير الهاشتاجات (بحد أقصى 3)
    let hashtags = "";
    if (movie.labels) {
      const tags = movie.labels
        .split(",")
        .slice(0, 3)
        .map((tag) => `#${tag.trim().replace(/\s+/g, "_")}`);
      hashtags = tags.join(" ");
    }
    hashtags += " #EgyPyramid";
    if (isSeries) hashtags += " #مسلسل";
    else hashtags += " #فيلم";

    // تنظيف الوصف
    const cleanStory = cleanHtml(movie.story, 250);
    const shortStory = cleanStory ? cleanStory : "لا يوجد وصف متاح حالياً.";
    //https://res.cloudinary.com/dbahqgo8j/image/upload/c_fill,g_auto,w_300,h_450,q_auto:good,f_avif/v1/blogger/sjod3prugcwoxoix7bll.avif
    // https://res.cloudinary.com/dbahqgo8j/image/upload/w_1200,h_800,c_pad,b_gen_blur:40/l_blogger:logo,w_140,o_60,g_south,y_20,f_jpg/v1/blogger/zuokaetleiadacfrnzut.jpg
    // بناء الرسالة الديناميكية
    const caption = buildTelegramMessage(
      movie,
      isSeries,
      shortStory,
      hashtags,
      fullUrl,
    );

    // معالجة رابط الصورة – استخراج الـ Hash الفريد وبناء رابط سينمائي نقي باللوجو المائي 100%
    let fixedPosterUrl = movie.poster_url || "";
    if (fixedPosterUrl && fixedPosterUrl.includes("res.cloudinary.com")) {
      // 1. استخراج الجزء الأخير من الرابط (اسم الملف بالامتداد)
      const parts = fixedPosterUrl.split("/");
      const lastPart = parts[parts.length - 1];

      // 2. فصل الامتداد للحصول على الـ Hash النقي (العنصر رقم 0 في المصفوفة الناتجة)
      const imageHash = lastPart.split(".")[0];

      if (imageHash) {
        // 3. بناء الرابط الجديد بالملي: مقاس أفقي 3:2 + خلفية ضبابية + لوجو قناتك المائي بالمسار الصحيح (l_blogger:logo)
        fixedPosterUrl = `https://res.cloudinary.com/dbahqgo8j/image/upload/w_1200,h_800,c_pad,b_black/l_blogger:logo,w_80,h_80,c_fill,r_50,o_100/fl_layer_apply,g_north_east,x_340,y_5/v1/blogger/${imageHash}.jpg`;
      }
    }

    console.log(
      "2️⃣ الرابط النهائي المبعوث لتليجرام بعد الاستبدال:",
      fixedPosterUrl,
    );
    console.log("===========================================");

    if (fixedPosterUrl && fixedPosterUrl.startsWith("//")) {
      fixedPosterUrl = `https:${fixedPosterUrl}`;
    }
    if (!fixedPosterUrl) {
      // صورة احتياطية (نادراً)
      fixedPosterUrl = "https://via.placeholder.com/800x1200?text=EgyPyramid";
    }

    // إرسال الصورة مع التسمية التوضيحية
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: fixedPosterUrl,
        caption: caption,
        parse_mode: "HTML",
        reply_markup: getReplyMarkup(fullUrl),
      }),
    });

    const telegramResult = await response.json();
    if (!response.ok) {
      // فشل النشر: التراجع (Rollback)
      await supabase
        .from("medias")
        .update({ is_notified: false })
        .eq("id", movie.id);
      console.error("❌ تليجرام رفض الصورة، تم التراجع:", telegramResult);
      throw new Error(
        `Telegram API Error: ${telegramResult.description || "Unknown"}`,
      );
    }

    console.log(`✅ تم النشر بنجاح باستخدام قالب ديناميكي لـ: ${movie.title}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ خطأ في API تليجرام:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
