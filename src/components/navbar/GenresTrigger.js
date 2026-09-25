'use client';
import { ChevronDown } from 'lucide-react';

// هنا أنت استلمت Prop اسمه isOpen
export default function GenresTrigger({ onOpen, onClose, isOpen }) {
    return (
        <button
            onMouseEnter={onOpen}
            onMouseLeave={onClose}
            className="group flex items-center gap-1.5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-500 duration-300 bg-transparent border-none cursor-pointer"
        >
            التصنيفات
            <ChevronDown
                size={14}
                // التغيير هنا: استخدم isOpen بدل isMegaMenuOpen
                className={`transition-transform duration-500 ease-out ${isOpen ? 'rotate-180 text-yellow-600 dark:text-yellow-500' : 'group-hover:translate-y-0.5'
                    }`}
            />
        </button>
    );
}
