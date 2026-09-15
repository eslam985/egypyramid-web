// /app/api/facebook/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { waitUntil } from "@vercel/functions";

// ============================================================
// PRO TEMPLATE LIBRARY - Dynamic, Engaging, Algorithm-Optimized
// Randomly selects post structures to maximize Facebook reach
// No external links, no comments, pure organic engagement
// ============================================================

// The pinned post that contains all watch links (internal Facebook link)
const PINNED_POST_URL = "https://www.facebook.com/share/p/1BnnAsRwT1/";

// Helper: Clean HTML tags and truncate text
const cleanAndTruncate = (text, maxLength = 200) => {
  if (!text) return "";
  const cleaned = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + "…" : cleaned;
};

// Helper: Get random emoji based on genre tags
const getGenreEmoji = (labelsString = "") => {
  const labels = labelsString.toLowerCase();
  if (labels.includes("اكشن") || labels.includes("action")) return "💥⚡️";
  if (labels.includes("كوميدي") || labels.includes("comedy")) return "😂🤣";
  if (labels.includes("دراما") || labels.includes("drama")) return "🎭🎬";
  if (labels.includes("رعب") || labels.includes("horror")) return "🔪👻";
  if (labels.includes("رومانسي") || labels.includes("romance")) return "💕😍";
  if (labels.includes("خيال") || labels.includes("fantasy")) return "🧙‍♂️🐉";
  if (labels.includes("اثارة") || labels.includes("thriller")) return "🔫😱";
  return "🔥🎬";
};

