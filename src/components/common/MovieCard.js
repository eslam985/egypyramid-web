// src/components/common/MovieCard.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Star, Play, Layers } from 'lucide-react';
import { getCategory, optimizeCloudinary } from '@/lib/helpers';

export default function MovieCard({ media }) {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const [imgSrc, setImgSrc] = useState(optimizeCloudinary(media.poster_url, 200));

  const category = getCategory(media);
  const fromGenre = params.slug || null;
  const href = `/${category}/${media.slug}`;

  const handleClick = () => {
    if (fromGenre) {
      try { sessionStorage.setItem('lastGenre', fromGenre); } catch {}
    }
  };

  useEffect(() => setMounted(true), []);

  const defaultLogo = `https://res.cloudinary.com/dbahqgo8j/image/upload/q_auto,f_auto,w_195,h_280,c_fill/blogger/logo.avif`;

  if (!mounted) return (
    <div className="aspect-2/3 w-full rounded-2xl bg-(--foreground)/5 animate-shimmer border border-(--foreground)/5" />
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      prefetch={false}
      className="group block relative no-underline">
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-3xl bg-(--card-bg) border border-(--foreground)/10 group-hover:border-(--accent)/40 transition-[transform,border-color] duration-300 ease-out group-hover:-translate-y-2 shadow-xl isolate">
        <Image
          src={imgSrc}
          alt={media.title || "فيلم"}
          fill
          quality={65}
          className="object-cover transition-transform duration-300 ease-out lg:group-hover:scale-105"
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16.66vw, 200px"
          loading="lazy"
          decoding="async"
          onError={() => setImgSrc(defaultLogo)}
        />

        {/* التقييم */}
        <div className="absolute top-3 right-3 bg-slate-950/80 px-2 py-1 rounded-xl flex items-center gap-1 border border-white/10 shadow-xl z-20">
          <Star size={12} className="fill-(--accent) text-(--accent)" />
          <span className="text-fluid-xs font-black text-white tracking-tighter">
            {media.rating || "8.5"}
          </span>
        </div>

        {/* زر التشغيل */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-(--accent) flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-[opacity,transform] duration-300 shadow-lg">
            <Play size={30} className="fill-slate-950 text-slate-950 ml-1" />
          </div>
        </div>

        {/* تفاصيل الهوفر السفلي */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-(--accent) text-slate-950 px-2 py-0.5 rounded-md font-black text-[10px] uppercase shadow-lg">
                HD
              </span>
              <span className="text-white text-fluid-xs font-bold drop-shadow-md truncate max-w-[100px]">
                {media.genre || "أكشن"}
              </span>
            </div>
            <Layers size={14} className="text-white/70" />
          </div>
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="mt-3 space-y-1 px-1">
        <h2 className="text-[8px] md:text-fluid-p font-black text-(--foreground) line-clamp-1 group-hover:text-(--accent) transition-colors duration-300">
          {media.title}
        </h2>
        <div className="flex items-center gap-2 text-[6px] md:text-fluid-p text-(--foreground)/85 font-bold uppercase tracking-widest antialiased">
          {/* هنا هيظهر Series لو النوع tv أو series بفضل الـ helper */}
          <span>{category === "tv" ? "Series" : "Movie"}</span>
          <span className="w-1 h-1 bg-(--accent)/50 rounded-full shrink-0" />
          <span>{media.year || "2026"}</span>
        </div>
      </div>
    </Link>
  );
}
