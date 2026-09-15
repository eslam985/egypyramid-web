// src/lib/telegram-service.js

export async function searchMovies(query) {
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypyramid.vercel.app";

        // 🚀 البحث المتكيش عبر الـ API مع نظام الهوية لتخطي الـ Middleware وتوفير الكوتة 
        const response = await fetch(`${siteUrl}/api/search?q=${encodeURIComponent(query)}`, {
            cache: 'no-store',
            next: { revalidate: 0 },
            headers: {
                // 🛡️ إرسال السكرت لتعريف البوت لنفسه عند الـ Middleware
                'Authorization': `Bearer ${process.env.INDEXING_SECRET}`,
                // 🛡️ إرسال User-Agent طويل لتخطي فحص الـ (ua.length < 10)
                'User-Agent': 'EgyPyramid-Internal-Bot-v1.0'
            }
        });
        const searchResults = await response.json();

        // 📝 نقطة فحص: التأكد من رد الـ API وعدد النتائج
        if (!response.ok) {
            console.error(`❌ فشل طلب البحث: ${response.status} ${response.statusText}`);
            return null;
        }

        if (!searchResults || searchResults.length === 0) {
            console.log(`⚠️ لا توجد نتائج مطابقة في قاعدة البيانات لـ: "${query}"`);
            return null;
        }

        console.log(`✅ تم العثور على ${searchResults.length} نتيجة. اختيار الأفضل: ${searchResults[0].title}`);
        return searchResults[0];

    } catch (err) {
        console.error('🔥 Search Strategy Critical Error:', {
            message: err.message,
            query: query,
            stack: err.stack?.split('\n')[1] // سطر الخطأ فقط للاختصار
        });
        return null;
    }
}

export function formatMovieCaption(movie, siteUrl) {
    const categoryPath = (movie.category === 'series' || movie.category === 'tv') ? 'tv' : 'movie';
    const fullUrl = `${siteUrl}/${categoryPath}/${movie.slug}`;
    const headLine = categoryPath === 'tv' ? '📺 مسلسل جديد بانتظارك!' : '🎬 فيلم السهرة وصل.. Enjoy!';
    // --- منطق تحويل الصورة لتناسب تليجرام ---
    // --- منطق تحويل الصورة لتناسب تليجرام (الإصدار الاحترافي) ---
    let telegramPhoto = movie.poster_url || null;
    const originalPhoto = telegramPhoto;

    if (telegramPhoto && telegramPhoto.includes('cloudinary.com')) {
        telegramPhoto = telegramPhoto
            .replace(/\.avif/g, '.jpg')
            .replace(/f_avif|f_auto|f_webp/g, 'f_jpg');

        // 📝 لوج للتأكد من نجاح التحويل لصيغة JPG
        if (originalPhoto !== telegramPhoto) {
            console.log(`📸 تم تحويل البوستر: [${movie.title}] من ${originalPhoto.split('.').pop()} إلى JPG`);
        }
    }
    const hashtags = movie.labels
        ? movie.labels.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== "")
            .map(tag => `#${tag.replace(/[\s()]/g, '_')}`)
            .join(' ') + ' #EgyPyramid'
        : '#EgyPyramid';

    const caption = `🌟 <b>${headLine}</b>

🎬 <b>الاسم:</b> ${movie.title}
⏳ <b>مدة العرض:</b> ${movie.runtime || 'N/A'}
📂 <b>التصنيف:</b> ${categoryPath === 'tv' ? 'مسلسل' : 'فيلم'}
⭐ <b>التقييم:</b> ${movie.rating || 'N/A'}
📆 <b>السنة:</b> ${movie.year || 'N/A'}

📝 <b>قصة العمل:</b>
${movie.story ? movie.story.substring(0, 600) + '...' : 'لا يوجد وصف حالياً.'}

🔗 <b>شاهد الآن:</b>
${fullUrl}

${hashtags}`;


    return {
        caption: caption,
        url: fullUrl,
        photo: telegramPhoto // نستخدم الرابط المعدل هنا
    };
}