// Helper: Random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ============================================================
// TEMPLATES FOR MOVIES (🎬)
// ============================================================
const MOVIE_TEMPLATES = [
  // Template 1: Enthusiastic hook + short description
  (ctx) => `🔥 حماس لا يوصف! فيلم "${ctx.title}" (${ctx.year}) الآن بين أيديكم.\n${ctx.shortDesc ? `📖 ${ctx.shortDesc}\n` : ''}\n${ctx.genreEmoji} ${ctx.tags}\n\n👇 شاهد من الرابط أدناه:\n${PINNED_POST_URL}`,
  
  // Template 2: Question to spark curiosity
  (ctx) => `🤔 هل تبحث عن فيلم يقضي به وقت ممتع؟ \n✅ "${ctx.title}" هو خيارك الأمثل!\n${ctx.shortDesc ? `🎬 القصة: ${ctx.shortDesc}\n` : ''}\n${ctx.tags}\n\n🎟️ تفضل بالمشاهدة من هنا:\n${PINNED_POST_URL}`,
  
  // Template 3: Short and punchy
  (ctx) => `🎬 ${ctx.title} | ${ctx.year}\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📌 ${ctx.shortDesc}\n` : ''}\n🎥 المشاهدة عبر الرابط بالأسفل 👇\n${PINNED_POST_URL}`,
  
  // Template 4: Hyped with emoji rain
  (ctx) => `⚡️ ${ctx.emojiRain} فيلم السهرة: ${ctx.title} ${ctx.emojiRain}\n📅 سنة الإصدار: ${ctx.year}\n${ctx.shortDesc ? `📝 ملخص: ${ctx.shortDesc}\n` : ''}\n${ctx.tags}\n🍿 لا تفوت الفرصة، شاهد الآن:\n${PINNED_POST_URL}`,
  
  // Template 5: Recommendation style
  (ctx) => `💎 توصية اليوم:\nفيلم ${ctx.title} - ${ctx.year}\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📄 ${ctx.shortDesc}\n` : ''}\n👆 اضغط على الرابط للمشاهدة (بدون إزعاج):\n${PINNED_POST_URL}`,
  
  // Template 6: Engaging "Did you know?" style
  (ctx) => `🎯 مين جرب يشوف ${ctx.title}؟\n${ctx.shortDesc ? `القصة: ${ctx.shortDesc}\n` : ''}${ctx.genreEmoji} ${ctx.tags}\n🔥 الفيلم يستحق وقتك بجد!\n🔗 شاهد من الرابط الثابت:\n${PINNED_POST_URL}`,
  
  // Template 7: Action-oriented
  (ctx) => `🎬${ctx.genreEmoji} استعد للإثارة مع ${ctx.title} (${ctx.year})\n${ctx.shortDesc ? `${ctx.shortDesc}\n` : ''}${ctx.tags}\n✅ متاح الآن للمشاهدة الفورية عبر الرابط أدناه:\n${PINNED_POST_URL}`,
  
  // Template 8: Short + mysterious
  (ctx) => `🕵️‍♂️ ${ctx.title} (${ctx.year})\n${ctx.genreEmoji}\n${ctx.shortDesc ? `✨ ${ctx.shortDesc}\n` : ''}${ctx.tags}\n🎫 للمشاهدة (دون مغادرة فيسبوك):\n${PINNED_POST_URL}`,
  
  // Template 9: Fan engagement style
  (ctx) => `🎞️ عشاق ${ctx.labels?.[0] || "السينما"} 🤝 هذا الفيلم لكم:\n👑 ${ctx.title} | ${ctx.year}\n${ctx.shortDesc ? `📖 ${ctx.shortDesc}\n` : ''}${ctx.tags}\n🎁 رابط المشاهدة المباشر (موجود في المنشور المثبت):\n${PINNED_POST_URL}`,
  
  // Template 10: Countdown fake but hype
  (ctx) => `⏰ وقت الفيلم! اختارنا لك:\n🎬 ${ctx.title} (${ctx.year})\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📜 ${ctx.shortDesc}\n` : ''}\n🎟️ تفضل بالدخول من هنا:\n${PINNED_POST_URL}`,
  
  // Template 11: "Best of" style
  (ctx) => `🏆 من أفضل أفلام ${ctx.year}؟\n🔥 ${ctx.title} يستحق مكانه!\n${ctx.shortDesc ? `📌 ${ctx.shortDesc}\n` : ''}${ctx.tags}\n🎯 المشاهدة عبر الرابط بالأسفل:\n${PINNED_POST_URL}`,
  
  // Template 12: Minimalist but strong
  (ctx) => `${ctx.genreEmoji} ${ctx.title} | ${ctx.year}\n${ctx.tags}\n${ctx.shortDesc ? `${ctx.shortDesc}\n` : ''}⬇️ شاهد بالضغط على الرابط:\n${PINNED_POST_URL}`,
  
  // Template 13: Direct call to action
  (ctx) => `🎫 اضغط على الرابط التالي لمشاهدة الفيلم:\n🎬 ${ctx.title} (${ctx.year})\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📖 ${ctx.shortDesc}\n` : ''}👇\n${PINNED_POST_URL}`,
  
  // Template 14: Emotional hook
  (ctx) => `❤️ فيلم هياخدك في رحلة مشاعر:\n🎬 ${ctx.title} (${ctx.year})\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `✨ ${ctx.shortDesc}\n` : ''}🎁 للمشاهدة (رابط آمن):\n${PINNED_POST_URL}`,
  
  // Template 15: Celebratory style
  (ctx) => `🥳 الفيلم المنتظر ${ctx.title} نزل!\n📅 ${ctx.year} - ${ctx.genreEmoji}\n${ctx.shortDesc ? `${ctx.shortDesc}\n` : ''}${ctx.tags}\n🎬 شاهد الآن عبر الرابط (بدون روابط خارجية):\n${PINNED_POST_URL}`,
];

