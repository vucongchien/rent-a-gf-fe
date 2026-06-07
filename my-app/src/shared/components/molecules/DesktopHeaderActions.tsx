'use client';

import React from 'react';
import { SearchInput } from '../atoms/SearchInput';
import { WalletButton } from '../atoms/WalletButton';
import { AvatarDropdown } from './AvatarDropdown';
import { useAuth } from '@/shared/contexts/AuthContext';

export const DesktopHeaderActions: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="hidden sm:block">
        <SearchInput placeholder="Search names, traits..." />
      </div>

      {/* Nút ví hiển thị trên desktop khi đã đăng nhập */}
      {user && <WalletButton />}

      <AvatarDropdown />
    </div>
  );
};
