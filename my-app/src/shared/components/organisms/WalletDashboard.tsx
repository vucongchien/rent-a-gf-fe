'use client';

import React from 'react';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';

export interface WalletDashboardProps {
  balance: number;
  frozenBalance: number;
  className?: string;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  balance,
  frozenBalance,
  className = '',
}) => {
  // Hiệu ứng số chạy cho số dư khả dụng
  const animatedBalance = useAnimatedNumber(balance);

  return (
    <div className={`bg-gradient-to-br from-chizuru-50/70 to-pink-50/50 border border-neutral-200 rounded-[20px] p-[18px] shadow-sm ${className}`}>
      <span className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-neutral-500 block">
        Số dư khả dụng
      </span>
      
      <div className="flex items-baseline gap-[6px] mt-[6px] mb-[4px]">
        {/* Số dư chạy animation */}
        <span className="font-sans font-bold text-[36px] tracking-tight leading-none text-neutral-900">
          {animatedBalance.toLocaleString('vi-VN')}
        </span>
        <span className="text-[18px] font-semibold text-neutral-500">Kano-Coin</span>
      </div>
      
      {frozenBalance > 0 && (
        <div className="text-[12.5px] text-neutral-500 border-t border-neutral-200/50 pt-[10px] mt-[10px] flex items-center justify-between">
          <span>Tạm đóng băng (Lịch hẹn đang giữ)</span>
          <span className="font-semibold font-mono text-neutral-700">-{frozenBalance} Coin</span>
        </div>
      )}
    </div>
  );
};

WalletDashboard.displayName = 'WalletDashboard';
