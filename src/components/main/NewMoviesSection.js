// /media/es/DDrive/projects/web-Next.js/src/components/NewMoviesSection.js
import SectionHeader from '../common/SectionHeader';
import MovieCard from '../common/MovieCard';
import { Film } from 'lucide-react';

export default function MoviesGrid({ movies }) {
  if (!movies?.data || movies.data.length === 0) return null;


  return (
    <section className="relative group/section ">
      <SectionHeader
        title="أفلام جديدة"
        subtitle="أحدث ما أضيف للمكتبة"
        icon={Film}
        href="/genre/movies"
      />

      {/* Container السكرول مع تأثير Masking */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-2 md:gap-6 no-scrollbar mr-2 py-2 md:py-fluid-p snap-x snap-mandatory scroll-smooth group/scroll">
          {movies?.data?.map((media, index) => (

            // التعديل في الديف اللي شايل الـ MovieCard
            <div
              key={media.id}
              className="flex-none w-40 md:w-52 snap-start transform transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >

              {/* إضافة تأثير ظل خلفي عند الهوفر */}
              <div className="relative group/card">
                <div className="absolute -inset-2 bg-(--accent)/3 rounded-4xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                <MovieCard media={media} index={index} />
              </div>
            </div>
          ))}

          {/* كارت "عرض المزيد" في آخر السكرول - تركة ذكية */}
          <div className="flex-none w-40 md:w-52 flex items-center justify-center snap-start">
            <a href="/genre/movies" className="group/more flex flex-col items-center gap-4 text-slate-400 hover:text-(--accent) transition-colors">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center group-hover/more:border-(--accent) group-hover/more:scale-110 transition-all">
                <Film size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">عرض المزيد</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
