'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  XIcon,
  CompassIcon,
  ChatIcon,
  HistoryIcon,
  SoundsIcon,
  CompanionsIcon,
} from '@/shared/components/atoms/Icons';

// -------------------------------------------------------------------
// Nav items
// -------------------------------------------------------------------
const NAV_ITEMS = [
  { href: '/explore',     label: 'Explore',     icon: CompassIcon,    live: true },
  { href: '/companions',  label: 'Companions',  icon: CompanionsIcon, live: true },
  { href: '/sounds',      label: 'Sounds',      icon: SoundsIcon,     live: true },
  { href: '#',            label: 'Chat',        icon: ChatIcon,       live: false },
  { href: '#',            label: 'Lịch sử đặt', icon: HistoryIcon,   live: false },
];

// -------------------------------------------------------------------
// MobileSidebar — chỉ render trên mobile (md:hidden ở parent)
// -------------------------------------------------------------------
export const MobileSidebar: React.FC = () => {
  const { isOpen, close } = useSidebar();
  const { user, logout, login, isLoading } = useAuth();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const [userDropOpen, setUserDropOpen] = useState(false);

  // Khoá scroll body khi sidebar mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  return (
    <>
      {/* Overlay backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`
          fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Sidebar panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`
          fixed left-0 top-0 bottom-0 z-50
          w-[280px] bg-white
          flex flex-col
          shadow-[4px_0_32px_-8px_rgba(0,0,0,0.18)]
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-[20px] pt-[20px] pb-[16px]">
          {/* Logo nhỏ */}
          <div className="flex items-center gap-[8px]">
            <div className="w-[32px] h-[32px] rounded-[10px] grid place-items-center bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_4px_10px_-4px_rgba(251,105,153,0.5)]">
              <svg viewBox="0 0 24 24" fill="#fff" className="w-[17px] h-[17px]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="font-sans text-[18px] tracking-[-0.02em] font-semibold">
              <em className="not-italic italic text-[var(--color-chizuru-600)]">kanojo</em>
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={close}
            aria-label="Close menu"
            className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-150"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-[12px] py-[8px] overflow-y-auto">
          {/* Active routes */}
          <div className="mb-[4px]">
            {NAV_ITEMS.filter((i) => i.live).map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className={`
                    flex items-center gap-[12px] px-[12px] py-[11px] rounded-[12px]
                    font-sans text-[15px] font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-chizuru-50 text-[var(--color-chizuru-600)]'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-[var(--color-chizuru-600)]' : 'text-neutral-400'} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-100 my-[10px] mx-[4px]" />

          {/* Placeholder routes */}
          <p className="px-[12px] text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-400 mb-[4px]">
            Sắp ra mắt
          </p>
          {NAV_ITEMS.filter((i) => !i.live).map(({ href, label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-[12px] px-[12px] py-[11px] rounded-[12px] text-neutral-400 cursor-not-allowed select-none"
            >
              <Icon size={18} />
              <span className="font-sans text-[15px] font-medium">{label}</span>
              <span className="ml-auto text-[10px] font-mono bg-neutral-100 text-neutral-400 px-[6px] py-[2px] rounded-full">soon</span>
            </div>
          ))}
        </nav>

        {/* ── User section (bottom) ── */}
        <div className="px-[12px] pb-[max(20px,env(safe-area-inset-bottom))] pt-[8px] border-t border-neutral-100">
          {isLoading ? (
            <div className="h-[60px] bg-neutral-100 rounded-[14px] animate-pulse" />
          ) : user ? (
            <div>
              {/* Dropdown — hiện phía trên row khi mở */}
              <div
                className={`
                  overflow-hidden transition-all duration-200 ease-out mb-[6px]
                  ${userDropOpen ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <button
                  onClick={() => { logout(); setUserDropOpen(false); }}
                  className="w-full flex items-center gap-[10px] px-[12px] py-[10px] rounded-[12px] text-left text-rose-500 hover:bg-rose-50 active:bg-rose-100 font-sans font-medium text-[14px] transition-colors duration-150"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-[16px] h-[16px] flex-none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Đăng xuất
                </button>
              </div>

              {/* User row — tap để toggle dropdown */}
              <button
                onClick={() => setUserDropOpen((v) => !v)}
                aria-expanded={userDropOpen}
                aria-label="User menu"
                className="w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[14px] border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 transition-colors duration-150 text-left"
              >
                {user.avatarUrl ? (
                  <div className="relative w-[38px] h-[38px] rounded-full overflow-hidden flex-none border border-neutral-200">
                    <Image src={user.avatarUrl} alt={user.displayName} fill className="object-cover" sizes="38px" />
                  </div>
                ) : (
                  <div className="w-[38px] h-[38px] rounded-full bg-chizuru-100 flex items-center justify-center flex-none text-[var(--color-chizuru-600)] font-semibold text-[15px]">
                    {user.displayName[0]}
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-sans font-semibold text-[14px] text-neutral-900 leading-tight truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[11.5px] text-neutral-500 font-mono capitalize">
                    {user.role}
                  </span>
                </div>
                {/* ChevronUp/Down theo trạng thái mở */}
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className={`w-[14px] h-[14px] text-neutral-400 flex-none transition-transform duration-200 ${userDropOpen ? 'rotate-180' : ''}`}
                >
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </button>
            </div>
          ) : (
            /* Not logged in */
            <button
              onClick={() => login('client')}
              className="w-full flex items-center justify-center gap-[8px] h-[48px] rounded-[14px] bg-[var(--color-chizuru-600)] text-white font-sans font-semibold text-[14px] transition-opacity hover:opacity-90 active:opacity-80"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </>
  );
};
