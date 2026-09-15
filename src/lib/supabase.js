//media/es/DDrive/projects/web-Next/egypyramid-web/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🛑 CRITICAL: Supabase credentials are missing in Environment Variables!');
  throw new Error('Supabase URL or Anon Key is missing');
} else {
  // تظهر فقط في الـ Build/Start للتأكد من الربط
  if (process.env.NODE_ENV === 'production') {
    console.log('🔗 Supabase Client Initialized with ISR Cache (3600s)');
  }
}

// إنشاء العميل بإعدادات "السرعة القصوى" للقراءة فقط
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  // ✅ التعديل السحري: السماح بـ Next.js Cache (ISR/SSG)
  // ده هيخلي البيانات تظهر في أجزاء من الثانية لأنها متخزنة كـ Static HTML
  global: {
    fetch: async (url, options) => {
      const start = Date.now();
      try {
        const response = await fetch(url, {
          ...options,
          next: { revalidate: 3600 }
        });

        const duration = Date.now() - start;

        // 📝 لوج لمراقبة أداء سوبابيز وسرعة الاستجابة في الـ Production
        if (process.env.NODE_ENV === 'production' && !url.includes('postgrest/v1/rpc')) {
          console.log(`📡 [Supabase] ${options.method || 'GET'} | ${duration}ms | Status: ${response.status}`);
        }

        if (!response.ok) {
          console.error(`❌ Supabase Fetch Error: ${response.status} لطلب: ${url}`);
        }

        return response;
      } catch (error) {
        console.error('🔥 Network Error (Supabase):', error.message);
        throw error;
      }
    },
  },
});
