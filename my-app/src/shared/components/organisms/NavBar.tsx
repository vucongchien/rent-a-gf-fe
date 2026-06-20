'use client';

import React, { useState, ReactNode } from 'react';
import { NavBarButton } from '../atoms/NavBarButton';
import Link from 'next/link';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useScrollHide } from '@/shared/hooks/useScrollHide';
import { useNavIndicator } from './useNavIndicator';

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

/* ── SUB-COMPONENTS NỘI BỘ (Để file chính gọn gàng hơn) ── */

export interface NavIndicatorState {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  bottom: number;
  ready: boolean;
}

interface NavIndicatorProps {
  show: boolean;
  effect: 'pill' | 'underline' | 'dot' | 'blob' | 'bounce';
  ind: NavIndicatorState;
  indId: string;
  mobile: boolean;
  accent: string;
  dur: number;
  bezier: string;
}

const NavIndicator: React.FC<NavIndicatorProps> = ({
  show,
  effect,
  ind,
  indId,
  mobile,
  accent,
  dur,
  bezier,
}) => {
  if (!show) return null;

  if (effect === 'pill') {
    const pad = mobile ? 6 : 8;
    return (
      <div
        id={indId}
        className="nb-ind nb-ind-pill"
        style={{
          left: ind.x - pad,
          top: ind.y - pad,
          width: ind.w + pad * 2,
          height: ind.h + pad * 2,
          background: tint(accent, 0.16),
          boxShadow: `inset 0 0 0 1px ${tint(accent, 0.32)}`,
          transition: `left ${dur}ms ${bezier}, top ${dur}ms ${bezier}, width ${dur}ms ${bezier}, height ${dur}ms ${bezier}, background 240ms ease`,
        }}
      />
    );
  }

  if (effect === 'underline') {
    const w = Math.min(ind.w * 0.46, 26);
    return (
      <div
        id={indId}
        className="nb-ind nb-ind-underline"
        style={{
          left: ind.cx - w / 2,
          top: ind.bottom - 5,
          width: w,
          height: 3.5,
          background: accent,
          transition: `left ${dur}ms ${bezier}, width ${dur}ms ${bezier}`,
        }}
      />
    );
  }

  if (effect === 'dot') {
    return (
      <div
        id={indId}
        className="nb-ind nb-ind-dot"
        style={{
          left: ind.cx - 3.5,
          top: ind.bottom - 4,
          width: 7,
          height: 7,
          background: accent,
          transition: `left ${dur}ms ${bezier}`,
        }}
      />
    );
  }

  if (effect === 'blob') {
    const size = ind.h * 1.06;
    return (
      <div
        id={indId}
        className="nb-ind nb-ind-blob"
        style={{
          left: ind.cx - size / 2,
          top: ind.y + (ind.h - size) / 2,
          width: size,
          height: size,
          background: `radial-gradient(circle at 50% 42%, ${tint(accent, 0.3)}, ${tint(accent, 0.12)})`,
          boxShadow: `0 4px 16px ${tint(accent, 0.55)}55`,
          transition: `left ${dur}ms ${bezier}, top ${dur}ms ${bezier}, width ${dur}ms ${bezier}, height ${dur}ms ${bezier}`,
        }}
      />
    );
  }

  return null;
};

interface NavBarItemProps {
  item: NavItem;
  active: string;
  accent: string;
  bezier: string;
  dur: number;
  wobble: number;
  setRef: (id: string, el: HTMLButtonElement | HTMLAnchorElement | null) => void;
  onPick: (id: string) => void;
}

