'use client';

/**
 * NavBar — a refined, iOS-flavoured responsive navigation component.
 *
 * One component, two shapes:
 *   • desktop ≥ `breakpoint`  → floating "pill" bar pinned top-center
 *   • mobile  <  `breakpoint` → floating dock pinned bottom-center
 */

import React, {
  useState, useRef, useEffect, useLayoutEffect, useCallback, ReactNode
} from 'react';
import { NavBarButton } from '../atoms/NavBarButton';
import Link from 'next/link';

/* ── built-in icons from atoms ── */
export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode | ((props: { active: boolean }) => ReactNode);
  href?: string;
  badge?: number | string;
}

export interface NavBarProps {
  items: NavItem[];
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  effect?: 'pill' | 'underline' | 'dot' | 'blob' | 'bounce';
  accent?: string;
  breakpoint?: number;
  forceMobile?: boolean;
  showLabels?: boolean;
  scrollHide?: boolean;
  glass?: number;
  spring?: number;
  brand?: { name?: string; node?: ReactNode };
  actions?: ReactNode; // Tích hợp Wallet, Search, Dropdown trên desktop
  className?: string;
}

function renderIcon(icon: NavItem['icon'], active: boolean) {
  if (typeof icon === 'function') return icon({ active });
  return icon;
}

const tint = (hex: string, amt: number) =>
  `color-mix(in srgb, ${hex} ${Math.round(amt * 100)}%, white)`;

