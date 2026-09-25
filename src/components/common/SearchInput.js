// src/components/common/SearchInput.js
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchInput({ defaultValue = '', defaultType = 'all' }) {
    const [value, setValue] = useState(defaultValue);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        startTransition(() => {
            router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        });
    };

    const handleClear = () => {
        setValue('');
        router.push('/search');
    };

    return (
        <form onSubmit={handleSearch} className="relative max-w-2xl">
            <div className="relative flex items-center">
                <Search
                    size={20}
                    className="absolute right-4 text-(--foreground)/40 pointer-events-none"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="ابحث عن فيلم أو مسلسل..."
                    className="w-full pr-12 pl-12 py-4 bg-(--card-bg) border border-white/10 rounded-2xl text-(--foreground) text-sm font-medium placeholder:text-(--foreground)/30 focus:outline-none focus:border-(--accent)/50 focus:ring-2 focus:ring-(--accent)/10"
                    autoFocus
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute left-4 text-(--foreground)/40 hover:text-(--foreground) transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending || value.trim().length < 2}
                className="mt-3 px-8 py-3 bg-(--accent) text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isPending ? 'جاري البحث...' : 'بحث'}
            </button>
        </form>
    );
}