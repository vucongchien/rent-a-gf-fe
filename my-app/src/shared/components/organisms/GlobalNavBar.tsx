'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavBar, NavItem } from './NavBar';
import {
  CompassIcon,
  HistoryIcon,
  ChatIcon,
  BellIcon,
  HeartIcon,
  CalendarLineIcon,
  CoinIcon,
  BriefcaseIcon,
  CheckLineIcon,
  UserIcon,
  SwitchIcon,
  DashboardIcon,
} from '../atoms/Icons';
import { SearchInput } from '../atoms/SearchInput';
import { WalletButton } from '../atoms/WalletButton';
import { AvatarDropdown } from '../molecules/AvatarDropdown';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useWallet } from '@/shared/contexts/WalletContext';
import { useNotifications } from '@/shared/contexts/NotificationContext';
import type { User } from '@/shared/types';

interface GlobalNavBarPresentationProps {
  user: User | null;
  balance: number;
  unreadCount: number;
}

export const GlobalNavBarPresentation: React.FC<GlobalNavBarPresentationProps> = ({ user, balance, unreadCount }) => {
  const pathname = usePathname();

  /** Phát hiện companion đang ở workspace quản lý */
  const isCompanionMode = pathname.startsWith('/dashboard');
  const isCompanion = user?.role === 'COMPANION';

  // Accent màu vàng khi companion mode, hồng mặc định khi client mode
  const navAccent = isCompanionMode
    ? 'var(--color-mami-600)'   // vàng gold khi ở workspace companion
    : 'var(--color-nav-accent)'; // hồng mặc định khi ở client mode

  // ─── ActiveId ───────────────────────────────────────────────────────────────

  const activeId = useMemo(() => {
    if (isCompanionMode) {
      // Companion workspace: matching theo các route con của /dashboard
      if (pathname === '/dashboard' || pathname === '/dashboard/') return 'cp-overview';
      if (pathname.startsWith('/dashboard/earnings'))  return 'cp-earnings';
      if (pathname.startsWith('/dashboard/chat'))      return 'cp-chat';
      if (pathname.startsWith('/dashboard/notifications')) return 'cp-notifications';
      if (pathname.startsWith('/dashboard/profile'))   return 'cp-profile';
      return 'cp-overview';
    }
    // Client mode: matching route thông thường
    if (pathname.startsWith('/explore'))                             return 'home';
    if (pathname.startsWith('/bookings'))                            return 'bookings';
    if (pathname.startsWith('/chat'))                                return 'chat';
    if (pathname.startsWith('/notifications'))                       return 'notifications';
    if (pathname.startsWith('/me') || pathname.startsWith('/profile')) return 'profile';
    return 'home';
  }, [pathname, isCompanionMode]);

  // ─── Nav Items ──────────────────────────────────────────────────────────────

  /** Danh sách 5 tab khi đang ở Companion Workspace */
  const companionNavItems: NavItem[] = useMemo(() => [
    {
      id: 'cp-overview',
      label: 'Tổng quan',
      icon: <DashboardIcon />,
      href: '/dashboard',
    },
    {
      id: 'cp-earnings',
      label: 'Thu nhập',
      icon: <CoinIcon size={20} />,
      href: '/dashboard/earnings',
    },
    {
      id: 'cp-chat',
      label: 'Chat',
      icon: <ChatIcon />,
      href: '/dashboard/chat',
    },
    {
      id: 'cp-notifications',
      label: 'Thông báo',
      icon: <BellIcon />,
      href: '/dashboard/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'cp-profile',
      label: 'Profile',
      icon: <UserIcon />,
      href: '/dashboard/profile',
    },
  ], [unreadCount]);

  /** Danh sách 5 tab khi ở Client Mode */
  const clientNavItems: NavItem[] = useMemo(() => [
    {
      id: 'home',
      label: 'Explore',
      icon: <CompassIcon />,
      href: '/explore',
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <HistoryIcon />,
      href: '/bookings',
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <ChatIcon />,
      href: '/chat',
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      icon: <BellIcon />,
      href: '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon />,
      href: '/me',
    },
  ], [unreadCount]);

  // ─── Chọn bộ items theo mode ─────────────────────────────────────────────────
  const items = isCompanionMode ? companionNavItems : clientNavItems;

  // ─── Desktop Actions (luôn hiển thị) ─────────────────────────────────────────
  const desktopActions = (
    <>
      <div className="hidden md:block w-[210px] lg:w-64">
        <SearchInput placeholder="Search names, traits..." />
      </div>
      {isCompanion && (
        <Link
          href={isCompanionMode ? '/explore' : '/dashboard'}
          title="Chuyển đổi không gian"
          className="h-9 px-3 gap-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 active:scale-95 text-[13px] font-sans font-medium text-neutral-700 inline-flex items-center justify-center shrink-0 transition-all"
        >
          <SwitchIcon size={16} />
          <span className="hidden sm:inline">Không gian</span>
        </Link>
      )}
      {user && <WalletButton balance={balance} />}
      <AvatarDropdown />
    </>
  );

  const brand = {
    name: 'kanojo',
    node: (
      <div className="w-[30px] h-[30px] rounded-[10px] grid place-items-center bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_4px_10px_-4px_rgba(251,105,153,0.6),inset_0_1px_0_#fff]">
        <HeartIcon fill="#fff" size={16} className="text-white" />
      </div>
    )
  };

  return (
    <NavBar
      items={items}
      activeId={activeId}
      accent={navAccent}
      brand={brand}
      actions={desktopActions}
      scrollHide={false}
    />
  );
};

export const GlobalNavBar: React.FC = () => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  // Admin console có sidebar riêng — không render global navbar
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <GlobalNavBarPresentation
      user={user}
      balance={balance}
      unreadCount={unreadCount}
    />
  );
};

export default GlobalNavBar;


