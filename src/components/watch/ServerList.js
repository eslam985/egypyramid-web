// src/components/watch/ServerList.js
"use client";

import { Server, Activity } from "lucide-react";

export default function ServerList({ links, activeServer, onServerChange }) {
  if (!links || links.length === 0) return null;

  // 1. تحديد السيرفرات الممنوعة (عشان نشيلها من الليستة)
  // 1. خليهم كلهم سمول (Lowercase) في المصفوفة الممنوعة
  // const forbiddenServers = [
  //     'archive', 'download', 'telegram_direct',
  // ];

  // 2. تحديد ترتيب السيرفرات المفضل (الأهم يظهر فوق)
  const priorityOrder = [
    "voe",
    "vk",
    "ok",
    "vidtube",
    "lulustream",
    "doodstream",
    "mixdrop",
    "streamtape",
  ];
  // 3. الفلترة والترتيب الذكي
  // 2. الفلترة مع التأكد من حذف المسافات والتحويل لسمول
  const finalLinks = links
    .filter((link) => {
      const name = link.server_name.toLowerCase();
      return (
        !name.startsWith("telegram_direct") &&
        name !== "archive" &&
        name !== "download"
      );
    })
    .sort((a, b) => {
      const indexA = priorityOrder.indexOf(a.server_name.toLowerCase());
      const indexB = priorityOrder.indexOf(b.server_name.toLowerCase());

      // لو السيرفر في قائمة الأولويات ياخد مكان فوق، لو لأ يرجع ورا
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  return (
    <section className="glass-card p-4 md:p-6 rounded-4xl shadow-2xl animate-fadeInUp">
      <h3 className="text-sm font-black mb-6 text-(--foreground) flex items-center gap-2 opacity-80">
        <div className="p-1.5 bg-(--accent)/10 rounded-lg">
          <Server className="text-(--accent)" size={16} />
        </div>
        السيرفرات
      </h3>

      {/* استخدم المصفوفة الجديدة finalLinks بدلاً من links */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
        {finalLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onServerChange(link.url, link.id)}
            className={`group relative p-3 md:p-4 rounded-xl md:rounded-2xl border duration-300 flex items-center justify-between overflow-hidden ${
              activeServer === link.id
                ? "bg-(--accent) border-(--accent) shadow-lg shadow-(--accent)/20 scale-[1.02]"
                : "bg-slate-800 border-white/10 hover:border-(--accent)/30 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-3 z-10">
              <Activity
                size={12}
                className={`${activeServer === link.id ? "text-(--background)" : "text-emerald-500"} animate-pulse`}
              />
              <span
                className={`text-[10px] md:text-[11px] font-black uppercase tracking-tighter transition-colors ${
                  activeServer === link.id
                    ? "text-slate-950"
                    : "text-slate-200 group-hover:text-(--accent)"
                }`}
              >
                {link.server_name}
              </span>
            </div>
            {activeServer === link.id && (
              <div className="w-1.5 h-1.5 bg-(--background) rounded-full shadow-[0_0_10px_white] z-10" />
            )}
            <div
              className={`absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}
            />
          </button>
        ))}
      </div>

      <p className="mt-6 text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
        استخدم سيرفرات بديلة <br /> في حال توقف المشغل
      </p>
    </section>
  );
}
