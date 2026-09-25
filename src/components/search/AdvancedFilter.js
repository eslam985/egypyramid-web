"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdvancedFilter({ genres, availableYears = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // تهيئة الحالات من الـ URL
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [genreId, setGenreId] = useState(searchParams.get("genreId") || "");
  const [label, setLabel] = useState(searchParams.get("label") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "created_at_desc");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (type !== "all") params.set("type", type);
    if (year) params.set("year", year);
    if (genreId) params.set("genreId", genreId);
    if (label.trim()) params.set("label", label.trim());
    if (sort !== "created_at_desc") params.set("sort", sort);

    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setQ("");
    setType("all");
    setYear("");
    setGenreId("");
    setLabel("");
    setSort("created_at_desc");
    router.push(`/search`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="glass-card p-5 rounded-2xl space-y-4 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* بحث نصي */}
        <input
          type="text"
          placeholder="ابحث باسم الفيلم أو المسلسل..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-(--background)/50 border border-(--foreground)/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-(--accent) text-(--foreground)"
        />

        {/* القسم */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-(--background)/50 border border-(--foreground)/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-(--accent) text-(--foreground) appearance-none"
        >
          <option value="all" className="bg-slate-900">
            الكل (أفلام ومسلسلات)
          </option>
          <option value="movie" className="bg-slate-900">
            أفلام فقط
          </option>
          <option value="series" className="bg-slate-900">
            مسلسلات فقط
          </option>
        </select>

        {/* التصنيف */}
        <select
          value={genreId}
          onChange={(e) => setGenreId(e.target.value)}
          className="w-full bg-(--background)/50 border border-(--foreground)/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-(--accent) text-(--foreground) appearance-none"
        >
          <option value="" className="bg-slate-900">
            كل التصنيفات
          </option>
          {genres?.map((g) => (
            <option key={g.id} value={g.id} className="bg-slate-900">
              {g.name}
            </option>
          ))}
        </select>

        {/* السنة */}
        {/* السنة */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full bg-(--background)/50 border border-(--foreground)/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-(--accent) text-(--foreground) appearance-none"
        >
          <option value="" className="bg-slate-900">
            كل السنوات
          </option>
          {availableYears.map((y) => (
            <option key={y} value={y} className="bg-slate-900">
              {y}
            </option>
          ))}
        </select>

        {/* الترتيب */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full bg-(--background)/50 border border-(--foreground)/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-(--accent) text-(--foreground) appearance-none"
        >
          <option value="created_at_desc" className="bg-slate-900">الأحدث إضافة</option>
          <option value="created_at_asc" className="bg-slate-900">الأقدم إضافة</option>
          <option value="rating_desc" className="bg-slate-900">الأعلى تقييماً</option>
          <option value="year_desc" className="bg-slate-900">الأحدث إنتاجاً</option>
          <option value="year_asc" className="bg-slate-900">الأقدم إنتاجاً</option>
        </select>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-6 py-2.5 rounded-xl text-sm font-bold border border-(--foreground)/10 text-(--foreground)/70 lg:hover:bg-(--foreground)/5 transition-colors"
        >
          إعادة ضبط
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl text-sm font-black bg-(--accent) text-slate-950 lg:hover:opacity-90 transition-opacity"
        >
          تطبيق الفلاتر
        </button>
      </div>
    </form>
  );
}