export function NavBar({
  items,
  activeId,
  defaultActiveId,
  onChange,
  effect = 'pill',
  accent = 'var(--color-nav-accent)',
  breakpoint = 1024,
  forceMobile = false,
  showLabels = true,
  scrollHide = true,
  glass = 16,
  spring = 60,
  brand,
  actions,
  className = '',
}: NavBarProps) {
  injectStyles();

  const controlled = activeId != null;
  const [internal, setInternal] = useState(defaultActiveId ?? items[0]?.id);
  const active = controlled ? activeId : internal;

  const [isNarrow, setIsNarrow] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ind, setInd] = useState({ x: 0, y: 0, w: 0, h: 0, cx: 0, bottom: 0, ready: false });
  const [wobble, setWobble] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | HTMLAnchorElement | null>>({});
  const lastScroll = useRef(0);
  
  const [indId] = useState(() => `nbi-${Math.random().toString(36).slice(2, 8)}`);

  const activeIndex = items.findIndex((i) => i.id === active);
  const mobile = forceMobile || isNarrow;

  const s = spring / 100;
  const bezier = `cubic-bezier(0.34, ${(1 + s * 0.85).toFixed(3)}, 0.5, 1)`;
  const dur = Math.round(260 + s * 240);
  const wobbleAmt = (0.08 + s * 0.18).toFixed(3);

  /* viewport */
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  /* scroll */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(scrollHide ? (y > lastScroll.current && y > 90) : false);
      lastScroll.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollHide]);

  /* measure indicator */
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!active) return;
    const btn = btnRefs.current[active];
    if (!list || !btn) return;
    const lr = list.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setInd({
      x: br.left - lr.left, y: br.top - lr.top, w: br.width, h: br.height,
      cx: br.left - lr.left + br.width / 2,
      bottom: br.top - lr.top + br.height, ready: true,
    });
  }, [active]);

  useLayoutEffect(() => {
    measure();
    const r = requestAnimationFrame(measure);
    const t = setTimeout(measure, 240);
    return () => { cancelAnimationFrame(r); clearTimeout(t); };
  }, [active, mobile, showLabels, effect, accent, measure]);

  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [measure]);

  const pick = (id: string) => {
    if (id === active) return;
    if (!controlled) setInternal(id);
    setWobble((w) => w + 1);
    onChange?.(id);
  };

  useEffect(() => {
    if (wobble === 0) return;
    const el = document.getElementById(indId);
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = `nb-gummy ${dur}ms ${bezier}`;
  }, [wobble, dur, bezier, indId]);

  /* indicator element */
  const showInd = ind.ready && activeIndex >= 0;
  let indicator = null;
  if (showInd && effect === 'pill') {
    const pad = mobile ? 6 : 8;
    indicator = (
      <div id={indId} className="nb-ind nb-ind-pill" style={{
        left: ind.x - pad, top: ind.y - pad, width: ind.w + pad * 2, height: ind.h + pad * 2,
        background: tint(accent, 0.16), boxShadow: `inset 0 0 0 1px ${tint(accent, 0.32)}`,
        transition: `left ${dur}ms ${bezier}, top ${dur}ms ${bezier}, width ${dur}ms ${bezier}, height ${dur}ms ${bezier}, background 240ms ease`,
      }} />
    );
  } else if (showInd && effect === 'underline') {
    const w = Math.min(ind.w * 0.46, 26);
    indicator = (
      <div id={indId} className="nb-ind nb-ind-underline" style={{
        left: ind.cx - w / 2, top: ind.bottom - 5, width: w, height: 3.5, background: accent,
        transition: `left ${dur}ms ${bezier}, width ${dur}ms ${bezier}`,
      }} />
    );
  } else if (showInd && effect === 'dot') {
    indicator = (
      <div id={indId} className="nb-ind nb-ind-dot" style={{
        left: ind.cx - 3.5, top: ind.bottom - 4, width: 7, height: 7, background: accent,
        transition: `left ${dur}ms ${bezier}`,
      }} />
    );
  } else if (showInd && effect === 'blob') {
    const size = ind.h * 1.06;
    indicator = (
      <div id={indId} className="nb-ind nb-ind-blob" style={{
        left: ind.cx - size / 2, top: ind.y + (ind.h - size) / 2, width: size, height: size,
        background: `radial-gradient(circle at 50% 42%, ${tint(accent, 0.3)}, ${tint(accent, 0.12)})`,
        boxShadow: `0 4px 16px ${tint(accent, 0.55)}55`,
        transition: `left ${dur}ms ${bezier}, top ${dur}ms ${bezier}, width ${dur}ms ${bezier}, height ${dur}ms ${bezier}`,
      }} />
    );
  }

  const renderItem = (item: NavItem) => {
    const on = item.id === active;
    const showLabel = true; // Always show label below icon

    const content = (
      <>
        <span className="nb-icon">{renderIcon(item.icon, on)}</span>
        {showLabel && (
          <span className="nb-label text-[10.5px] font-sans mt-[3px] text-center truncate w-full px-1 select-none">
            {item.label}
          </span>
        )}
        {item.badge != null && (
          <span className="nb-badge text-[10px] font-bold" style={{ background: accent }}>{item.badge}</span>
        )}
      </>
    );

    const commonProps = {
      className: 'nb-item font-medium no-underline' + (on ? ' is-active' : '') +
        ' nb-item-col' + // Force column layout (text below icon)
        (effect === 'bounce' && on ? ' nb-bounce' : ''),
      style: { color: on ? accent : 'var(--color-nav-inactive)', '--bz': bezier, '--dur': dur + 'ms' } as React.CSSProperties,
      onClick: () => pick(item.id),
      'aria-current': on ? 'page' as const : undefined,
      'aria-label': item.label,
    };

    if (item.href) {
      return (
        <Link
          key={item.id}
          ref={(el) => {
            if (el) btnRefs.current[item.id] = el;
          }}
          href={item.href}
          {...commonProps}
        >
          {content}
        </Link>
      );
    }

    return (
      <NavBarButton
        key={item.id}
        ref={(el) => {
          if (el) btnRefs.current[item.id] = el;
        }}
        type="button"
        {...commonProps}
      >
        {content}
      </NavBarButton>
    );
  };

  const barStyle = {
    backdropFilter: `blur(${glass}px) saturate(150%)`,
    WebkitBackdropFilter: `blur(${glass}px) saturate(150%)`,
    background: scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.62)',
    boxShadow: scrolled
      ? '0 10px 34px -10px rgba(30,28,40,0.22), 0 2px 8px -2px rgba(30,28,40,0.12), inset 0 0 0 1px rgba(255,255,255,0.7)'
      : '0 8px 26px -12px rgba(30,28,40,0.16), inset 0 0 0 1px rgba(255,255,255,0.6)',
    '--accent': accent,
  } as React.CSSProperties;

  return (
    <nav
      className={'nb-wrap ' + (mobile ? 'nb-mobile' : 'nb-desktop') + (hidden ? ' nb-hidden' : '') + (className ? ' ' + className : '')}
      style={{ '--wobble': wobbleAmt } as React.CSSProperties}
    >
      <div className="nb-bar" style={barStyle}>
        {!mobile && brand && (
          <div className="nb-logo">
            {brand.node ?? <span className="nb-logo-dot" style={{ background: accent }} />}
            {brand.name && <span className="nb-logo-text font-semibold text-base">{brand.name}</span>}
          </div>
        )}
        <div className="nb-list" ref={listRef}>
          {indicator}
          {items.map(renderItem)}
        </div>
        {!mobile && actions && (
          <div className="nb-actions ml-auto flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </nav>
  );
}

/* ── self-injected styles (runs once) ──────────────────────────────────── */
let _injected = false;
function injectStyles() {
  if (_injected || typeof document === 'undefined') return;
  _injected = true;
  const css = `
.nb-wrap{position:fixed;left:0;right:0;z-index:50;display:flex;justify-content:center;pointer-events:none;transition:transform 420ms cubic-bezier(0.34,1.3,0.5,1),opacity 300ms ease}
.nb-wrap.nb-desktop{top:18px}
.nb-wrap.nb-mobile{bottom:22px;top:auto}
.nb-wrap.nb-hidden.nb-desktop{transform:translateY(-160%);opacity:0}
.nb-wrap.nb-hidden.nb-mobile{transform:translateY(180%);opacity:0}
.nb-bar{pointer-events:auto;display:flex;align-items:center;gap:14px;padding:8px 12px;border-radius:999px;transition:background 280ms ease,box-shadow 280ms ease; max-width: 1100px; width: 100%;}
.nb-desktop .nb-bar { padding: 8px 16px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; justify-content: stretch; }
.nb-desktop .nb-logo { grid-column: 1; justify-self: start; }
.nb-desktop .nb-list { grid-column: 2; justify-self: center; }
.nb-desktop .nb-actions { grid-column: 3; justify-self: end; margin-left: 0; }
.nb-mobile .nb-bar{padding:7px clamp(6px, 1.8vw, 12px);gap:0; max-width: 92vw; width: 100%;}
.nb-logo{display:flex;align-items:center;gap:9px;padding:0 8px 0 10px}
.nb-logo-dot{width:14px;height:14px;border-radius:50%;box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 18%,white)}
.nb-logo-text{letter-spacing:-0.01em;color:var(--color-nav-logo)}
.nb-list{position:relative;display:flex;align-items:center;gap:12px}
.nb-mobile .nb-list{gap:clamp(4px, 1.2vw, 8px);width:100%;justify-content:space-between}
.nb-item{position:relative;z-index:2;appearance:none;border:0;background:none;cursor:pointer;letter-spacing:-0.01em;display:flex;align-items:center;justify-content:center;border-radius:999px;transition:color 220ms ease,transform var(--dur) var(--bz);-webkit-tap-highlight-color:transparent}
.nb-desktop .nb-item{width:76px}
.nb-mobile .nb-item{flex:1;min-width:48px;max-width:72px}
.nb-item-col{flex-direction:column;gap:3px;padding:9px 0 8px}
.nb-item-row{flex-direction:row;gap:8px;padding:11px 0}
.nb-mobile .nb-item-col{padding:10px 0}
.nb-mobile .nb-item-row{padding:11px 0}
@media (max-width:340px){
  .nb-mobile .nb-label{display:none}
  .nb-mobile .nb-item-col{padding:12px 0 10px}
}
.nb-item:focus{outline:none}
.nb-item:focus-visible{outline:2px solid color-mix(in srgb,var(--accent) 65%,white);outline-offset:3px}
.nb-icon{display:flex;transition:transform var(--dur) var(--bz)}
.nb-item.is-active .nb-icon{transform:translateY(-0.5px)}
.nb-bounce .nb-icon{animation:nb-iconpop var(--dur) var(--bz)}
.nb-label{line-height:1;white-space:nowrap}
.nb-item-row .nb-label{}
.nb-label-expand{overflow:hidden;max-width:120px;opacity:1;transition:max-width var(--dur) var(--bz),opacity calc(var(--dur) * 0.7) ease}
.nb-badge{position:absolute;top:4px;right:8px;min-width:16px;height:16px;padding:0 4px;border-radius:9px;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px rgba(255,255,255,0.9)}
.nb-ind{position:absolute;z-index:1;pointer-events:none;transform-origin:center}
.nb-ind-pill{border-radius:999px}
.nb-ind-underline{border-radius:4px}
.nb-ind-dot{border-radius:50%}
.nb-ind-blob{border-radius:46% 54% 50% 50%/52% 48% 52% 48%;animation:nb-blobmorph 5s ease-in-out infinite}
.nb-actions { display: flex; align-items: center; }
@keyframes nb-gummy{0%{transform:scale(1,1)}32%{transform:scale(calc(1 + var(--wobble)),calc(1 - var(--wobble) * 0.85))}62%{transform:scale(calc(1 - var(--wobble) * 0.45),calc(1 + var(--wobble) * 0.4))}100%{transform:scale(1,1)}}
@keyframes nb-iconpop{0%{transform:scale(1) translateY(0)}40%{transform:scale(1.22) translateY(-3px)}70%{transform:scale(0.94) translateY(0)}100%{transform:scale(1) translateY(-0.5px)}}
@keyframes nb-blobmorph{0%,100%{border-radius:46% 54% 50% 50%/52% 48% 52% 48%}50%{border-radius:54% 46% 52% 48%/46% 54% 48% 52%}}
@media (prefers-reduced-motion: reduce){.nb-ind,.nb-item,.nb-icon,.nb-wrap{transition:none !important;animation:none !important}}
`;
  const el = document.createElement('style');
  el.id = 'navbar-styles';
  el.textContent = css;
  document.head.appendChild(el);
}
