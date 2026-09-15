// /media/es/DDrive/projects/web-Next.js/src/components/skeletons/SkeletonHero.js
export default function SkeletonHero() {
    return (
        /* bg-slate-500/10 بتدي رمادي شفاف في النور وبتبان خافتة في الضلمة */
        <div className="relative h-[70vh] md:h-[85vh] w-full bg-slate-500/10 dark:bg-slate-900/50 animate-pulse flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full space-y-6">
                <div className="h-4 w-32 bg-slate-500/20 dark:bg-white/5 rounded-full" />
                <div className="h-16 md:h-24 w-2/3 bg-slate-500/20 dark:bg-white/5 rounded-3xl" />
                <div className="h-6 w-1/2 bg-slate-500/20 dark:bg-white/5 rounded-full" />
                <div className="h-14 w-44 bg-slate-500/20 dark:bg-white/5 rounded-2xl" />
            </div>
        </div>
    );
}
