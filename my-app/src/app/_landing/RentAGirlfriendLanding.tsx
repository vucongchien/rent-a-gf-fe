'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CompanionCard, type CompanionCardProps } from '@/shared/components/molecules/CompanionCard';

// TODO: swap bằng video Furina thật khi có asset chính thức.
const HERO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

interface Props {
  companions: CompanionCardProps[];
}

const STEPS = [
  { n: '01', t: 'Tạo hồ sơ', d: 'Đăng ký nhanh và cho chúng tôi biết bạn mong muốn điều gì ở người đồng hành.' },
  { n: '02', t: 'Chọn người đồng hành', d: 'Duyệt qua các hồ sơ đã được xác minh và chọn người phù hợp với bạn.' },
  { n: '03', t: 'Đặt lịch & xác nhận', d: 'Chọn thời gian, địa điểm và xác nhận buổi gặp một cách an toàn.' },
  { n: '04', t: 'Gặp gỡ & tận hưởng', d: 'Gặp gỡ trong khuôn khổ minh bạch, lịch sự và luôn được tôn trọng.' },
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

interface Tween {
  getEl: () => HTMLElement | null;
  dur: number;
  delay: number;
  t0: number;
  apply: (el: HTMLElement, ez: number) => void;
  done: boolean;
}

interface Engine {
  tweens: Tween[];
  revealed: Set<Element>;
}

export default function RentAGirlfriendLanding({ companions }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const eng = useRef<Engine>({ tweens: [], revealed: new Set() });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const A = eng.current;
    const q = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s);
    const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .65s cubic-bezier(.22,.61,.36,1), transform .65s cubic-bezier(.22,.61,.36,1)';
    });

    const addTween = (
      getEl: () => HTMLElement | null,
      dur: number,
      delay: number,
      apply: (el: HTMLElement, ez: number) => void,
    ) => {
      A.tweens.push({ getEl, dur, delay: delay || 0, t0: performance.now(), apply, done: false });
    };

    const updateTweens = () => {
      if (!A.tweens.length) return;
      const now = performance.now();
      for (const tw of A.tweens) {
        const el = tw.getEl();
        if (!el) continue;
        let p = (now - tw.t0 - tw.delay) / tw.dur;
        if (p < 0) continue;
        if (p >= 1) {
          p = 1;
          tw.done = true;
        }
        tw.apply(el, easeInOut(p));
      }
      A.tweens = A.tweens.filter((t) => !t.done);
    };

    const checkReveal = () => {
      const trigger = window.innerHeight * 0.92;
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (A.revealed.has(el)) return;
        if (el.getBoundingClientRect().top < trigger) {
          A.revealed.add(el);
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    };

    const head = q('#heroHeadline');
    const flash = q('#heroFlash');
    const bars = root.querySelectorAll<HTMLElement>('.letterbar');
    if (head && flash && bars.length >= 2) {
      const b0 = bars[0];
      const b1 = bars[1];
      flash.style.transition = 'none';
      flash.style.opacity = '0';
      head.style.transition = 'none';
      head.style.opacity = '0';
      head.style.clipPath = 'inset(0 100% 0 0)';
      bars.forEach((b) => {
        b.style.transition = 'none';
        b.style.height = '0%';
      });
      // Style C: cinematic letterbox shutter → flash → reveal headline.
      addTween(() => b0, 800, 90, (e, ez) => { e.style.height = 13 * ez + '%'; });
      addTween(() => b1, 800, 90, (e, ez) => { e.style.height = 13 * ez + '%'; });
      addTween(() => b0, 480, 3100, (e, ez) => { e.style.height = 13 + 39 * ez + '%'; });
      addTween(() => b1, 480, 3100, (e, ez) => { e.style.height = 13 + 39 * ez + '%'; });
      addTween(() => head, 120, 3560, (e) => { e.style.opacity = '1'; e.style.clipPath = 'inset(0 0 0 0)'; });
      addTween(() => flash, 180, 3560, (e, ez) => { e.style.opacity = String(ez); });
      addTween(() => flash, 520, 3760, (e, ez) => { e.style.opacity = String(1 - ez); });
      addTween(() => b0, 950, 3640, (e, ez) => { e.style.height = 52 * (1 - ez) + '%'; });
      addTween(() => b1, 950, 3640, (e, ez) => { e.style.height = 52 * (1 - ez) + '%'; });
    }

    const onScroll = () => checkReveal();
    window.addEventListener('scroll', onScroll, { passive: true });
    const iv = window.setInterval(() => {
      checkReveal();
      updateTweens();
    }, 16);
    checkReveal();

    return () => {
      window.clearInterval(iv);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative w-full overflow-x-clip bg-surface text-text font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-scrollcue{0%,100%{transform:translateY(0);opacity:.9}50%{transform:translateY(9px);opacity:.25}}
      ` }} />

      <section id="hero" className="relative w-full h-screen bg-surface">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <div id="heroScreen" className="absolute inset-0 w-full h-full bg-surface-inverted overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              src={HERO_VIDEO_URL}
              className="absolute inset-0 w-full h-full object-cover z-[1]"
            />
            <div className="letterbar absolute top-0 left-0 w-full bg-neutral-900 z-[6]" />
            <div className="letterbar absolute bottom-0 left-0 w-full bg-neutral-900 z-[6]" />
            <div id="heroFlash" className="absolute inset-0 bg-white z-[8] pointer-events-none" />
          </div>

          <div id="heroHeadline" className="absolute inset-0 z-[4] flex flex-col items-center justify-center text-center p-6 pointer-events-none">
            <div className="font-mono text-[12px] tracking-[3px] text-chizuru-600 mb-[18px]">DỊCH VỤ NGƯỜI ĐỒNG HÀNH</div>
            <h1
              className="font-display font-medium text-[clamp(44px,9vw,118px)] leading-[.98] text-text-inverted m-0"
              style={{ textShadow: '0 4px 40px rgba(0,0,0,.35)' }}
            >
              Rent-a-Girlfriend
            </h1>
            <p className="max-w-[560px] mx-auto mt-[22px] text-[clamp(15px,1.6vw,18px)] leading-[1.6] text-text-inverted/80 font-sans">
              Người đồng hành dịu dàng cho từng khoảnh khắc — trò chuyện, dạo phố, hay đơn giản là có ai đó bên cạnh.
            </p>
            <div className="flex gap-[14px] flex-wrap justify-center mt-[34px] pointer-events-auto">
              <Link
                href="/explore"
                className="font-sans text-[15px] font-semibold py-[14px] px-[30px] rounded-full bg-white text-text no-underline"
              >
                Tìm người đồng hành
              </Link>
              <a
                href="#how"
                className="font-sans text-[15px] font-medium py-[14px] px-[28px] border-[1.5px] border-white/55 rounded-full bg-transparent text-text-inverted no-underline"
              >
                Xem cách hoạt động
              </a>
            </div>
            <div className="mt-[46px] flex flex-col items-center gap-2 text-text-inverted/70 font-mono text-[11px] tracking-[1px]">
              CUỘN ĐỂ KHÁM PHÁ
              <span className="text-[18px]" style={{ animation: 'landing-scrollcue 1.8s ease-in-out infinite' }}>↓</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative py-[clamp(80px,12vh,140px)] px-[clamp(18px,5vw,90px)] max-w-[1280px] mx-auto">
        <div data-reveal className="max-w-[720px]">
          <div className="font-mono text-[12px] tracking-[3px] text-chizuru-600">QUY TRÌNH 4 BƯỚC</div>
          <h2 className="font-sans font-medium text-[clamp(34px,5.5vw,64px)] leading-[1.02] mt-[14px] text-text">Cách hoạt động</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[26px] mt-[54px]">
          {STEPS.map((s) => (
            <div key={s.n} data-reveal className="border-[1.5px] border-border rounded-[14px] p-[26px] bg-surface-muted">
              <div className="font-mono text-[13px] text-chizuru-600">{s.n}</div>
              <h3 className="font-sans font-semibold text-[24px] mt-[10px] mb-[12px] text-text">{s.t}</h3>
              <p className="text-[14.5px] leading-[1.6] text-text-muted m-0 font-sans">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="profiles" className="relative py-[clamp(60px,9vh,110px)] px-[clamp(18px,5vw,90px)] bg-surface-muted">
        <div className="max-w-[1280px] mx-auto">
          <div data-reveal className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <div className="font-mono text-[12px] tracking-[3px] text-chizuru-600">GẶP GỠ</div>
              <h2 className="font-sans font-medium text-[clamp(34px,5.5vw,64px)] leading-[1.02] mt-[14px] text-text">Hồ sơ người đồng hành</h2>
            </div>
            <Link
              href="/explore"
              className="font-mono text-[12px] tracking-[1.5px] text-text underline"
            >
              XEM TẤT CẢ →
            </Link>
          </div>
          {companions.length > 0 ? (
            <div data-reveal className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[22px]">
                {companions.map((c) => (
                  <CompanionCard key={c.id} {...c} />
                ))}
              </div>
            </div>
          ) : (
            <div data-reveal className="mt-12 text-center py-[60px] text-text-muted font-sans">
              Chưa có người đồng hành nào. Quay lại sau nhé!
            </div>
          )}
        </div>
      </section>

      <section id="reviews" className="relative py-[clamp(80px,12vh,140px)] px-[clamp(18px,5vw,90px)] max-w-[1280px] mx-auto">
        <div data-reveal className="text-center max-w-[620px] mx-auto">
          <div className="font-mono text-[12px] tracking-[3px] text-chizuru-600">TRẢI NGHIỆM THẬT</div>
          <h2 className="font-sans font-medium text-[clamp(34px,5.5vw,64px)] leading-[1.02] mt-[14px] text-text">Người dùng nói gì</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 mt-[54px]">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} data-reveal className="border-[1.5px] border-border rounded-2xl p-7 bg-surface-muted">
              <div className="font-sans text-[34px] text-chizuru-600 leading-[.6]">“</div>
              <p className="text-[15.5px] leading-[1.7] text-text mt-[14px] mb-[22px] font-sans">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-full bg-checkerboard-neutral border border-border" />
                <div>
                  <div className="font-semibold text-[14px] text-text font-sans">{t.name}</div>
                  <div className="text-[12px] text-text-muted font-sans">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="safety" className="relative py-[clamp(70px,10vh,130px)] px-[clamp(18px,5vw,90px)] bg-surface-inverted text-text-inverted">
        <div className="max-w-[1100px] mx-auto text-center">
          <div data-reveal>
            <div className="font-mono text-[12px] tracking-[3px] text-chizuru-600">BẢO MẬT &amp; TIN CẬY</div>
            <h2 className="font-sans font-medium text-[clamp(34px,5.5vw,64px)] leading-[1.02] mt-[14px]">An toàn là trên hết</h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[30px] mt-[56px] text-left">
            {SAFETY.map((f) => (
              <div key={f.t} data-reveal>
                <div className="w-[46px] h-[46px] border-[1.5px] border-dashed border-white/40 rounded-xl flex items-center justify-center font-mono text-[10px] text-white/55">ICON</div>
                <h3 className="font-sans font-semibold text-[23px] mt-[18px] mb-[10px]">{f.t}</h3>
                <p className="text-[14.5px] leading-[1.65] text-white/70 m-0 font-sans">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="relative py-[clamp(80px,12vh,140px)] px-[clamp(18px,5vw,90px)] max-w-[860px] mx-auto">
        <div data-reveal className="text-center">
          <div className="font-mono text-[12px] tracking-[3px] text-chizuru-600">GIẢI ĐÁP</div>
          <h2 className="font-sans font-medium text-[clamp(34px,5.5vw,64px)] leading-[1.02] mt-[14px] text-text">Câu hỏi thường gặp</h2>
        </div>
        <div data-reveal className="mt-[46px]">
          {FAQS.map((f) => (
            <details key={f.q} className="group border-b-[1.5px] border-border">
              <summary className="flex items-center justify-between gap-4 py-[22px] px-1 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-[17px] font-medium text-text font-sans">{f.q}</span>
                <span className="text-[20px] text-chizuru-600 shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="text-[14.5px] leading-[1.7] text-text-muted mt-0 mb-[22px] mx-1 font-sans">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative py-[clamp(80px,12vh,150px)] px-[clamp(18px,5vw,90px)] text-center bg-surface-muted">
        <div data-reveal className="max-w-[680px] mx-auto">
          <h2 className="font-sans font-medium text-[clamp(36px,6vw,76px)] leading-[1.02] m-0 text-text">
            Sẵn sàng tìm người đồng hành của bạn?
          </h2>
          <Link
            href="/explore"
            className="inline-block font-sans text-[16px] font-semibold py-4 px-10 rounded-full bg-surface-inverted text-text-inverted mt-[34px] no-underline"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </section>

      <footer className="relative py-[clamp(50px,7vh,80px)] px-[clamp(18px,5vw,90px)] pb-10 bg-surface-inverted text-white/70">
        <div className="max-w-[1280px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-9">
          <div className="max-w-[260px]">
            <div className="flex items-center gap-[10px] text-text-inverted">
              <div className="w-7 h-7 border-[1.5px] border-white rounded-[50%_50%_50%_4px] flex items-center justify-center text-[12px]">♥</div>
              <span className="font-display text-[20px] font-semibold">Rent-a-Girlfriend</span>
            </div>
            <p className="text-[13.5px] leading-[1.6] mt-4 font-sans">Người đồng hành dịu dàng, an toàn và minh bạch cho mọi khoảnh khắc.</p>
          </div>
          {FOOTCOLS.map((c) => (
            <div key={c.h}>
              <div className="font-mono text-[11px] tracking-[2px] text-chizuru-600 mb-4">{c.h}</div>
              {c.items.map((it) => (
                <div key={it} className="text-[14px] mb-3 font-sans">{it}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="max-w-[1280px] mx-auto mt-12 pt-6 border-t border-white/15 font-mono text-[11px] text-white/40">
          © 2026 Rent-a-Girlfriend
        </div>
      </footer>
    </div>
  );
}
