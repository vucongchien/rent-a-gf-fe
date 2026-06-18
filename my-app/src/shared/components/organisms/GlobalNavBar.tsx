'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { NavBar, NavItem } from './NavBar';
import { CompassIcon, HistoryIcon, ChatIcon, BellIcon, UserIcon, HeartIcon } from '../atoms/Icons';
import { SearchInput } from '../atoms/SearchInput';
import { WalletButton } from '../atoms/WalletButton';
import { AvatarDropdown } from '../molecules/AvatarDropdown';
import { useAuth } from '@/shared/contexts/AuthContext';

export const GlobalNavBar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Xác định active tab dựa trên pathname
  const activeId = useMemo(() => {
    if (pathname.startsWith('/explore')) return 'home';
    if (pathname.startsWith('/bookings')) return 'bookings';
    if (pathname.startsWith('/chat')) return 'chat';
    if (pathname.startsWith('/notifications')) return 'notifications';
    if (pathname.startsWith('/me') || pathname.startsWith('/profile')) return 'profile';
    return 'home'; // default
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
      href: '/notifications'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon />,
      href: '/me'
    }
  ], []);

  const desktopActions = (
    <>
      <div className="hidden md:block w-48 lg:w-64">
        <SearchInput placeholder="Search names, traits..." />
      </div>
      {user && <WalletButton />}
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
