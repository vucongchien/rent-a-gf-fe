'use client';

import React from 'react';
import { Button } from '../atoms/Button';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';

export interface TopUpSuccessProps {
  amount: number;
  balance: number;
  onClose: () => void;
  className?: string;
}

export const TopUpSuccess: React.FC<TopUpSuccessProps> = ({
  amount,
  balance,
  onClose,
  className = '',
}) => {
  const animatedBalance = useAnimatedNumber(balance);

  return (
    <div className={`flex flex-col items-center text-center py-[20px] animate-fade-in ${className}`}>
      <div className="w-[64px] h-[64px] rounded-full bg-emerald-50 border-[2px] border-emerald-500 flex items-center justify-center text-emerald-500 text-[32px] mb-[18px]">
        ✓
      </div>
      <h3 className="font-sans font-semibold text-[22px] text-neutral-950 mb-[8px]">
        Nạp tiền thành công!
      </h3>
      <p className="text-[14px] text-neutral-500 max-w-[320px] mb-[24px]">
        Bạn đã nạp thành công <span className="font-semibold text-neutral-800">+{amount.toLocaleString('vi-VN')} Kano-Coin</span> vào ví.
      </p>
      
      {/* Box hiển thị số dư mới cập nhật */}
      <div className="w-full bg-neutral-50 border border-neutral-200 rounded-[16px] p-[16px] mb-[28px] flex justify-between items-center text-left">
        <span className="text-[14px] text-neutral-500">Số dư hiện tại</span>
        <span className="font-sans font-bold text-[20px] text-[var(--color-chizuru-600)]">
          {animatedBalance.toLocaleString('vi-VN')} Coin
        </span>
      </div>

      <Button
        variant="primary"
        onClick={onClose}
        className="w-full h-[48px] rounded-[12px] font-semibold text-[15px]"
      >
        Hoàn tất
      </Button>
    </div>
  );
};

TopUpSuccess.displayName = 'TopUpSuccess';
