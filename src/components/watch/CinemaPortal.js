'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CinemaPortal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('cinema-active');
      return;
    }

    document.body.style.overflow = 'hidden';
    // استهداف الـ html هو اللي بيكسر سجن الـ stacking context بتاع الثيمات
    document.documentElement.classList.add('cinema-active');

    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('cinema-active');
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        // نقصنا واحد من الماكس عشان نسيب مكان للمشغل يظهر فوقها
        zIndex: 2147483644, 
        background: 'rgba(0,0,0,0.97)',
        cursor: 'zoom-out',
      }}
      onClick={onClose}
    >
      {/* طبقة الـ blur في عنصر منفصل لضمان أفضل أداء ونقاء */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }} />
    </div>,
    document.body
  );
}
    