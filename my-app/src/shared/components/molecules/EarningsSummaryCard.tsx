'use client';

import React from 'react';
import { CoinIcon, TrendingUpIcon } from '../atoms/Icons';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';

interface EarningsSummaryCardProps {
  availableBalance: number;
  frozenBalance: number;
  weeklyDelta?: number;
}

export const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  availableBalance,
  frozenBalance,
  weeklyDelta = 0,
}) => {
  const animatedAvailable = useAnimatedNumber(availableBalance);

  return (
    <div className="w-full bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 border border-amber-200/60 rounded-[20px] p-[18px] shadow-sm relative overflow-hidden select-none">
      {/* Soft decorative blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-neutral-500">
            Thu nhập khả dụng
          </span>
          <div className="w-7 h-7 rounded-full bg-white/80 border border-amber-100 flex items-center justify-center shadow-sm">
            <CoinIcon size={14} className="text-amber-500" />
          </div>
        </div>

        <div className="flex items-baseline gap-[6px] mt-[8px] mb-[4px]">
          <span className="font-sans font-bold text-[36px] tracking-tight leading-none text-neutral-900">
            {animatedAvailable.toLocaleString('vi-VN')}
          </span>
          <span className="text-[16px] font-semibold text-neutral-500">Coin</span>
        </div>

        {weeklyDelta !== 0 && (
          <div className="text-[12px] text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUpIcon size={14} className="stroke-emerald-700" />
            <span>
              {weeklyDelta > 0 ? '+' : ''}
              {weeklyDelta.toLocaleString('vi-VN')} Coin tuần này
            </span>
          </div>
        )}

        {/* Frozen balance row */}
        <div className="border-t border-amber-200/50 pt-[10px] mt-[12px] flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-neutral-500">
            Đang chờ giải ngân
          </span>
          <span className="font-sans font-bold text-[13px] text-neutral-700">
            {frozenBalance.toLocaleString('vi-VN')}{' '}
            <span className="text-neutral-500 font-medium">Coin</span>
          </span>
        </div>
      </div>
    </div>
  );
};
