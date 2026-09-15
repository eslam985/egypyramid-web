// src/lib/helpers.js

// يحوّل media_type → category (للـ URL)
// src/lib/helpers.js

// 1. يحوّل media_type → category (للـ URL)
export function getCategory(media) {
  // لو الـ category موجودة أصلاً (tv أو movie) رجعها فوراً
  if (media.category === 'tv' || media.category === 'movie') return media.category;

  // التعديل هنا: لو النوع series أو tv، إذن التصنيف هو tv
  if (media.media_type === 'series' || media.media_type === 'tv') {
    return 'tv';
  }

  return 'movie';
}

// 2. يحوّل category → media_type (للـ DB queries)
// دي بنستخدمها لما نكون عايزين نبحث في القاعدة بناءً على رابط الـ URL
export function getMediaType(category) {
  if (category === 'tv') return ['series', 'tv']; // بنرجع مصفوفة عشان نستخدمها مع .in()
  return ['movie'];
}

/**
 * تنظيف وتحسين روابط كلاودناري
 * @param {string} url - الرابط الأصلي (مثلاً بـ 600x900)
 * @param {number} width - العرض المطلوب (الافتراضي 300)
 */
export const optimizeCloudinary = (url, width = 300, ratio = 1.5) => {
  if (!url || !url.includes('cloudinary.com')) return url || '/placeholder.jpg';

  const height = Math.round(width * ratio);
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  // تركاية: إزالة الامتداد الأصلي (مثل .jpg) من نهاية المسار قبل إضافة التحويل
  const imagePath = parts[1].replace(/\.[^/.]+$/, "");

  // هنا أنت حر.. الموقع هياخد avif عشان السرعة
  const transform = `c_fill,g_auto,w_${width},h_${height},q_auto:eco,f_avif`;

  return `${parts[0]}/upload/${transform}/${imagePath}`;
};
