'use client';

/*
 * Rent-a-Girlfriend — wireframe landing page (mid-fidelity)
 * Single self-contained React client component for Next.js.
 *
 * USAGE (App Router):
 *   // app/page.jsx
 *   import RentAGirlfriendLanding from '@/components/RentAGirlfriendLanding';
 *   export default function Page() { return <RentAGirlfriendLanding />; }
 *
 * Props:
 *   variant         '"A" | "B" | "C"'  -> hero ban đầu (mặc định "A")
 *   showAnnotations  boolean           -> hiện chú thích wireframe (mặc định true)
 *   showSwitcher     boolean           -> hiện thanh đổi hero A/B/C (mặc định true)
 *
 * Ghi chú:
 *  - Phần "video" là placeholder. Thay <div id="heroScreen"> bằng <video> của bạn,
 *    hoặc giữ nguyên và gắn video Furina sau (xem comment ở khối heroScreen).
 *  - Component tự kèm <nav> riêng + Google Fonts. Nếu app đã có nav, có thể bỏ <nav>.
 */

import React, { useEffect, useRef, useState } from 'react';

// chuyển chuỗi CSS "a:b;c:d" -> style object cho React
const css = (str) =>
  Object.fromEntries(
    str
      .split(';')
      .filter(Boolean)
      .map((r) => {
        const i = r.indexOf(':');
        const k = r.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return [k, r.slice(i + 1).trim()];
      })
  );

const STEPS = [
  { n: '01', t: 'Tạo hồ sơ', d: 'Đăng ký nhanh và cho chúng tôi biết bạn mong muốn điều gì ở người đồng hành.' },
  { n: '02', t: 'Chọn người đồng hành', d: 'Duyệt qua các hồ sơ đã được xác minh và chọn người phù hợp với bạn.' },
  { n: '03', t: 'Đặt lịch & xác nhận', d: 'Chọn thời gian, địa điểm và xác nhận buổi gặp một cách an toàn.' },
  { n: '04', t: 'Gặp gỡ & tận hưởng', d: 'Gặp gỡ trong khuôn khổ minh bạch, lịch sự và luôn được tôn trọng.' },
];
const PROFILES = [
  { name: 'Linh', loc: 'TP.HCM', tags: ['Dịu dàng', 'Cà phê'] },
  { name: 'Mai', loc: 'Hà Nội', tags: ['Vui vẻ', 'Phim ảnh'] },
  { name: 'An', loc: 'Đà Nẵng', tags: ['Trầm lắng', 'Sách'] },
  { name: 'Thảo', loc: 'TP.HCM', tags: ['Năng động', 'Du lịch'] },
  { name: 'Hà', loc: 'Hà Nội', tags: ['Ấm áp', 'Âm nhạc'] },
  { name: 'Vy', loc: 'Cần Thơ', tags: ['Hài hước', 'Ẩm thực'] },
];
const TESTIMONIALS = [
  { quote: 'Một buổi tối trò chuyện thật dễ chịu và không hề gượng gạo. Mọi thứ rất chuyên nghiệp.', name: 'Khách hàng A', role: 'TP.HCM' },
  { quote: 'Quy trình rõ ràng, người đồng hành thân thiện. Mình cảm thấy được tôn trọng.', name: 'Khách hàng B', role: 'Hà Nội' },
  { quote: 'Đặt lịch tiện, thông tin được bảo mật tốt. Trải nghiệm vượt mong đợi.', name: 'Khách hàng C', role: 'Đà Nẵng' },
];
const SAFETY = [
  { t: 'Xác minh danh tính', d: 'Mọi người đồng hành đều được xác minh kỹ lưỡng trước khi xuất hiện trên nền tảng.' },
  { t: 'Bảo mật thông tin', d: 'Dữ liệu cá nhân và lịch sử của bạn được mã hoá và không chia sẻ với bên thứ ba.' },
  { t: 'Hỗ trợ 24/7', d: 'Đội ngũ hỗ trợ luôn sẵn sàng can thiệp khi bạn cần trong mọi tình huống.' },
];
const FAQS = [
  { q: 'Dịch vụ này có an toàn không?', a: 'Có. Mọi buổi gặp đều diễn ra trong khuôn khổ minh bạch, có quy tắc ứng xử rõ ràng và hỗ trợ kịp thời.' },
  { q: 'Người đồng hành có được xác minh không?', a: 'Tất cả hồ sơ đều trải qua quy trình xác minh danh tính trước khi được hiển thị công khai.' },
  { q: 'Chi phí được tính như thế nào?', a: 'Chi phí minh bạch theo từng gói thời gian, hiển thị rõ trước khi bạn xác nhận đặt lịch.' },
  { q: 'Tôi có thể huỷ lịch không?', a: 'Bạn có thể huỷ hoặc đổi lịch theo chính sách linh hoạt được nêu rõ khi đặt.' },
  { q: 'Thông tin của tôi có được bảo mật?', a: 'Có. Thông tin cá nhân được mã hoá và chỉ dùng cho mục đích vận hành dịch vụ.' },
];
const FOOTCOLS = [
  { h: 'DỊCH VỤ', items: ['Cách hoạt động', 'Hồ sơ', 'Bảng giá', 'Quà tặng'] },
  { h: 'CÔNG TY', items: ['Về chúng tôi', 'Tuyển dụng', 'Liên hệ', 'Blog'] },
  { h: 'PHÁP LÝ', items: ['Điều khoản', 'Bảo mật', 'An toàn', 'Cookie'] },
];
const VDESC = {
  A: 'Tự phát → tiến gần → flash → chữ hiện',
  B: 'Cuộn để nhân vật tiến lại, chữ lộ dần',
  C: 'Letterbox điện ảnh → shutter → reveal',
};