// ============================================================
// TEMPLATES FOR SERIES (📺)
// ============================================================
const SERIES_TEMPLATES = [
  // Template 1: Binge-watch hook
  (ctx) => `📺 مسلسل ${ctx.title} - ماراثون الحلقات جاهز!\n${ctx.shortDesc ? `📝 ${ctx.shortDesc}\n` : ''}${ctx.genreEmoji} ${ctx.tags}\n🔥 لا تفوت الحماس، شاهد عبر الرابط:\n${PINNED_POST_URL}`,
  
  // Template 2: Episode excitement
  (ctx) => `🎬 الحلقة الجديدة من ${ctx.title} نار 🔥\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📖 ${ctx.shortDesc}\n` : ''}🍿 تابع المسلسل من هنا:\n${PINNED_POST_URL}`,
  
  // Template 3: Question about series
  (ctx) => `🤔 مين تابع ${ctx.title}؟ إيه رأيك في الأحداث؟\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📌 ${ctx.shortDesc}\n` : ''}🎁 للمشاهدة (الرابط أدناه):\n${PINNED_POST_URL}`,
  
  // Template 4: Hype style
  (ctx) => `🚀 مسلسل ${ctx.title} انطلق بقوة!\n📅 ${ctx.year}\n${ctx.genreEmoji}\n${ctx.shortDesc ? `✨ ${ctx.shortDesc}\n` : ''}${ctx.tags}\n⬇️ تابع الحلقات من الرابط:\n${PINNED_POST_URL}`,
  
  // Template 5: Recommendation
  (ctx) => `💡 لو بتحب ${ctx.labels?.[0] || "المسلسلات المشوقة"}، ${ctx.title} مناسب لك.\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📋 ${ctx.shortDesc}\n` : ''}🎥 شاهد الآن:\n${PINNED_POST_URL}`,
  
  // Template 6: Short and addictive
  (ctx) => `😍 إدمان بمعنى الكلمة: ${ctx.title}\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `${ctx.shortDesc}\n` : ''}🔗 للمشاهدة (المنشور المثبت):\n${PINNED_POST_URL}`,
  
  // Template 7: "Finally here"
  (ctx) => `🎉 أخيراً! مسلسل ${ctx.title} متوفر.\n${ctx.year} - ${ctx.genreEmoji}\n${ctx.shortDesc ? `📖 القصة: ${ctx.shortDesc}\n` : ''}${ctx.tags}\n🍿 ادخل من الرابط وابدأ المتابعة:\n${PINNED_POST_URL}`,
  
  // Template 8: Mystery hook
  (ctx) => `🔮 مسلسل ${ctx.title} هيعيشك في أحداث لا تُنسى.\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `${ctx.shortDesc}\n` : ''}🎬 الرابط بالمصدر (آمن):\n${PINNED_POST_URL}`,
  
  // Template 9: Time killer
  (ctx) => `⏳ عاوز تضيع وقتك في حاجة مفيدة؟ ${ctx.title} هو الحل.\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📄 ${ctx.shortDesc}\n` : ''}📺 شاهد من الرابط:\n${PINNED_POST_URL}`,
  
  // Template 10: Dramatic style
  (ctx) => `🎭 دراما آسرة في مسلسل ${ctx.title}\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📜 ${ctx.shortDesc}\n` : ''}🔥 لا تفوت المشاهدة عبر الرابط:\n${PINNED_POST_URL}`,
  
  // Template 11: "Start now"
  (ctx) => `▶️ اضغط PLAY الآن:\nمسلسل ${ctx.title} (${ctx.year})\n${ctx.genreEmoji}\n${ctx.shortDesc ? `${ctx.shortDesc}\n` : ''}${ctx.tags}\n👇 المشاهدة من هنا:\n${PINNED_POST_URL}`,
  
  // Template 12: Social proof style
  (ctx) => `⭐️⭐️⭐️⭐️ مسلسل ${ctx.title} ينال إعجاب المشاهدين!\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `📖 ${ctx.shortDesc}\n` : ''}🎟️ تفضل بالدخول إلى عالم المسلسل:\n${PINNED_POST_URL}`,
  
  // Template 13: Marathon call
  (ctx) => `🏃‍♂️ استعد للماراثون: ${ctx.title} كامل الحلقات.\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `✨ ${ctx.shortDesc}\n` : ''}🔗 شاهد الآن (رابط واحد فقط):\n${PINNED_POST_URL}`,
  
  // Template 14: Direct message
  (ctx) => `📢 مسلسل ${ctx.title} متاح للمشاهدة.\n${ctx.year} - ${ctx.genreEmoji}\n${ctx.tags}\n${ctx.shortDesc ? `📌 ${ctx.shortDesc}\n` : ''}🎬 الرابط بالأسفل:\n${PINNED_POST_URL}`,
  
  // Template 15: Emotion + hype
  (ctx) => `💢 مسلسل ${ctx.title} هيشد أعصابك!\n${ctx.genreEmoji} ${ctx.tags}\n${ctx.shortDesc ? `${ctx.shortDesc}\n` : ''}🔥 شاهد الحلقات من الرابط المثبت:\n${PINNED_POST_URL}`,
];

// Build dynamic post content
function buildPostMessage(movie, isSeries, shortDesc, tags) {
  const labelsArray = movie.labels?.split(",").map(s => s.trim()) || [];
  const primaryGenre = labelsArray[0] || (isSeries ? "دراما" : "أكشن");
  const genreEmoji = getGenreEmoji(movie.labels);
  
  // Random emoji rain for some templates
  const emojiRain = randomItem(["✨", "🔥", "💥", "🎉", "💫", "⚡️", "🍿"]);
  
  const context = {
    title: movie.title,
    year: movie.year || "2026",
    shortDesc: shortDesc,
    tags: tags,
    genreEmoji: genreEmoji,
    emojiRain: emojiRain,
    labels: labelsArray,
    primaryGenre: primaryGenre,
    typeEmoji: isSeries ? "📺" : "🎬",
  };
  
  // Choose template library based on type
  const templates = isSeries ? SERIES_TEMPLATES : MOVIE_TEMPLATES;
  const selectedTemplate = randomItem(templates);
  let message = selectedTemplate(context);
  
  // Ensure the message ends with the pinned post URL (as safety)
  if (!message.includes(PINNED_POST_URL)) {
    message += `\n\n🎯 رابط المشاهدة (المنشور المثبت):\n${PINNED_POST_URL}`;
  }
  
  // Facebook post character limit is 63,206; we are well within
  return message.slice(0, 5000); // extra safety
}

// Core publishing logic
async function handleFacebookPublish(supabase, movie, pageId, accessToken, fbPoster) {
  try {
    const fbPhotoUrl = `https://graph.facebook.com/v21.0/${pageId}/photos`;
    
    const isSeries = movie.media_type === 'series' || movie.category === 'tv' || movie.category === 'series';
    const typeWord = isSeries ? 'مسلسل' : 'فيلم';
    
    // Prepare hashtags (max 3 relevant tags)
    const rawTags = (movie.labels || "")
      .split(",")
      .map(t => t.trim())
      .filter(t => t)
      .slice(0, 3)
      .map(t => `#${t.replace(/\s+/g, "_")}`);
    
    // Add type-specific hashtag
    if (isSeries) rawTags.push("#مسلسل");
    else rawTags.push("#فيلم");
    rawTags.push("#EgyPyramid");
    const tagsString = rawTags.join(" ");
    
    // Clean short description (remove HTML, limit)
    const cleanStory = movie.story ? cleanAndTruncate(movie.story, 180) : "";
    
    // Build dynamic message using templates
    const message = buildPostMessage(movie, isSeries, cleanStory, tagsString);
    
    // Prepare image URL with Facebook-friendly format
    let finalPosterUrl = fbPoster;
    if (finalPosterUrl.includes("res.cloudinary.com")) {
      finalPosterUrl = finalPosterUrl
        .replace("/upload/v1/", "/upload/w_1200,c_limit,f_jpg,q_auto/v1/")
        .replace(/f_avif|f_webp/g, "f_jpg")
        .replace(/\.(avif|webp)/, ".jpg");
    }
    
    // Facebook API call
    const response = await fetch(fbPhotoUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: finalPosterUrl,
        message: message,
        access_token: accessToken,
        accessibility_caption: `${movie.title} (${movie.year}) - ${typeWord}`,
        // No 'link' field to avoid external URL penalty
        // No 'published' false - we want instant publish
      }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      const { error: dbError } = await supabase.from("medias").update({
        is_facebook_posted: true,
        facebook_posted_at: new Date().toISOString(),
      }).eq("id", movie.id);
      
      if (dbError) {
        console.error("❌ تحديث قاعدة البيانات فشل:", dbError.message);
      } else {
        console.log(`✅ Successfully posted ${movie.title} (${typeWord}) to Facebook`);
      }
    } else {
      // علّم انه فشل عشان ما يعيدش نفس الفيلم للأبد لمنع اللوب اللانهائي
      const { error: dbError } = await supabase.from("medias").update({
        facebook_posted_at: new Date().toISOString(),
      }).eq("id", movie.id);
      
      if (dbError) console.error("❌ تحديث قاعدة البيانات لحالة الفشل فشل:", dbError.message);
      
      throw new Error(JSON.stringify(result));
    }
  } catch (error) {
    console.error("❌ Facebook publish failed:", error);
    // Don't throw to avoid breaking the cron, but log
  }
}

