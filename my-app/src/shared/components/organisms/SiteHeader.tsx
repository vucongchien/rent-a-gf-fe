'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SearchInput } from '../atoms/SearchInput';
import { MenuIcon, SearchIcon, BellIcon } from '../atoms/Icons';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useWallet } from '@/shared/contexts/WalletContext';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';

// -------------------------------------------------------------------
// AvatarDropdown — desktop: avatar + dropdown logout
// -------------------------------------------------------------------
const AvatarDropdown: React.FC = () => {
  const { user, logout, login, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isLoading) {
    return <div className="w-[36px] h-[36px] rounded-full bg-neutral-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        onClick={() => login('client')}
        className="h-[36px] px-[14px] rounded-[10px] bg-neutral-900 text-white font-sans font-semibold text-[13.5px] hover:opacity-90 transition-opacity"
      >
        Sign in
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        className="relative w-[36px] h-[36px] rounded-full overflow-hidden border-[2px] border-neutral-200 hover:border-[var(--color-chizuru-600)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-chizuru-600)]"
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.displayName} fill className="object-cover" sizes="36px" />
        ) : (
          <div className="w-full h-full bg-chizuru-100 flex items-center justify-center text-[var(--color-chizuru-600)] font-semibold text-[14px]">
            {user.displayName[0]}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-white border border-neutral-200 rounded-[14px] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] py-[6px] z-50">
          {/* User info */}
          <div className="px-[14px] py-[10px] border-b border-neutral-100">
            <p className="font-sans font-semibold text-[13.5px] text-neutral-900 truncate">{user.displayName}</p>
            <p className="font-mono text-[11px] text-neutral-500 capitalize mt-[1px]">{user.role}</p>
          </div>
          {/* Actions */}
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-[10px] px-[14px] py-[9px] text-left text-[13.5px] font-sans text-rose-500 hover:bg-rose-50 transition-colors duration-150"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-[15px] h-[15px] flex-none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// MobileHeader — chỉ hiển thị trên < md
// Layout: [≡] [    space    ] [🔍] [🔔]
// -------------------------------------------------------------------
const MobileHeader: React.FC = () => {
  const { toggle } = useSidebar();
  const { user } = useAuth();
  const { balance, open: openWallet } = useWallet();
  const [searchOpen, setSearchOpen] = useState(false);

  const animatedBalance = useAnimatedNumber(balance);

  return (
    <header className="md:hidden">
      {/* Row chính */}
      <div className="flex items-center gap-[8px] h-[52px]">
        {/* Hamburger */}
        <button
          onClick={toggle}
          aria-label="Open menu"
          className="w-[40px] h-[40px] flex items-center justify-center rounded-[12px] text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-150 flex-none"
        >
          <MenuIcon size={20} />
        </button>

        {/* Space giữa */}
        <div className="flex-1" />

        {/* Nút ví hiển thị trên mobile khi đã đăng nhập */}
        {user && (
          <button
            onClick={openWallet}
            aria-label="Ví cá nhân"
            className="h-[36px] px-[10px] rounded-[10px] bg-chizuru-50 hover:bg-chizuru-100 text-[var(--color-chizuru-600)] font-sans font-bold text-[12.5px] border border-chizuru-100 flex items-center gap-[4px] transition-colors shrink-0"
          >
            <span>💰</span>
            <span>{animatedBalance.toLocaleString('vi-VN')}</span>
          </button>
        )}

        {/* Search icon */}
        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search"
          aria-expanded={searchOpen}
          className="w-[40px] h-[40px] flex items-center justify-center rounded-[12px] text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-150 flex-none"
        >
          <SearchIcon size={18} />
        </button>

        {/* Bell / Notification */}
        <button
          aria-label="Notifications"
          className="relative w-[40px] h-[40px] flex items-center justify-center rounded-[12px] text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-150 flex-none"
        >
          <BellIcon size={18} />
          <span className="absolute top-[9px] right-[9px] w-[6px] h-[6px] rounded-full bg-[var(--color-chizuru-600)]" aria-hidden="true" />
        </button>
      </div>

      {/* Search expand row */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          searchOpen ? 'max-h-[60px] opacity-100 pb-[8px]' : 'max-h-0 opacity-0'
        }`}
      >
        <SearchInput
          placeholder="Tìm tên, sở thích, địa điểm..."
          className="w-full"
          autoFocus={searchOpen}
        />
      </div>
    </header>
  );
};

// -------------------------------------------------------------------
// DesktopHeader — md+, thay LoginButton bằng AvatarDropdown
// -------------------------------------------------------------------
const DesktopHeader: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { balance, open: openWallet } = useWallet();

  const animatedBalance = useAnimatedNumber(balance);

  return (
    <header className="hidden md:flex items-center gap-[18px] mb-[34px] flex-wrap md:flex-nowrap">
      {/* Brand */}
      <div className="flex items-center gap-[11px] font-semibold">
        <div className="w-[40px] h-[40px] rounded-[13px] grid place-items-center bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_6px_16px_-8px_rgba(251,105,153,0.6),inset_0_1px_0_#fff]">
          <svg viewBox="0 0 24 24" fill="#fff" className="w-[22px] h-[22px]">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <span className="font-sans text-[23px] tracking-[-0.02em] font-semibold">
          <em className="not-italic italic text-[var(--color-chizuru-600)]">kanojo</em>
        </span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex gap-[2px] ml-[10px]">
        {['Explore', 'Companions', 'Sounds'].map((label) => {
          const isActive = pathname === '/' + label.toLowerCase() || (label === 'Explore' && pathname === '/explore');
          return (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              className={`
                text-[14px] font-medium px-[13px] py-[8px] rounded-[10px] transition-all duration-180
                ${isActive
                  ? 'text-neutral-900 bg-white shadow-[0_1px_0_var(--color-border)]'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
                }
              `}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right actions: search + wallet + avatar dropdown */}
      <div className="ml-auto flex items-center gap-[12px]">
        <div className="hidden sm:block">
          <SearchInput placeholder="Search names, traits..." />
        </div>

        {/* Nút ví hiển thị trên desktop khi đã đăng nhập */}
        {user && (
          <button
            onClick={openWallet}
            className="h-[36px] px-[14px] rounded-[10px] bg-chizuru-50 hover:bg-chizuru-100 text-[var(--color-chizuru-600)] font-sans font-bold text-[13px] border border-chizuru-100 hover:border-chizuru-200 flex items-center gap-[6px] transition-all cursor-pointer shrink-0"
          >
            <span>💰</span>
            <span>{animatedBalance.toLocaleString('vi-VN')} Coin</span>
          </button>
        )}

        <AvatarDropdown />
      </div>
    </header>
  );
};

// -------------------------------------------------------------------
// SiteHeader — composes mobile + desktop
// -------------------------------------------------------------------
export const SiteHeader: React.FC = () => {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
};
