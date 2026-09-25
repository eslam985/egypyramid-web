'use client';
import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.scrollY > 200);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!isVisible) return null;

    return (
        <button 
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 z-50 w-12 h-12 bg-yellow-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 duration-300 animate-fadeInUp border-4 border-[var(--background)]"
        >
            <ChevronUp size={24} />
        </button>
    );
}
