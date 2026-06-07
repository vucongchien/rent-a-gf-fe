'use client';

import React from 'react';
import { useWallet } from '@/shared/contexts/WalletContext';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';
import { Button } from './Button';
import { CoinIcon } from './Icons';

export interface WalletButtonProps {
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ className = '' }) => {
  const { balance, open: openWallet } = useWallet();
  const animatedBalance = useAnimatedNumber(balance);

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
