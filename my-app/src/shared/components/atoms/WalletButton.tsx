'use client';

import React from 'react';
import { useWallet } from '@/shared/contexts/WalletContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';
import { Button } from './Button';
import { CoinIcon } from './Icons';
import type { User } from '@/shared/types';

export interface WalletButtonProps {
  user?: User | null;
  balance?: number;
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ user: propUser, balance: propBalance, className = '' }) => {
  const authContext = useAuth();
  const walletContext = useWallet();

  const user = propUser !== undefined ? propUser : authContext.user;
  const balance = propBalance !== undefined ? propBalance : walletContext.balance;

  const { open: openWallet } = useWallet();
  const animatedBalance = useAnimatedNumber(balance);

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      onClick={openWallet}
      aria-label="Ví cá nhân"
      className={`h-9 px-3 rounded-md bg-chizuru-50 hover:bg-chizuru-100 text-chizuru-600 font-sans font-bold text-sm border border-chizuru-100 flex items-center gap-1.5 transition-all shrink-0 shadow-none select-none cursor-pointer hover:border-chizuru-200 ${className}`}
    >
      <CoinIcon size={16} className="text-chizuru-600 fill-chizuru-100" />
      <span>{animatedBalance.toLocaleString('vi-VN')}</span>
      <span className="text-[10px] uppercase font-mono tracking-wider opacity-85 hidden sm:inline-block">Coin</span>
    </Button>
  );
};
