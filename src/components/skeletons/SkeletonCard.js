export default function SkeletonCard() {
    return (
        <div className="flex flex-col gap-4">
            {/* الحاوية بتستخدم متغيراتك */}
            <div className="relative aspect-[2/3] w-full rounded-[1.5rem] bg-slate-500/10 dark:bg-white/[0.03] overflow-hidden border border-slate-200/50 dark:border-white/5">
                
                {/* تأثير اللمعة (Shimmer) - خليناه يتناسب مع الـ Light/Dark */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-400/10 dark:via-white/[0.05] to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>

            {/* الأسطر الوهمية */}
            <div className="space-y-3 px-1">
                {/* العنوان الوهمي */}
                <div className="h-3 w-3/4 bg-slate-500/20 dark:bg-white/[0.05] rounded-full" />
                
                <div className="flex gap-2">
                    {/* السنة/النوع الوهمي */}
                    <div className="h-2 w-1/4 bg-slate-500/10 dark:bg-white/[0.03] rounded-full" />
                    <div className="h-2 w-1/4 bg-slate-500/10 dark:bg-white/[0.03] rounded-full" />
                </div>
            </div>
        </div>
    );
}
