// /media/es/DDrive/projects/web-Next.js/src/app/loading.js
import SkeletonCard from '../components/skeletons/SkeletonCard';
import SkeletonHero from '../components/skeletons/SkeletonHero';

export default function Loading() {
    return (
        <main className="min-h-screen bg-(--background) pb-20 space-y-24 overflow-x-hidden">
            <SkeletonHero />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-24">
                {/* QuickGenres Skeleton */}
                <div className="flex gap-4 overflow-hidden py-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-none w-32 h-12 bg-slate-500/10 dark:bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>

                {/* الأفلام Skeleton */}
                <section className="space-y-8">
                    <div className="h-8 w-48 bg-slate-500/20 dark:bg-white/5 rounded-lg animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </section>

                {/* Top Rated Skeleton */}
                <section className="space-y-8">
                    <div className="h-8 w-64 bg-slate-500/20 dark:bg-white/5 rounded-lg animate-pulse" />
                    <div className="flex gap-16 overflow-hidden pt-10">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="relative flex-none w-44 md:w-56 space-y-4">
                                <div className="absolute -left-10 -top-10 h-32 w-20 bg-slate-500/10 dark:bg-white/5 rounded-3xl opacity-20" />
                                <SkeletonCard />
                            </div>
                        ))}
                    </div>
                </section>

                {/* المسلسلات والحلقات Skeleton */}
                <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-8 w-48 bg-slate-500/20 dark:bg-white/5 rounded-lg animate-pulse" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="h-8 w-40 bg-slate-500/20 dark:bg-white/5 rounded-lg animate-pulse" />
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 w-full bg-slate-500/10 dark:bg-white/5 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