export default function RentAGirlfriendLanding({
  variant: initialVariant = 'A',
  showAnnotations = true,
  showSwitcher = true,
}) {
  const rootRef = useRef(null);
  const eng = useRef({ tweens: [], revealed: new Set(), scrub: null, variant: initialVariant });
  const [variant, setVariant] = useState(initialVariant);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const A = eng.current;
    A.variant = initialVariant;
    const q = (s) => root.querySelector(s);
    const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

    // ẩn các phần reveal (đặt trực tiếp bằng JS, không qua className để tránh React ghi đè)
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'none';
    });

    const addTween = (getEl, dur, delay, apply) =>
      A.tweens.push({ getEl, dur, delay: delay || 0, t0: performance.now(), apply, done: false });

    const updateTweens = () => {
      if (!A.tweens.length) return;
      const now = performance.now();
      for (const tw of A.tweens) {
        const el = tw.getEl();
        if (!el) continue;
        let p = (now - tw.t0 - tw.delay) / tw.dur;
        if (p < 0) continue;
        if (p >= 1) { p = 1; tw.done = true; }
        tw.apply(el, easeInOut(p), p);
      }
      A.tweens = A.tweens.filter((t) => !t.done);
    };

    const checkReveal = () => {
      const trigger = window.innerHeight * 0.92;
      root.querySelectorAll('[data-reveal]').forEach((el) => {
        if (A.revealed.has(el)) return;
        if (el.getBoundingClientRect().top < trigger) {
          A.revealed.add(el);
          // hiện ngay khi cuộn tới (đáng tin cậy). Muốn fade: đổi 'none' thành
          // 'opacity .55s ease, transform .55s ease' (chạy mượt trong app thật).
          el.style.transition = 'none';
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    };

    const runA = (hero, fig, flash, head, prog, screen) => {
      hero.style.height = '100vh';
      addTween(() => prog, 4000, 80, (e, ez) => { e.style.width = 86 * ez + '%'; });
      addTween(() => fig, 1500, 2600, (e, ez) => { e.style.animation = 'none'; e.style.transform = 'scale(' + (1 + 1.7 * ez) + ') translateY(' + 8 * ez + '%)'; });
      addTween(() => screen, 1500, 2600, (e, ez) => { e.style.transform = 'scale(' + (1 + 0.12 * ez) + ')'; });
      addTween(() => prog, 240, 4150, (e, ez) => { e.style.width = 86 + 14 * ez + '%'; });
      addTween(() => flash, 150, 4150, (e, ez) => { e.style.opacity = String(ez); });
      addTween(() => flash, 650, 4330, (e, ez) => { e.style.opacity = String(1 - ez); });
      addTween(() => fig, 350, 4330, (e, ez) => { e.style.opacity = String(1 - ez); });
      addTween(() => head, 950, 4330, (e, ez) => { e.style.opacity = String(Math.min(1, ez * 1.3)); e.style.clipPath = 'inset(0 ' + 100 * (1 - ez) + '% 0 0)'; });
    };

    const runB = (hero, fig, flash, head, prog, screen) => {
      hero.style.height = '240vh';
      fig.style.animation = 'none';
      A.scrub = () => {
        const total = hero.offsetHeight - window.innerHeight;
        let p = total > 0 ? -hero.getBoundingClientRect().top / total : 0;
        p = Math.max(0, Math.min(1, p));
        fig.style.transform = 'scale(' + (1 + p * 2.4) + ') translateY(' + p * 8 + '%)';
        screen.style.transform = 'scale(' + (1 + p * 0.15) + ')';
        prog.style.width = p * 100 + '%';
        const rc = Math.max(0, Math.min(1, (p - 0.6) / 0.3));
        head.style.opacity = String(rc);
        head.style.clipPath = 'inset(0 ' + (1 - rc) * 100 + '% 0 0)';
        flash.style.opacity = p > 0.54 && p < 0.7 ? String(Math.max(0, 1 - Math.abs(p - 0.62) / 0.08)) : '0';
        fig.style.opacity = p > 0.7 ? String(Math.max(0, 1 - (p - 0.7) / 0.1)) : '1';
      };
      A.scrub();
    };

    const runC = (hero, fig, flash, head, prog, screen, bars) => {
      hero.style.height = '100vh';
      const b0 = bars[0], b1 = bars[1];
      addTween(() => b0, 800, 90, (e, ez) => { e.style.height = 13 * ez + '%'; });
      addTween(() => b1, 800, 90, (e, ez) => { e.style.height = 13 * ez + '%'; });
      addTween(() => prog, 2900, 130, (e, ez) => { e.style.width = 80 * ez + '%'; });
      addTween(() => fig, 900, 2300, (e, ez) => { e.style.animation = 'none'; e.style.transform = 'scale(' + (1 + 1.2 * ez) + ') translateY(' + 6 * ez + '%)'; });
      addTween(() => screen, 900, 2300, (e, ez) => { e.style.transform = 'scale(' + (1 + 0.1 * ez) + ')'; });
      addTween(() => b0, 480, 3100, (e, ez) => { e.style.height = 13 + 39 * ez + '%'; });
      addTween(() => b1, 480, 3100, (e, ez) => { e.style.height = 13 + 39 * ez + '%'; });
      addTween(() => fig, 200, 3560, (e, ez) => { e.style.opacity = String(1 - ez); });
      addTween(() => head, 120, 3560, (e) => { e.style.opacity = '1'; e.style.clipPath = 'inset(0 0 0 0)'; });
      addTween(() => flash, 180, 3560, (e, ez) => { e.style.opacity = String(ez); });
      addTween(() => flash, 520, 3760, (e, ez) => { e.style.opacity = String(1 - ez); });
      addTween(() => b0, 950, 3640, (e, ez) => { e.style.height = 52 * (1 - ez) + '%'; });
      addTween(() => b1, 950, 3640, (e, ez) => { e.style.height = 52 * (1 - ez) + '%'; });
      addTween(() => prog, 250, 3640, (e, ez) => { e.style.width = 80 + 20 * ez + '%'; });
    };

    const startHero = () => {
      A.tweens = [];
      A.scrub = null;
      const hero = q('#hero');
      const fig = q('#heroFigure');
      const flash = q('#heroFlash');
      const head = q('#heroHeadline');
      const prog = q('#heroProgress');
      const screen = q('#heroScreen');
      const bars = root.querySelectorAll('.letterbar');
      if (!hero) return;
      fig.style.transition = 'none'; fig.style.animation = 'sway 2.6s ease-in-out infinite';
      fig.style.transform = 'scale(1)'; fig.style.opacity = '1';
      flash.style.transition = 'none'; flash.style.opacity = '0';
      head.style.transition = 'none'; head.style.opacity = '0'; head.style.clipPath = 'inset(0 100% 0 0)';
      prog.style.transition = 'none'; prog.style.width = '0%';
      screen.style.transition = 'none'; screen.style.transform = 'scale(1)';
      bars.forEach((b) => { b.style.transition = 'none'; b.style.height = '0%'; });
      const v = A.variant;
      if (v === 'A') runA(hero, fig, flash, head, prog, screen);
      else if (v === 'B') runB(hero, fig, flash, head, prog, screen);
      else runC(hero, fig, flash, head, prog, screen, bars);
    };

    A.startHero = startHero;

    const onScroll = () => { checkReveal(); if (A.scrub) A.scrub(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    const iv = setInterval(() => { checkReveal(); if (A.scrub) A.scrub(); updateTweens(); }, 16);
    checkReveal();
    startHero();

    return () => {
      clearInterval(iv);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickVariant = (v) => {
    setVariant(v);
    eng.current.variant = v;
    if (eng.current.startHero) eng.current.startHero();
  };
  const replay = () => { if (eng.current.startHero) eng.current.startHero(); };

  const toggleFaq = (e) => {
    const item = e.currentTarget.closest('[data-faq]');
    const ans = item.querySelector('[data-ans]');
    const chev = item.querySelector('[data-chev]');
    const open = item.getAttribute('data-open') === '1';
    item.setAttribute('data-open', open ? '0' : '1');
    ans.style.maxHeight = open ? '0px' : ans.scrollHeight + 'px';
    chev.textContent = open ? '+' : '×';
  };

  const link = 'font-size:14px;color:#6d6369;text-decoration:none';
  const eyebrow = "font-family:'Space Mono',monospace;font-size:12px;letter-spacing:3px;color:#b08597";
  const h2 = "font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(34px,5.5vw,64px);line-height:1.02;margin:14px 0 0";
  const reveal = (extra) => css('opacity:0;transform:translateY(28px)' + (extra ? ';' + extra : ''));

  return (
    <div ref={rootRef} style={css("position:relative;width:100%;overflow-x:clip;background:#f5f2ef;font-family:'Hanken Grotesk',system-ui,sans-serif;color:#3a3338")}>
      {/* Fonts + keyframes (an toàn để nằm trong component; Next sẽ hoist) */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Hanken+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sway{0%{transform:translateX(-2.6%) rotate(-1.9deg)}50%{transform:translateX(2.6%) rotate(1.9deg)}100%{transform:translateX(-2.6%) rotate(-1.9deg)}}
        @keyframes floaty{0%{transform:translateY(0) scale(1);opacity:.45}50%{transform:translateY(-26px) scale(1.18);opacity:.85}100%{transform:translateY(0) scale(1);opacity:.45}}
        @keyframes scrollcue{0%,100%{transform:translateY(0);opacity:.9}50%{transform:translateY(9px);opacity:.25}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
      ` }} />

      {/* NAV */}
      <nav style={css('position:fixed;top:0;left:0;right:0;z-index:40;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px clamp(18px,4vw,52px);background:rgba(245,242,239,.72);backdrop-filter:blur(12px);border-bottom:1px solid #e4ddd7')}>
        <div style={css('display:flex;align-items:center;gap:10px')}>
          <div style={css('width:30px;height:30px;border:1.5px solid #3a3338;border-radius:50% 50% 50% 4px;display:flex;align-items:center;justify-content:center;font-size:13px')}>♥</div>
          <span style={css("font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;letter-spacing:.3px")}>Rent-a-Girlfriend</span>
        </div>
        <div style={css('display:flex;align-items:center;gap:clamp(12px,2vw,26px);flex-wrap:wrap;justify-content:flex-end')}>
          <a href="#how" style={css(link)}>Cách hoạt động</a>
          <a href="#profiles" style={css(link)}>Hồ sơ</a>
          <a href="#reviews" style={css(link)}>Đánh giá</a>
          <a href="#safety" style={css(link)}>An toàn</a>
          <a href="#faq" style={css(link)}>FAQ</a>
          <button style={css('font-family:inherit;font-size:13px;font-weight:600;padding:9px 18px;border:1.5px solid #3a3338;border-radius:999px;background:#3a3338;color:#f5f2ef;cursor:pointer')}>Đăng ký</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" style={css('position:relative;width:100%;height:100vh;background:#f5f2ef')}>
        <div id="heroStage" style={css('position:sticky;top:0;height:100vh;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden')}>
          {/* === Thay khối heroScreen này bằng <video> của bạn (giữ id để animation chạy) === */}
          <div id="heroScreen" style={css('position:relative;width:min(1080px,92vw);height:min(78vh,700px);background:radial-gradient(120% 120% at 50% 20%, #2c2533 0%, #1c1822 100%);border-radius:16px;overflow:hidden;box-shadow:0 36px 90px rgba(40,28,46,.28);display:flex;align-items:center;justify-content:center;will-change:transform')}>
            <div style={css('position:absolute;left:18%;top:30%;width:10px;height:10px;border-radius:50%;background:#e8b9c8;opacity:.6;animation:floaty 6s ease-in-out infinite')} />
            <div style={css('position:absolute;left:74%;top:24%;width:7px;height:7px;border-radius:50%;background:#c9bfe0;opacity:.6;animation:floaty 7.5s ease-in-out .8s infinite')} />
            <div style={css('position:absolute;left:62%;top:62%;width:12px;height:12px;border-radius:50%;background:#e8b9c8;opacity:.5;animation:floaty 8s ease-in-out 1.4s infinite')} />
            <div style={css('position:absolute;left:30%;top:68%;width:6px;height:6px;border-radius:50%;background:#c9bfe0;opacity:.6;animation:floaty 6.8s ease-in-out .4s infinite')} />

            <div id="heroFigure" style={css("position:relative;width:min(210px,38%);aspect-ratio:3/4;border:1.5px dashed rgba(245,242,239,.45);border-radius:110px 110px 18px 18px;background:repeating-linear-gradient(135deg,rgba(245,242,239,.05) 0 9px,rgba(245,242,239,.11) 9px 18px);display:flex;align-items:flex-end;justify-content:center;color:rgba(245,242,239,.6);font-family:'Space Mono',monospace;font-size:11px;padding-bottom:16px;will-change:transform")}>NHÂN VẬT</div>

            <div style={css("position:absolute;top:16px;left:18px;z-index:3;font-family:'Space Mono',monospace;font-size:11px;color:rgba(245,242,239,.55)")}>00:00 / 00:06</div>
            <div style={css("position:absolute;top:16px;right:18px;z-index:3;display:flex;align-items:center;gap:6px;font-family:'Space Mono',monospace;font-size:11px;color:rgba(245,242,239,.55)")}>
              <span style={css('width:8px;height:8px;border-radius:50%;background:#e8b9c8;animation:blink 1.4s infinite')} />REC
            </div>
            <div style={css('position:absolute;bottom:46px;left:50%;transform:translateX(-50%);z-index:3;width:62%;height:3px;border-radius:3px;background:rgba(245,242,239,.18)')}>
              <div id="heroProgress" style={css('height:100%;background:#e8b9c8;border-radius:3px')} />
            </div>
            <div style={css("position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:3;font-family:'Space Mono',monospace;font-size:10.5px;color:rgba(245,242,239,.45);text-align:center;width:92%;line-height:1.5")}>▣ VIDEO PLACEHOLDER — Furina nhảy múa → tiến lại gần camera → tương tác bất ngờ → chuyển cảnh → chữ hiện</div>

            <div className="letterbar" style={css('position:absolute;top:0;left:0;width:100%;background:#14101a;z-index:6')} />
            <div className="letterbar" style={css('position:absolute;bottom:0;left:0;width:100%;background:#14101a;z-index:6')} />
            <div id="heroFlash" style={css('position:absolute;inset:0;background:#fff;z-index:8;pointer-events:none')} />
          </div>

          <div id="heroHeadline" style={css('position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;pointer-events:none')}>
            <div style={css("font-family:'Space Mono',monospace;font-size:12px;letter-spacing:3px;color:#e8b9c8;margin-bottom:18px")}>DỊCH VỤ NGƯỜI ĐỒNG HÀNH</div>
            <h1 style={css("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(44px,9vw,118px);line-height:.98;color:#f5f2ef;margin:0;text-shadow:0 4px 40px rgba(0,0,0,.35)")}>Rent-a-Girlfriend</h1>
            <p style={css('max-width:560px;margin:22px auto 0;font-size:clamp(15px,1.6vw,18px);line-height:1.6;color:rgba(245,242,239,.82)')}>Người đồng hành dịu dàng cho từng khoảnh khắc — trò chuyện, dạo phố, hay đơn giản là có ai đó bên cạnh.</p>
            <div style={css('display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:34px;pointer-events:auto')}>
              <button style={css('font-family:inherit;font-size:15px;font-weight:600;padding:14px 30px;border:none;border-radius:999px;background:#f5f2ef;color:#221d27;cursor:pointer')}>Tìm người đồng hành</button>
              <button style={css('font-family:inherit;font-size:15px;font-weight:500;padding:14px 28px;border:1.5px solid rgba(245,242,239,.55);border-radius:999px;background:transparent;color:#f5f2ef;cursor:pointer')}>Xem cách hoạt động</button>
            </div>
            <div style={css("margin-top:46px;display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(245,242,239,.7);font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px")}>CUỘN ĐỂ KHÁM PHÁ<span style={css('font-size:18px;animation:scrollcue 1.8s ease-in-out infinite')}>↓</span></div>
          </div>

          {showAnnotations && (
            <div style={css("position:absolute;left:clamp(16px,4vw,46px);bottom:96px;z-index:5;font-family:'Space Mono',monospace;font-size:11px;color:#b08597;max-width:200px;line-height:1.5;border-left:2px solid #e8b9c8;padding-left:10px")}>// hero kể chuyện bằng video, chữ chỉ hiện ở cao trào</div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={css('position:relative;padding:clamp(80px,12vh,140px) clamp(18px,5vw,90px);max-width:1280px;margin:0 auto')}>
        <div data-reveal style={reveal('max-width:720px')}>
          <div style={css(eyebrow)}>QUY TRÌNH 4 BƯỚC</div>
          <h2 style={css(h2)}>Cách hoạt động</h2>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:26px;margin-top:54px')}>
          {STEPS.map((s) => (
            <div key={s.n} data-reveal style={reveal('border:1.5px solid #ddd6d1;border-radius:14px;padding:26px;background:#fbf9f7')}>
              <div style={css("font-family:'Space Mono',monospace;font-size:13px;color:#b08597")}>{s.n}</div>
              <h3 style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:24px;margin:10px 0 12px")}>{s.t}</h3>
              <p style={css('font-size:14.5px;line-height:1.6;color:#6d6369;margin:0')}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROFILES */}
      <section id="profiles" style={css('position:relative;padding:clamp(60px,9vh,110px) clamp(18px,5vw,90px);background:#efe9e4')}>
        <div style={css('max-width:1280px;margin:0 auto')}>
          <div data-reveal style={reveal('display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px')}>
            <div>
              <div style={css(eyebrow)}>GẶP GỠ</div>
              <h2 style={css(h2)}>Hồ sơ người đồng hành</h2>
            </div>
            {showAnnotations && <span style={css("font-family:'Space Mono',monospace;font-size:11px;color:#b08597")}>// thẻ hover → nhấc nhẹ + viền hồng</span>}
          </div>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;margin-top:48px')}>
            {PROFILES.map((p) => (
              <div key={p.name} data-reveal className="rag-card" style={reveal('transition:box-shadow .3s ease,border-color .3s ease;border:1.5px solid #ddd6d1;border-radius:16px;overflow:hidden;background:#fbf9f7;cursor:pointer')}>
                <div style={css("aspect-ratio:3/4;background:repeating-linear-gradient(135deg,#e7dfd9 0 9px,#efe9e4 9px 18px);display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:11px;color:#a99a8f;border-bottom:1.5px solid #ddd6d1")}>ẢNH HỒ SƠ</div>
                <div style={css('padding:16px')}>
                  <div style={css('display:flex;justify-content:space-between;align-items:baseline')}>
                    <h3 style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:21px;margin:0")}>{p.name}</h3>
                    <span style={css('font-size:12px;color:#9a8f86')}>{p.loc}</span>
                  </div>
                  <div style={css('display:flex;flex-wrap:wrap;gap:6px;margin-top:12px')}>
                    {p.tags.map((tag) => (
                      <span key={tag} style={css('font-size:11.5px;color:#8a7f86;border:1px solid #ddd6d1;border-radius:999px;padding:4px 10px')}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="reviews" style={css('position:relative;padding:clamp(80px,12vh,140px) clamp(18px,5vw,90px);max-width:1280px;margin:0 auto')}>
        <div data-reveal style={reveal('text-align:center;max-width:620px;margin:0 auto')}>
          <div style={css(eyebrow)}>TRẢI NGHIỆM THẬT</div>
          <h2 style={css(h2)}>Người dùng nói gì</h2>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-top:54px')}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} data-reveal style={reveal('border:1.5px solid #ddd6d1;border-radius:16px;padding:28px;background:#fbf9f7')}>
              <div style={css("font-size:34px;font-family:'Cormorant Garamond',serif;color:#e8b9c8;line-height:.6")}>“</div>
              <p style={css('font-size:15.5px;line-height:1.7;color:#4a4047;margin:14px 0 22px')}>{t.quote}</p>
              <div style={css('display:flex;align-items:center;gap:12px')}>
                <div style={css('width:42px;height:42px;border-radius:50%;background:repeating-linear-gradient(135deg,#e7dfd9 0 6px,#efe9e4 6px 12px);border:1px solid #ddd6d1')} />
                <div>
                  <div style={css('font-weight:600;font-size:14px')}>{t.name}</div>
                  <div style={css('font-size:12px;color:#9a8f86')}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY */}
      <section id="safety" style={css('position:relative;padding:clamp(70px,10vh,130px) clamp(18px,5vw,90px);background:#221d27;color:#f5f2ef')}>
        <div style={css('max-width:1100px;margin:0 auto;text-align:center')}>
          <div data-reveal style={reveal()}>
            <div style={css("font-family:'Space Mono',monospace;font-size:12px;letter-spacing:3px;color:#e8b9c8")}>BẢO MẬT & TIN CẬY</div>
            <h2 style={css(h2)}>An toàn là trên hết</h2>
          </div>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:30px;margin-top:56px;text-align:left')}>
            {SAFETY.map((f) => (
              <div key={f.t} data-reveal style={reveal()}>
                <div style={css("width:46px;height:46px;border:1.5px dashed rgba(245,242,239,.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:10px;color:rgba(245,242,239,.55)")}>ICON</div>
                <h3 style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:23px;margin:18px 0 10px")}>{f.t}</h3>
                <p style={css('font-size:14.5px;line-height:1.65;color:rgba(245,242,239,.7);margin:0')}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={css('position:relative;padding:clamp(80px,12vh,140px) clamp(18px,5vw,90px);max-width:860px;margin:0 auto')}>
        <div data-reveal style={reveal('text-align:center')}>
          <div style={css(eyebrow)}>GIẢI ĐÁP</div>
          <h2 style={css(h2)}>Câu hỏi thường gặp</h2>
        </div>
        <div data-reveal style={reveal('margin-top:46px')}>
          {FAQS.map((f) => (
            <div key={f.q} data-faq data-open="0" style={css('border-bottom:1.5px solid #ddd6d1')}>
              <div onClick={toggleFaq} style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 4px;cursor:pointer')}>
                <span style={css('font-size:17px;font-weight:500;color:#3a3338')}>{f.q}</span>
                <span data-chev style={css('font-size:20px;color:#b08597;flex-shrink:0')}>+</span>
              </div>
              <div data-ans style={css('max-height:0;overflow:hidden;transition:max-height .35s ease')}>
                <p style={css('font-size:14.5px;line-height:1.7;color:#6d6369;margin:0 4px 22px')}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={css('position:relative;padding:clamp(80px,12vh,150px) clamp(18px,5vw,90px);text-align:center;background:#efe9e4')}>
        <div data-reveal style={reveal('max-width:680px;margin:0 auto')}>
          <h2 style={css("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(36px,6vw,76px);line-height:1.02;margin:0")}>Sẵn sàng tìm người đồng hành của bạn?</h2>
          <button style={css('font-family:inherit;font-size:16px;font-weight:600;padding:16px 40px;border:none;border-radius:999px;background:#3a3338;color:#f5f2ef;cursor:pointer;margin-top:34px')}>Bắt đầu ngay</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={css('position:relative;padding:clamp(50px,7vh,80px) clamp(18px,5vw,90px) 40px;background:#221d27;color:rgba(245,242,239,.7)')}>
        <div style={css('max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:36px')}>
          <div style={css('max-width:260px')}>
            <div style={css('display:flex;align-items:center;gap:10px;color:#f5f2ef')}>
              <div style={css('width:28px;height:28px;border:1.5px solid #f5f2ef;border-radius:50% 50% 50% 4px;display:flex;align-items:center;justify-content:center;font-size:12px')}>♥</div>
              <span style={css("font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600")}>Rent-a-Girlfriend</span>
            </div>
            <p style={css('font-size:13.5px;line-height:1.6;margin:16px 0 0')}>Người đồng hành dịu dàng, an toàn và minh bạch cho mọi khoảnh khắc.</p>
          </div>
          {FOOTCOLS.map((c) => (
            <div key={c.h}>
              <div style={css("font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:#e8b9c8;margin-bottom:16px")}>{c.h}</div>
              {c.items.map((it) => (
                <div key={it} style={css('font-size:14px;margin-bottom:12px')}>{it}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={css("max-width:1280px;margin:48px auto 0;padding-top:24px;border-top:1px solid rgba(245,242,239,.15);font-family:'Space Mono',monospace;font-size:11px;color:rgba(245,242,239,.4)")}>© 2026 Rent-a-Girlfriend · Wireframe placeholder</div>
      </footer>

      {/* HERO SWITCHER */}
      {showSwitcher && (
        <div style={css("position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:10px;background:rgba(251,249,247,.94);backdrop-filter:blur(12px);border:1.5px solid #ddd6d1;border-radius:999px;padding:8px 10px 8px 16px;box-shadow:0 14px 40px rgba(40,28,46,.16);font-family:'Space Mono',monospace;flex-wrap:wrap;justify-content:center;max-width:94vw")}>
          <span style={css('font-size:11px;letter-spacing:1.5px;color:#b08597')}>HERO</span>
          <div style={css('display:flex;gap:4px')}>
            {['A', 'B', 'C'].map((v) => (
              <button
                key={v}
                onClick={() => pickVariant(v)}
                style={css('font-family:inherit;font-size:13px;font-weight:700;width:34px;height:34px;border:1.5px solid #3a3338;border-radius:50%;cursor:pointer;background:' + (variant === v ? '#3a3338' : 'transparent') + ';color:' + (variant === v ? '#f5f2ef' : '#3a3338'))}
              >
                {v}
              </button>
            ))}
          </div>
          <span style={css('font-size:11px;color:#6d6369;max-width:240px')}>{VDESC[variant]}</span>
          <button onClick={replay} title="Phát lại" style={css('font-family:inherit;font-size:15px;width:34px;height:34px;border:1.5px solid #ddd6d1;border-radius:50%;background:transparent;color:#3a3338;cursor:pointer')}>↺</button>
        </div>
      )}
    </div>
  );
}
