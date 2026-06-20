'use client';

import React from 'react';
import { SearchInput } from '../atoms/SearchInput';
import { WalletButton } from '../atoms/WalletButton';
import { AvatarDropdown } from './AvatarDropdown';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useWallet } from '@/shared/contexts/WalletContext';
import type { User } from '@/shared/types';

interface DesktopHeaderActionsPresentationProps {
  user: User | null;
  balance: number;
}

export const DesktopHeaderActionsPresentation: React.FC<DesktopHeaderActionsPresentationProps> = ({ user, balance }) => {
  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="hidden sm:block">
        <SearchInput placeholder="Search names, traits..." />
      </div>

      {/* Nút ví hiển thị trên desktop khi đã đăng nhập */}
      {user && <WalletButton user={user} balance={balance} />}

      <AvatarDropdown />
    </div>
  );
};

export const DesktopHeaderActions: React.FC = () => {
  const { user } = useAuth();
  const { balance } = useWallet();

  return (
    <DesktopHeaderActionsPresentation user={user} balance={balance} />
  );
};
