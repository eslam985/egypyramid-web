import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // 1. التحقق من الهوية (Authentication)
        const authHeader = req.headers.get('authorization');
        const secret = process.env.INDEXING_SECRET;

        if (!secret || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://egypyramid.vercel.app';

        let fullUrl = body.url;

        // 2. بناء الرابط في حالة إرسال record (مع تأمين المسارات)
        // 2. بناء الرابط (الأرشفة للرابط الأساسي وليس صفحة المشغل فقط)
        if (!fullUrl && body.record) {
            const { category, slug } = body.record;
            
            // تحويل category ليكون متوافق مع نظام الفولدرات عندك (movie/tv)
            const categoryPath = (category === 'series' || category === 'tv') ? 'tv' : 'movie';
            
            if (typeof category === 'string' && typeof slug === 'string') {
                // الأرشفة للرابط الأساسي للفيلم/المسلسل لضمان أفضل SEO
                fullUrl = `${baseUrl}/${categoryPath}/${slug}`;
            }
        }

        // 📝 نقطة فحص: التأكد من الرابط النهائي قبل الإرسال
        console.log(`🔎 محاولة أرشفة الرابط: ${fullUrl || 'URL NOT FOUND'}`);

        
        // 3. التحقق الأمني من الرابط (Validation) - **هام جداً**
        if (!fullUrl || !fullUrl.startsWith(baseUrl)) {
            return NextResponse.json({ error: 'Invalid or External URL' }, { status: 400 });
        }

        // 4. التحقق من وجود مفاتيح جوجل (防止 Server Crash)
        if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.error('Missing Google Credentials');
            return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),

            },
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexer = google.indexing({ version: 'v3', auth });

        // 5. إرسال الطلب لجوجل
        const response = await indexer.urlNotifications.publish({
            requestBody: {
                url: fullUrl,
                type: 'URL_UPDATED',
            },
        });

        // 📝 لوج النجاح: جوجل استلم الطلب
        console.log(`✅ تم إرسال الرابط لجوجل بنجاح: ${fullUrl}`);

        return NextResponse.json({
            success: true,
            urlSent: fullUrl,
            googleResponse: response.data
        });

    } catch (error) {
        // 📝 لوج تفصيلي للخطأ (مهم جداً لمعرفة لو الـ Quota خلصت أو الـ Key غلط)
        console.error('🔥 Google Indexing API Error:', {
            message: error.message,
            reason: error.response?.data?.error || 'Unknown Reason',
            url: fullUrl
        });
        
        return NextResponse.json({ 
            success: false, 
            error: 'Indexing Failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        }, { status: 500 });
    }
}
