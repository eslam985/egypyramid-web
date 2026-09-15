"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AntiAdblock() {
  const pathname = usePathname();
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    // 1. استثناء صفحات السياسات والبوتات لضمان الأرشفة
    const excludedPaths = ["/dmca", "/privacy-policy"];
    if (excludedPaths.includes(pathname)) return;
    if (
      /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)
    )
      return;

    // دالة التحقق من الحظر
    const _chk_v2 = () => {
      const banData = localStorage.getItem("egy_pyramid_access");
      if (!banData) return false;
      const data = JSON.parse(banData);
      return new Date().getTime() < data.expiry;
    };

    if (_chk_v2()) {
      setIsBanned(true);
      return;
    }

    // دالة تنفيذ الحظر (العقاب)
    const _set_v2 = (hours) => {
      const expiry = new Date().getTime() + hours * 60 * 60 * 1000;
      localStorage.setItem(
        "egy_pyramid_access",
        JSON.stringify({ banned: true, expiry }),
      );
    };

    // إنشاء مجموعة فخاخ بأسماء كلاسات مختلفة لخداع الفلاتر الذكية
    const traps = [
      "adsbox ad-unit google-ads",
      "ad-placement doubleclick-ad",
      "ad-header adsterra-zone",
      "taboola-res-ads ad-label",
    ];

    let activeTraps = [];

    traps.forEach((cls) => {
      let b = document.createElement("div");
      b.className = cls;
      b.setAttribute(
        "style",
        "position:absolute;top:-500px;width:1px;height:1px;opacity:0.01;",
      );
      document.body.appendChild(b);
      activeTraps.push(b);
    });

    const timer = setTimeout(() => {
      const overlay = document.getElementById("adblock-screen-overlay");
      // إذا تم إخفاء أي فخ من الفخاخ المنصوبة، يتم تفعيل القفل
      const isBlocked = activeTraps.some(
        (b) => b.offsetHeight === 0 || b.offsetParent === null,
      );

      if (isBlocked && overlay) {
        // إظهار القفل الأساسي
        overlay.style.setProperty("display", "flex", "important");
        document.body.classList.add("ab-locked");

        const _pun_v2 = () => {
          _set_v2(24); // حظر المستخدم لمدة 24 ساعة فوراً في الخلفية

          // تدمير الـ DOM لحظياً وبشكل صارم لقطع الطريق على الكونسول
          document.body.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#fff; z-index:2147483647; display:flex; align-items:center; justify-content:center; direction:rtl; padding:20px;">
              <div style="border:2px solid #ff4444; background:#fff; padding:30px; border-radius:12px; max-width:450px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                <div style="background:#fff0f0; width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px;">
                  <span style="font-size:30px;">🚫</span>
                </div>
                <div style="color:#e74c3c; font-size:20px; font-weight:bold; margin-bottom:10px;">محاولة تلاعب!</div>
                <div style="color:#555; font-size:14px; line-height:1.6; margin-bottom:20px;">
                  نعتذر منك، تم رصد نشاط غير طبيعي وتلاعب بكود الحماية الخاص بـ <b>EGY Pyramid</b>.
                  <br /><br />
                  هذه الإجراءات تضر باستقرار الموقع وجهود فريق العمل. تم تقييد وصولك لمدة 24 ساعة.
                </div>
              </div>
            </div>`;

          setIsBanned(true);
        };

        // الجاسوس الشامل: مراقبة الحذف، تغيير الـ Style، تغيير الكلاس لتجنب التلاعب عبر الـ Inspect
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
              if (Array.from(mutation.removedNodes).includes(overlay))
                _pun_v2();
            }
            if (mutation.type === "attributes") {
              if (
                overlay.style.display !== "flex" ||
                !document.body.classList.contains("ab-locked")
              ) {
                _pun_v2();
              }
            }
          });
        });

        observer.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }

      // تنظيف الفخاخ من الـ DOM بعد الفحص
      activeTraps.forEach((b) => {
        if (b && b.parentNode) b.parentNode.removeChild(b);
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  // واجهة العرض في حال تم حظر المستخدم نهائياً (شاشة العقاب)
  if (isBanned) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#fff",
          zIndex: 2147483647,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          padding: "20px",
        }}
      >
        <div
          style={{
            border: "2px solid #ff4444",
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            maxWidth: "450px",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              background: "#fff0f0",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
            }}
          >
            <span style={{ fontSize: "30px" }}>🚫</span>
          </div>
          <div
            style={{
              color: "#e74c3c",
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            محاولة تلاعب!
          </div>
          <div
            style={{
              color: "#555",
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            نعتذر منك، تم رصد نشاط غير طبيعي وتلاعب بكود الحماية الخاص بـ{" "}
            <b>EGY Pyramid</b>.
            <br />
            <br />
            هذه الإجراءات تضر باستقرار الموقع وجهود فريق العمل. تم تقييد وصولك
            لمدة 24 ساعة.
          </div>
        </div>
      </div>
    );
  }

  // واجهة العرض الأساسية لطلب قفل مانع الإعلانات (مخفية وتظهر فقط عند رصد المانع)
  return (
    <div
      id="adblock-screen-overlay"
      style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.85)",
        zIndex: 2147483646,
        alignItems: "center",
        justifyContent: "center",
        direction: "rtl",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `.ab-locked { overflow: hidden !important; }`,
        }}
      />
      <div
        className="ab-content"
        style={{
          border: "2px solid #007bff",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "450px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="ab-icon-wrapper"
          style={{
            background: "#e6f0fa",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 15px",
          }}
        >
          <span className="ab-icon" style={{ fontSize: "30px" }}>
            🛡️
          </span>
        </div>
        <div
          className="ab-title"
          style={{
            color: "#007bff",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          برجاء إغلاق مانع الإعلانات
        </div>
        <div
          className="ab-text"
          style={{
            color: "#555",
            fontSize: "14px",
            lineHeight: "1.6",
            marginBottom: "20px",
          }}
        >
          عزيزي الزائر، استمرار موقع <b>EGY Pyramid</b> يعتمد بالكامل على
          الإعلانات لتغطية تكاليف السيرفرات. برجاء تعطيل إضافة حجب الإعلانات
          وتحديث الصفحة للاستمرار.
        </div>
        <button
          className="ab-btn"
          onClick={() => window.location.reload()}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔄 تحديث الصفحة
        </button>
      </div>
    </div>
  );
}
