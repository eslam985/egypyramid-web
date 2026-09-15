// /media/es/DDrive/projects/web-Next/egypyramid-web/src/app/api/telegram/webhook/route.js
import { NextResponse } from 'next/server';
import { searchMovies, formatMovieCaption } from '../../../../lib/telegram-service';


export async function POST(request) {
    try {

        const payload = await request.json();

        // التحقق إنها رسالة نصية من مستخدم
        if (!payload.message || !payload.message.text) {
            return NextResponse.json({ ok: true });
        }

        const chatId = payload.message.chat.id;
        const query = payload.message.text;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const channelId = process.env.TELEGRAM_CHAT_ID; // معرف القناة للإجبار
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypyramid.vercel.app";

        const userId = payload.message.from.id;
        const username = payload.message.from.username || "Unknown";

        // 📝 لوج لمتابعة من يبحث وعن ماذا
        console.log(`📩 رسالة جديدة من [@${username}]: "${query}"`);

        const checkMember = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelId}&user_id=${userId}`);
        const memberData = await checkMember.json();

        // 📝 لوج لفحص استجابة تليجرام في التحقق من العضوية
        if (!memberData.ok) {
            console.error(`⚠️ فشل فحص العضوية لـ ${userId}:`, memberData.description);
        }

        const isMember = ['member', 'administrator', 'creator'].includes(memberData.result?.status);

        // ✨ إضافة أمر الترحيب /start
        if (query === '/start') {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `👋 <b>أهلاً بك في بوت Egy Pyramid الرسمي!</b>\n\nهنا تقدر تبحث عن أي فيلم أو مسلسل في ثواني وتوصل لرابط المشاهدة المباشر.\n\n🔍 <b>جرب دلوقتي:</b> اكتب اسم العمل اللي بتدور عليه وهبعتلك البوستر والتفاصيل فوراً!`,
                    parse_mode: 'HTML',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: '🌐 زيارة الموقع الرسمي', url: siteUrl }],
                            [{ text: '📢 قناة التحديثات', url: 'https://t.me/EgyPyramid' }]
                        ]
                    })
                })
            });
            return NextResponse.json({ ok: true });
        }

        // لو مش مشترك نطلب منه يشترك
        if (!isMember) {
            const channelLink = "https://t.me/egypyramid";
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: "⚠️ عذراً يا صديقي، يجب عليك الاشتراك في قناة الموقع أولاً لتتمكن من استخدام ميزة البحث واستلام أحدث الأفلام!",
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: "📢 اشترك في القناة من هنا", url: channelLink }],
                            [{ text: "✅ تم الاشتراك، ابحث الآن", callback_data: "check_again" }]
                        ]
                    })
                })
            });
            return NextResponse.json({ ok: true });
        }

        if (query.trim().length < 3) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: "⚠️ من فضلك اكتب اسم الفيلم أو المسلسل بشكل كامل (3 حروف على الأقل) عشان أقدر ألاقيه لك."
                })
            });
            return NextResponse.json({ ok: true });
        }

        const movie = await searchMovies(query);

        if (!movie) {
            console.log(`🔍 لم يتم العثور على نتائج للبحث: "${query}"`);
            // ... الباقي كما هو
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `🔍 للأسف مش لاقي عمل باسم "${query}" في البوت..\n\n💡 جرب تبحث في الموقع مباشرة، ممكن تلاقيه هناك!`,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: "🍿 ابحث الآن في (الموقع الرسمي)", url: `${siteUrl}/search?q=${encodeURIComponent(query)}` }]
                        ]
                    })
                })
            });
            return NextResponse.json({ ok: true });
        }

        const { caption, url, photo } = formatMovieCaption(movie, siteUrl);
        // محاولة إرسال الصورة أولاً
        const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                photo: photo,
                caption: caption,
                parse_mode: 'HTML',
                reply_markup: JSON.stringify({
                    inline_keyboard: [[{ text: "🍿 شاهد الآن", url: url }]]
                })
            })
        });

        const photoResult = await photoResponse.json();

        if (!photoResult.ok) {
            // 📝 تفصيل الخطأ (غالباً بيكون رابط الصورة أو صيغتها)
            console.error(`❌ فشل إرسال الصورة لـ [${movie.title}]:`, photoResult.description);
            console.log(`🔗 رابط الصورة المرفوض: ${photo}`);
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: caption,
                    parse_mode: 'HTML',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[{ text: "🍿 شاهد الآن", url: url }]]
                    })
                })
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('🔥 Webhook Critical Error:', error.message);
        // نرد بـ ok: true لتليجرام عشان ميفضلش يعيد المحاولة ويبوظ الـ Queue
        return NextResponse.json({ ok: false, error: error.message });
    }
}