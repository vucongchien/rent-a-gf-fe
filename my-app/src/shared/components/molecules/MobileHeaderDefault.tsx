import React from 'react';
import { MenuIcon, SearchIcon } from '../atoms/Icons';
import { Button } from '../atoms/Button';
import { WalletButton } from '../atoms/WalletButton';
import { NotificationButton } from '../atoms/NotificationButton';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface MobileHeaderDefaultProps {
  onSearchTrigger: () => void;
}

export const MobileHeaderDefault: React.FC<MobileHeaderDefaultProps> = ({ onSearchTrigger }) => {
  const { toggle } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-2 w-full h-full">
      {/* Hamburger */}
      <Button
        variant="ghost"
        onClick={toggle}
        aria-label="Open menu"
        className="w-10 h-10 p-0 rounded-xl flex items-center justify-center border-none shadow-none text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200"
      >
        <MenuIcon size={20} />
      </Button>

      {/* Space giữa */}
      <div className="flex-1" />

      {/* Nút ví hiển thị trên mobile khi đã đăng nhập */}
      {user && <WalletButton />}

      {/* Search icon trigger */}
      <Button
        variant="ghost"
        onClick={onSearchTrigger}
        aria-label="Search"
        className="w-10 h-10 p-0 rounded-xl flex items-center justify-center border-none shadow-none text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200"
      >
        <SearchIcon size={18} />
      </Button>

      {/* Bell / Notification */}
      <NotificationButton />
    </div>
  );
};
