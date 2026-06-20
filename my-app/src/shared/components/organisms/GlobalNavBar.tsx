'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { NavBar, NavItem } from './NavBar';
import { CompassIcon, HistoryIcon, ChatIcon, BellIcon, UserIcon, HeartIcon } from '../atoms/Icons';
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

  const activeId = useMemo(() => {
    if (pathname.startsWith('/explore')) return 'home';
    if (pathname.startsWith('/bookings')) return 'bookings';
    if (pathname.startsWith('/chat')) return 'chat';
    if (pathname.startsWith('/notifications')) return 'notifications';
    if (pathname.startsWith('/me') || pathname.startsWith('/profile')) return 'profile';
    return 'home';
  }, [pathname]);

  const items: NavItem[] = useMemo(() => [
    {
      id: 'home',
      label: 'Explore',
      icon: <CompassIcon />,
      href: '/explore'
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <HistoryIcon />,
      href: '/bookings'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <ChatIcon />,
      href: '/chat'
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      icon: <BellIcon />,
      href: '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon />,
      href: '/me'
    }
  ], [unreadCount]);
// ... (phần còn lại của file giữ nguyên)
  const desktopActions = (
    <>
      <div className="hidden md:block w-[210px] lg:w-64">
        <SearchInput placeholder="Search names, traits..." />
      </div>
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
      brand={brand}
      actions={desktopActions}
    />
  );
};

export const GlobalNavBar: React.FC = () => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useNotifications();

  return (
    <GlobalNavBarPresentation
      user={user}
      balance={balance}
      unreadCount={unreadCount}
    />
  );
};

export default GlobalNavBar;
