'use client';

import React from 'react';
import { TrendingUpIcon } from '../atoms/Icons';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';

interface EarningsCardProps {
  balance: number;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({ balance }) => {
  // Hiệu ứng số chạy cho số dư khả dụng
  const animatedBalance = useAnimatedNumber(balance);

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-neutral-200 rounded-[20px] p-[18px] shadow-sm relative overflow-hidden select-none">
      <span className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-neutral-500 block">
        Thu nhập khả dụng
      </span>
      
      <div className="flex items-baseline gap-[6px] mt-[6px] mb-[4px]">
        {/* Số dư chạy animation */}
        <span className="font-sans font-bold text-[36px] tracking-tight leading-none text-neutral-900">
          {animatedBalance.toLocaleString('vi-VN')}
        </span>
        <span className="text-[18px] font-semibold text-neutral-500">Coin</span>
      </div>
      
      <div className="text-[12.5px] text-emerald-800 border-t border-neutral-200/50 pt-[10px] mt-[10px] flex items-center justify-between">
        <span>+150 Coin tuần này</span>
        <TrendingUpIcon size={16} className="stroke-emerald-700" />
      </div>
    </div>
  );
};

