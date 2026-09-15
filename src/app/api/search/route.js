// src/app/api/search/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

function normalizeQuery(query) {
    if (!query) return "";

    // 1. تنظيف شامل للأحرف والرموز والتشكيل العربي
    let t = query.toLowerCase()
        .replace(/[\u064B-\u0652]/g, "") // حذف التشكيل (فتحة، ضمة، إلخ)
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, " "); // حذف الرموز

    // 2. قائمة الكلمات الزائدة (كلمات مفردة فقط لضمان الفلترة)
    const stopWords = [
        "مسلسل", "فيلم", "مترجم", "مدبلج", "كامل", "حصريا", "اونلاين", "مشاهدة", 
        "تحميل", "بجودة", "عالية", "hd", "sd", "4k", "web-dl", "bluray",
        "season", "episode", "سيزون", "حلقة", "موسم", "اون", "لاين", "مسلسلات", 
        "افلام", "مترجمة", "مدبلجة", "كاملة", "حصرياً", "يا", "بوت", "ابعتلي", 
        "عايز", "عايزه", "عايزين", "اريد", "وريني", "ارسل", "هات", "جيب", 
        "محتاج", "محتاجه", "ابعت", "ارسلي", "ممكن", "لو", "سمحت", "من", "فضلك"
    ];

    // 3. تقسيم النص وتصفية الكلمات (حتى لو كانت قريبة من بعضها)
    const words = t.trim().split(/\s+/);
    const filteredWords = words.filter(word => {
        // حذف الكلمة إذا كانت موجودة في قائمة الـ stopWords أو طولها حرف واحد (مثل "و")
        return !stopWords.some(stop => word === stop) && word.length > 1;
    });

    // 4. إعادة التجميع
    const cleanResult = filteredWords.join(" ");
    
    // ملاحظة تقنية: إذا حذفنا كل شيء (مثل مستخدم كتب "يا بوت") نرجع النص الأصلي كخيار أخير
    return cleanResult || t.trim(); 
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    let rawQuery = searchParams.get('q') || '';

    // تنظيف النص
    const q = normalizeQuery(rawQuery);

    // 1. فحص الطول بعد التنظيف (لو بقيت كلمة واحدة بعد الحذف يقبلها)
    if (!q || q.length < 2) return NextResponse.json([]);
    if (q.length > 50) return NextResponse.json({ error: "Query too long" }, { status: 400 });

    // 2. تحويل "لعبة الحب" إلى "%لعبة%الحب%"
    const flexibleQuery = `%${q.replace(/\s+/g, '%')}%`;

    const { data, error } = await supabase
        .from('medias')
        .select('id, title, slug, poster_url, category, year, story, runtime, labels, rating')
        .or(`title.ilike.${flexibleQuery},story.ilike.${flexibleQuery}`)
        .order('created_at', { ascending: false })
        .limit(6);

    if (error) {
        console.error('Search Error:', error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    // إضافة Headers لمنع الكاش تماماً من جهة السيرفر
    return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Content-Type': 'application/json',
        },
    });
}