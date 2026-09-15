// /media/es/DDrive/projects/web-Next.js/src/components/navbar/ThemeToggle.js
// src/components/navbar/ThemeToggle.js
'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // التأكد من أن المكون تم تحميله في المتصفح قبل الرندر
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-2.5 w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode" // ✅ السطر اللي هيحل المشكلة
      className="p-2.5 rounded-xl bg-(--background)  border border-(--border-color)  text-yellow-500 transition-all active:scale-90"
    >
      {mounted && (theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />)}
    </button>
  );

}