// ============================================================
// MAIN API ROUTE (POST)
// ============================================================
export async function POST(request) {
  // Security: verify secret token
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.INDEXING_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    
    // Fetch next unpublished movie/series
    const { data: movie, error: movieError } = await supabase
      .from("medias")
      .select("*")
      .eq("is_ready", true)
      .eq("is_facebook_posted", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    
    if (movieError || !movie) {
      return NextResponse.json({ message: "No pending movies or series to publish" });
    }
    
    // Optional cooldown between posts (random 60-200 minutes)
    const { data: lastPost } = await supabase
      .from("medias")
      .select("facebook_posted_at")
      .eq("is_facebook_posted", true)
      .order("facebook_posted_at", { ascending: false })
      .limit(1)
      .single();
    
    if (lastPost?.facebook_posted_at) {
      const minutesSinceLastPost = (Date.now() - new Date(lastPost.facebook_posted_at).getTime()) / 60000;
      const randomCooldownMinutes = Math.floor(Math.random() * 141) + 60; // 60 to 200 minutes
      if (minutesSinceLastPost < randomCooldownMinutes) {
        const waitRemaining = Math.ceil(randomCooldownMinutes - minutesSinceLastPost);
        return NextResponse.json({
          message: `Cooldown active. Waiting ${waitRemaining} minutes before next post.`,
        });
      }
    }
    
    // Prepare Facebook credentials
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!pageId || !accessToken) {
      throw new Error("Missing Facebook page credentials");
    }
    
    // Optimize poster URL (Cloudinary JPG conversion is critical for Facebook)
    let fbPoster = movie.poster_url || "https://via.placeholder.com/1200x630?text=Movie+Poster";
    if (fbPoster.includes("res.cloudinary.com")) {
      fbPoster = fbPoster
        .replace("/upload/v1/", "/upload/w_1000,c_limit,f_jpg/v1/")
        .replace(/f_avif|f_webp/g, "f_jpg")
        .replace(/\.(avif|webp)/, ".jpg");
    }
    
    // Async publish with Vercel waitUntil (No await)
    waitUntil(
      handleFacebookPublish(supabase, movie, pageId, accessToken, fbPoster)
    );
    
    return NextResponse.json({
      success: true,
      message: `🚀 Publishing "${movie.title}" to Facebook with dynamic template.`,
    });
    
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}