// src/components/Navbar.js (Server Component)
import { supabase } from '@/lib/supabase';
import NavbarClient from './NavbarClient'; // استدعاء ملف الـ Client اللي غيرنا اسمه

export default async function Navbar() {
  // 1. جلب البيانات من السيرفر مباشرة
  const { data } = await supabase
    .from('genres')
    .select('id, name, slug, media_genres!inner(media_id)');

  // 2. معالجة البيانات (Logic)
  const uniqueGenres = data ? Array.from(new Map(data.map(item => [item.id, {
    id: item.id,
    name: item.name,
    slug: item.slug
  }])).values()).sort((a, b) => a.name.localeCompare(b.name)) : [];

  // 3. تمرير البيانات الجاهزة للمكون العميل
  return <NavbarClient initialGenres={uniqueGenres} />;
}
