'use client';

import React, { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';
import { CompanionCard, type CompanionCardProps } from '@/shared/components/molecules/CompanionCard';

// TODO: swap bằng video Furina thật khi có asset chính thức.
const HERO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

interface Props {
  companions: CompanionCardProps[];
}

const css = (str: string): CSSProperties =>
  Object.fromEntries(
    str
      .split(';')
      .filter(Boolean)
      .map((r) => {
        const i = r.indexOf(':');
        const k = r.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        return [k, r.slice(i + 1).trim()];
      }),
  ) as CSSProperties;

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

    const hero = q('#hero');
    const screen = q('#heroScreen');
    const head = q('#heroHeadline');
    const flash = q('#heroFlash');
    const bars = root.querySelectorAll<HTMLElement>('.letterbar');
    if (hero && screen && head && flash && bars.length >= 2) {
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

  const toggleFaq = (e: MouseEvent<HTMLDivElement>) => {
    const item = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-faq]');
    if (!item) return;
    const ans = item.querySelector<HTMLElement>('[data-ans]');
    const chev = item.querySelector<HTMLElement>('[data-chev]');
    if (!ans || !chev) return;
    const open = item.getAttribute('data-open') === '1';
    item.setAttribute('data-open', open ? '0' : '1');
    ans.style.maxHeight = open ? '0px' : ans.scrollHeight + 'px';
    chev.textContent = open ? '+' : '×';
  };

  const eyebrow = "font-family:'Space Mono',monospace;font-size:12px;letter-spacing:3px;color:#b08597";
  const h2 = "font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(34px,5.5vw,64px);line-height:1.02;margin:14px 0 0";
  const reveal = (extra?: string) => css('opacity:0;transform:translateY(28px)' + (extra ? ';' + extra : ''));

  return (
    <div ref={rootRef} style={css("position:relative;width:100%;overflow-x:clip;background:#f5f2ef;font-family:'Hanken Grotesk',system-ui,sans-serif;color:#3a3338")}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Hanken+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scrollcue{0%,100%{transform:translateY(0);opacity:.9}50%{transform:translateY(9px);opacity:.25}}
      ` }} />

      <section id="hero" style={css('position:relative;width:100%;height:100vh;background:#f5f2ef')}>
        <div id="heroStage" style={css('position:sticky;top:0;height:100vh;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden')}>
          <div id="heroScreen" style={css('position:absolute;inset:0;width:100%;height:100%;background:#1c1822;overflow:hidden')}>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              src={HERO_VIDEO_URL}
              style={css('position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1')}
            />
            <div className="letterbar" style={css('position:absolute;top:0;left:0;width:100%;background:#14101a;z-index:6')} />
            <div className="letterbar" style={css('position:absolute;bottom:0;left:0;width:100%;background:#14101a;z-index:6')} />
            <div id="heroFlash" style={css('position:absolute;inset:0;background:#fff;z-index:8;pointer-events:none')} />
          </div>

          <div id="heroHeadline" style={css('position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;pointer-events:none')}>
            <div style={css("font-family:'Space Mono',monospace;font-size:12px;letter-spacing:3px;color:#e8b9c8;margin-bottom:18px")}>DỊCH VỤ NGƯỜI ĐỒNG HÀNH</div>
            <h1 style={css("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(44px,9vw,118px);line-height:.98;color:#f5f2ef;margin:0;text-shadow:0 4px 40px rgba(0,0,0,.35)")}>Rent-a-Girlfriend</h1>
            <p style={css('max-width:560px;margin:22px auto 0;font-size:clamp(15px,1.6vw,18px);line-height:1.6;color:rgba(245,242,239,.82)')}>Người đồng hành dịu dàng cho từng khoảnh khắc — trò chuyện, dạo phố, hay đơn giản là có ai đó bên cạnh.</p>
            <div style={css('display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:34px;pointer-events:auto')}>
              <Link href="/explore" style={css('font-family:inherit;font-size:15px;font-weight:600;padding:14px 30px;border-radius:999px;background:#f5f2ef;color:#221d27;text-decoration:none')}>Tìm người đồng hành</Link>
              <a href="#how" style={css('font-family:inherit;font-size:15px;font-weight:500;padding:14px 28px;border:1.5px solid rgba(245,242,239,.55);border-radius:999px;background:transparent;color:#f5f2ef;text-decoration:none')}>Xem cách hoạt động</a>
            </div>
            <div style={css("margin-top:46px;display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(245,242,239,.7);font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px")}>CUỘN ĐỂ KHÁM PHÁ<span style={css('font-size:18px;animation:scrollcue 1.8s ease-in-out infinite')}>↓</span></div>
          </div>
        </div>
      </section>

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

      <section id="profiles" style={css('position:relative;padding:clamp(60px,9vh,110px) clamp(18px,5vw,90px);background:#efe9e4')}>
        <div style={css('max-width:1280px;margin:0 auto')}>
          <div data-reveal style={reveal('display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px')}>
            <div>
              <div style={css(eyebrow)}>GẶP GỠ</div>
              <h2 style={css(h2)}>Hồ sơ người đồng hành</h2>
            </div>
            <Link href="/explore" style={css("font-family:'Space Mono',monospace;font-size:12px;letter-spacing:1.5px;color:#3a3338;text-decoration:underline")}>XEM TẤT CẢ →</Link>
          </div>
          {companions.length > 0 ? (
            <div data-reveal style={reveal('margin-top:48px')}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[22px]">
                {companions.map((c) => (
                  <CompanionCard key={c.id} {...c} />
                ))}
              </div>
            </div>
          ) : (
            <div data-reveal style={reveal('margin-top:48px;text-align:center;padding:60px;color:#6d6369')}>
              Chưa có người đồng hành nào. Quay lại sau nhé!
            </div>
          )}
        </div>
      </section>

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

      <section style={css('position:relative;padding:clamp(80px,12vh,150px) clamp(18px,5vw,90px);text-align:center;background:#efe9e4')}>
        <div data-reveal style={reveal('max-width:680px;margin:0 auto')}>
          <h2 style={css("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(36px,6vw,76px);line-height:1.02;margin:0")}>Sẵn sàng tìm người đồng hành của bạn?</h2>
          <Link href="/explore" style={css('display:inline-block;font-family:inherit;font-size:16px;font-weight:600;padding:16px 40px;border-radius:999px;background:#3a3338;color:#f5f2ef;margin-top:34px;text-decoration:none')}>Bắt đầu ngay</Link>
        </div>
      </section>

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
        <div style={css("max-width:1280px;margin:48px auto 0;padding-top:24px;border-top:1px solid rgba(245,242,239,.15);font-family:'Space Mono',monospace;font-size:11px;color:rgba(245,242,239,.4)")}>© 2026 Rent-a-Girlfriend</div>
      </footer>
    </div>
  );
}
