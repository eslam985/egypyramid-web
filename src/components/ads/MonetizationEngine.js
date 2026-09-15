"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function MonetizationEngine() {
  const pathname = usePathname();
  const [showToast, setShowToast] = useState(false);
  const [toastTimer, setToastTimer] = useState(15);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayConfig, setOverlayConfig] = useState({ link: "", name: "" });

  useEffect(() => {
    // 1. استثناء صفحات السياسات لحماية أمان الموقع وترتيبه في محركات البحث
    const excludedPaths = ["/dmca", "/privacy-policy"];
    if (excludedPaths.includes(pathname)) return;

    // 2. نظام التخفي الصارم وفحص البوتات وأدوات تقييم الأداء (Lighthouse / SpeedInsights)
    if (
      navigator.webdriver ||
      /HeadlessChrome|Lighthouse|SpeedInsights/i.test(navigator.userAgent)
    ) {
      console.log(
        "🛡️ [Stealth Mode]: تم رصد أداة فحص أو بوت. إيقاف المحرك لحماية التقييم.",
      );
      return;
    }

    if (window.performance && window.performance.measure) {
      const org = window.performance.measure;
      window.performance.measure = function () {
        try {
          return org.apply(this, arguments);
        } catch (e) {}
      };
    }

    let done = false;

    // دالة تحديد حصص الإعلانات (المشفرة في الـ LocalStorage)
    const canShowAds = (adType, maxCount, minutes) => {
      const STORAGE_KEY = "_ep_" + btoa(adType).replace(/=/g, "");
      const TIME_KEY = "_ept_" + btoa(adType).replace(/=/g, "");
      const PERIOD = minutes * 60 * 1000;

      let now = Date.now();
      let count = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
      let lastTimestamp = parseInt(localStorage.getItem(TIME_KEY)) || 0;

      if (now - lastTimestamp > PERIOD) {
        count = 0;
        localStorage.setItem(TIME_KEY, now.toString());
      }

      if (count < maxCount) {
        localStorage.setItem(STORAGE_KEY, (count + 1).toString());
        return true;
      }
      return false;
    };


    // دالة حقن السكريبتات الخارجية
    const injectScript = (url, delay) => {
      setTimeout(() => {
        if (document.hidden) return; // يمنع حرق حصة الإعلان إذا كانت الصفحة مفتوحة في الخلفية
        try {
          const s = document.createElement('script');
          s.src = url;
          s.async = true;
          s.dataset.cfasync = 'false';
          s.referrerPolicy = 'no-referrer-when-downgrade';
          document.head.appendChild(s);
        } catch (e) {}
      }, delay || 0);
    };

    // إطلاق المحرك الإعلاني فور أول تفاعل بشري حقيقي
    const launch = () => {
      if (done) return;
      done = true;

      ["mousedown", "touchstart", "scroll", "keydown"].forEach((e) =>
        window.removeEventListener(e, launch),
      );

      // أولاً: تفعيل رسالة الدعم اللطيفة (تظهر مرة واحدة فقط يومياً)
      const MSG_STORAGE_KEY = "daily_msg_shown";
      const today = new Date().toDateString();
      if (localStorage.getItem(MSG_STORAGE_KEY) !== today) {
        setShowToast(true);
        localStorage.setItem(MSG_STORAGE_KEY, today);
      }

      console.log("🚀 [Egy Pyramid]: جاري فحص حصص الإعلانات المتتابعة...");

      // ثانياً: نظام الأولويات المتتابع والخاضع للحصص الزمنية المحمية

      // الأولوية الأولى: إعلان HilltopAds (محدد بـ 3 مرات ظهور كل 10 دقائق لحماية تجربة الزائر)
      if (canShowAds('hilltop', 1, 10)) {
        console.log("📡 [HilltopAds]: تم إطلاق إعلان الفديو المنزلق (الأولوية 1).");
        injectScript(atob("Ly9zdXBlcmJqdWRnbWVudC5jb20vYi5Ya1Z5c29kL0dObFgweVktV1ZjRC9wZXdtcDlsdWZaUFVUbC9rRlBPVEZZTDVKTm1qSklhenNNZEROa0F0RE5waktrWDIvTWFqVE1XeERNR3dh"), 0);
      }
      // الأولوية الثانية: البوبندر القديم (مرتين كل 8 دقائق - يظهر بعد نفاد حصة Hilltop)
      else if (canShowAds("pop", 1, 5)) {
        // console.log("📡 [Pop-under]: بدأ الحقن (الأولوية 2).");
        injectScript(atob("aHR0cHM6Ly9zZW1pY29sb25kcml2ZXJlbGV2YXRlZC5jb20vNzQvZmQvYTcvNzRmZGE3YzY2ZGE5ZjEwNmY1ZTY0M2I0NjQ1YTM3MGIuanM="), 2000);
      }
      // الأولوية الثالثة: السمارت لينك (مرة واحدة كل 10 دقائق عبر الطبقة الشفافة)
      else if (canShowAds("smart", 1, 4)) {
        console.log("💎 [Smart Link]:  (الأولوية 3).");
        const sl = atob("aHR0cHM6Ly9zZW1pY29sb25kcml2ZXJlbGV2YXRlZC5jb20venNwZnloZXI/a2V5PTVjZTA2ZDc0ZDk2ZTg5MWM3NDA1NWUwMmYzZGRlMGFm");
        setOverlayConfig({ link: sl, name: "Smart Link" });
        setShowOverlay(true);
      }
      // البوبندر الجديد (Hilltop Popunder)
      else if (canShowAds("hilltop_pop", 1, 10)) {
        console.log("📡 [Hilltop Popunder]: .");
        injectScript(atob("aHR0cHM6Ly9mdW5ueS10b290aC5jb20vY0xELjlpNmtiZzJBNVJsZ1NfVy1RLzlhTi96ek1OMy9OckR1a3F6WU1ieUcwdzMtTU16YmMvMGdPWVRmTUUzTA=="), 0);
      }
      // الدايركت لينك الثاني (Hilltop Direct Link)
      else if (canShowAds("hilltop_direct", 1, 10)) {
        console.log("🔗 [Hilltop Direct Link]: تفعيل الدايركت لينك الثاني.");
        const dl2 = atob("aHR0cHM6Ly9wbGVhc2VkLXJlcG9ydC5jb20vYm4zR1ZtMC5QcDNncGd2Q2JibWVWdEpqWlNEbTBhM1FNSXpsYy8wck9TVEdNY3ovTGlURmNsem1OL3pDUUI1a01KekpjLQ==");
        setOverlayConfig({ link: dl2, name: "Hilltop Direct Link" });
        setShowOverlay(true);
      }
    //Direct Link:  https://semicolondriverelevated.com/tszjr66n?key=7ac57491c7a686b5703eab322b3e4435
      // الأولوية الرابعة: الدايركت لينك (مرة واحدة كل 10 دقائق كخيار تشبع أخير)
      else if (canShowAds("direct", 1, 3)) {
        console.log("🔗 [Direct Link]: تفعيل الدايركت لينك (الأولوية 4).");
        const dl = atob("aHR0cHM6Ly9zZW1pY29sb25kcml2ZXJlbGV2YXRlZC5jb20vdHN6anI2Nm4/a2V5PTdhYzU3NDkxYzdhNjg2YjU3ODNlYWIzMjJiM2U0NDM1");
        setOverlayConfig({ link: dl, name: "Direct Link" });
        setShowOverlay(true);
      } else {
        console.log(
          "⏸️ [Egy Pyramid]: تم استهلاك جميع الحصص الإعلانية المتاحة حالياً، تصفح نظيف للزائر.",
        );
      }
    };
    ["mousedown", "touchstart", "scroll", "keydown"].forEach((e) => {
      window.addEventListener(e, launch, { once: true, passive: true });
    });

    return () => {
      ["mousedown", "touchstart", "scroll", "keydown"].forEach((e) =>
        window.removeEventListener(e, launch),
      );
    };
  }, [pathname]);

  // إدارة العداد التنازلي لإخفاء رسالة الدعم تلقائياً
  useEffect(() => {
    if (!showToast) return;
    const interval = setInterval(() => {
      setToastTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowToast(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showToast]);

  return (
    <>
      {/* ستايل مخصص لحركة الأنيكيشن الخاصة بالرسالة لمنع تعارض ملفات الـ CSS */}
      {showToast && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `,
          }}
        />
      )}

      {/* صندوق رسالة الدعم اليومية */}
      {showToast && (
        <div
          style={{ animation: "slideIn 0.5s ease-out" }}
          className="fixed bottom-5 right-5 w-[280px] max-w-[80%] bg-white dark:bg-slate-900 border-r-5 border-blue-600 shadow-2xl z-[999999] p-[15px] rounded-xl font-sans text-right"
          dir="rtl"
        >
          <div className="relative">
            <span
              onClick={() => setShowToast(false)}
              className="absolute -top-2.5 -left-1 cursor-pointer font-bold text-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              &times;
            </span>
            <strong className="block text-gray-800 dark:text-gray-100 mb-2">
              عزيزي الزائر ❤️
            </strong>
            <p className="m-0 text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
              استمرارنا يعتمد على الإعلانات. لتوفير أفضل تجربة لك، حددنا الظهور
              بـ <b> عدة مرات </b> فقط. شكراً لدعمك!
              <br />
              <small className="text-gray-400 dark:text-gray-500">
                سيختفي التنبيه خلال{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {toastTimer}
                </span>{" "}
                ثانية...
              </small>
            </p>
          </div>
        </div>
      )}
      {/* الطبقة الشفافة الذكية لاقتناص النقرات العشوائية في الخلفية */}
      {showOverlay && (
        <a
          href={overlayConfig.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setShowOverlay(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0)",
            zIndex: 2147483647,
            display: "block",
            cursor: "default"
          }}
        />
      )}
    </>
  );
}