const NavBarItem: React.FC<NavBarItemProps> = ({
  item,
  active,
  accent,
  bezier,
  dur,
  wobble,
  setRef,
  onPick,
}) => {
  const on = item.id === active;
  const showLabel = true; // Always show label below icon
  const isBouncing = item.id === active && wobble > 0;

  const content = (
    <>
      <span
        key={isBouncing ? `bounce-${wobble}` : 'static'}
        className="nb-icon"
      >
        {renderIcon(item.icon, on)}
      </span>
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
      (isBouncing ? ' nb-bounce' : ''),
    style: { color: on ? accent : 'var(--color-nav-inactive)', '--bz': bezier, '--dur': dur + 'ms' } as React.CSSProperties,
    onClick: () => onPick(item.id),
    'aria-current': on ? 'page' as const : undefined,
    'aria-label': item.label,
  };

  const refSetter = (el: HTMLButtonElement | HTMLAnchorElement | null) => {
    if (el) {
      setRef(item.id, el);
    }
  };

  if (item.href) {
    return (
      <Link
        key={item.id}
        ref={refSetter}
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
      ref={refSetter}
      type="button"
      {...commonProps}
    >
      {content}
    </NavBarButton>
  );
};

/* ── COMPONENT CHÍNH ── */

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
  const controlled = activeId != null;
  const [internal, setInternal] = useState(defaultActiveId ?? items[0]?.id);
  const active = controlled ? activeId : internal;

  // 1. Sử dụng hook check responsive
  const isNarrow = useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
  const mobile = forceMobile || isNarrow;

  // 2. Sử dụng hook scroll ẩn hiện
  const { hidden, scrolled } = useScrollHide({ scrollHide });

  // 3. Sử dụng hook đo đạc di chuyển của indicator
  const {
    ind,
    indId,
    listRef,
    btnRefs,
    wobble,
    triggerWobble,
    dur,
    bezier,
    wobbleAmt,
  } = useNavIndicator({
    active,
    mobile,
    showLabels,
    effect,
    accent,
    spring,
  });

  const activeIndex = items.findIndex((i) => i.id === active);

  const pick = (id: string) => {
    if (id === active) {
      triggerWobble();
      onChange?.(id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (!controlled) setInternal(id);
    triggerWobble();
    onChange?.(id);
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

  // Định nghĩa các phần tử giao diện con để lắp ghép
  const brandElement = brand && (
    <div className="nb-logo">
      {brand.node ?? <span className="nb-logo-dot" style={{ background: accent }} />}
      {brand.name && <span className="nb-logo-text font-semibold text-base">{brand.name}</span>}
    </div>
  );

  const listElement = (
    <div className="nb-list" ref={listRef}>
      <NavIndicator
        show={ind.ready && activeIndex >= 0}
        effect={effect}
        ind={ind}
        indId={indId}
        mobile={mobile}
        accent={accent}
        dur={dur}
        bezier={bezier}
      />
      {items.map((item) => (
        <NavBarItem
          key={item.id}
          item={item}
          active={active}
          accent={accent}
          bezier={bezier}
          dur={dur}
          wobble={wobble}
          setRef={(id, el) => {
            btnRefs.current[id] = el;
          }}
          onPick={pick}
        />
      ))}
    </div>
  );

  const actionsElement = actions && (
    <div className="nb-actions flex items-center gap-3">
      {actions}
    </div>
  );

  // Gom nhóm Left/Right
  const leftSection = (
    <div className="nb-left flex items-center gap-6">
      {!mobile && brandElement}
      {listElement}
    </div>
  );

  const rightSection = actionsElement;

  // 4. Rẽ nhánh render Mobile / Desktop
  if (mobile) {
    // Style trượt ẩn hiện của Top Bar trên mobile (đồng bộ như Desktop)
    const mobileTopBarStyle = {
      position: 'fixed' as const,
      top: '12px',
      left: '0',
      right: '0',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none' as const,
      transition: 'transform 420ms cubic-bezier(0.34, 1.3, 0.5, 1), opacity 300ms ease',
      transform: hidden ? 'translateY(-160%)' : 'translateY(0)',
      opacity: hidden ? 0 : 1,
    };

    return (
      <>
        {/* Top Bar: Chỉ hiển thị <right> (Actions) */}
        {rightSection && (
          <nav
            className={className}
            style={mobileTopBarStyle}
          >
            <div className="nb-bar flex justify-end" style={barStyle}>
              {rightSection}
            </div>
          </nav>
        )}
        
        {/* Bottom Bar: Hiển thị <left> (Menu điều hướng) */}
        <nav
          className={'nb-wrap nb-mobile' + (hidden ? ' nb-hidden' : '') + (className ? ' ' + className : '')}
          style={{ '--wobble': wobbleAmt } as React.CSSProperties}
        >
          <div className="nb-bar" style={barStyle}>
            {listElement}
          </div>
        </nav>
      </>
    );
  }

  // Giao diện Desktop mặc định: <left> <right> song song
  return (
    <nav
      className={'nb-wrap nb-desktop' + (hidden ? ' nb-hidden' : '') + (className ? ' ' + className : '')}
      style={{ '--wobble': wobbleAmt } as React.CSSProperties}
    >
      <div className="nb-bar" style={barStyle}>
        {leftSection}
        {rightSection && (
          <div className="ml-auto">
            {rightSection}
          </div>
        )}
      </div>
    </nav>
  );
}

