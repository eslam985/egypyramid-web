// src/app/robots.js
export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://egypyramid.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/", // يسمح بالزحف إلى الموقع بالكامل تلقائياً بما فيه الصور والأصول
        disallow: [
          "/api/", // منع زحف مسارات الخلفية البرمجية
          "/search", // منع زحف صفحة البحث الرئيسية
          "/*?q=*", // منع أرشفة روابط نتائج البحث الداخلي لمنع السبام
          "/*?search=*", // إضافة حمائية: لمنع أي متغيرات بحث أخرى
          "/*/watch", // منع زحف صفحات المشاهدة نهائياً
          "/*/download/", // منع زحف صفحات التحميل نهائياً
          "/*?from=*", // منع كارثة الـ ?from= اللي عاملة 7 الاف دوبلكيت
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
