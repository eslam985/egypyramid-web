import SectionHeader from '../common/SectionHeader';
import MovieCard from '../common/MovieCard';
import { Tv, Plus } from 'lucide-react';

export default function SeriesGrid({ series }) {
    if (!series?.data) return null;

    return (
        // التركة 1: استخدام py-fluid-section لتوحيد المسافات الرأسية
        <section className="relative  group/section overflow-hidden">
            <SectionHeader
                title="مسلسلات حصرية"
                subtitle="عالم من الدراما"
                icon={Tv}
                href="/genre/series"
            />

            <div className="relative">
                {/* التركة 2: استخدام gap-fluid-gap و px-fluid-p لضمان التناسق مع باقي السكاشن */}
                <div className="flex items-start overflow-x-auto gap-fluid-gap no-scrollbar pb-10 pt-6 mr-3  snap-x snap-mandatory scroll-smooth group/scroll">
                    {series.data.map((media, index) => (
                        <div
                            key={media.id}
                            // استخدام animate-fade-in-up المعرف في الـ Theme
                            className="flex-none w-40 md:w-52 snap-start transform transition-all duration-500 hover:-translate-y-2 animate-fade-in-up h-fit"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="relative group/card rounded-3xl isolate">
                                {/* استخدام متغير الـ Accent في التوهج الخلفي */}
                                <div className="absolute -inset-2 bg-(--accent)/5 rounded-4xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                                <MovieCard media={media} index={index + 5} />
                            </div>
                        </div>
                    ))}

                    {/* كارت "عرض المزيد" المعدل بالكامل */}
                    {/* كارت "عرض المزيد" المعدل بالكامل */}
                    <div className="flex-none w-40 md:w-52 snap-start">
                        <div className="aspect-2/3 flex items-center justify-center">
                            <a
                                href="/genre/series"
                                aria-label="عرض المزيد من المسلسلات" // ✅ حل مشكلة الـ Accessibility
                                className="group/more flex flex-col items-center gap-4 no-underline"
                            >
                                {/* تعديل الشفافية لحل مشكلة الـ Contrast */}
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-(--foreground)/30 flex items-center justify-center group-hover/more:border-(--accent) group-hover/more:scale-110 transition-all shadow-inner">
                                    <Tv size={24} className="text-(--foreground)/80 group-hover/more:text-(--accent)" />
                                </div>
                                {/* استخدام شفافية /80 بدل /60 لحل مشكلة التباين في التقرير */}
                                <span className="text-fluid-xs font-black uppercase tracking-widest text-(--foreground)/80 group-hover/more:text-(--accent)">
                                    عرض المزيد
                                </span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
