'use client';

import React from 'react';
import { Button } from '../atoms/Button';
import { SpinnerIcon } from '../atoms/Icons';

export interface TopUpFormProps {
  amount: number;
  customAmount: string;
  errorMsg: string | null;
  isSubmitting: boolean;
  vndFormatted: string;
  onQuickSelect: (value: number) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const TopUpForm: React.FC<TopUpFormProps> = ({
  amount,
  customAmount,
  errorMsg,
  isSubmitting,
  vndFormatted,
  onQuickSelect,
  onInputChange,
  onSubmit,
  className = '',
}) => {
  return (
    <form onSubmit={onSubmit} className={`flex flex-col ${className}`}>
      <label className="font-sans font-semibold text-[14px] text-neutral-800 mb-[10px] block">
        Nạp thêm Kano-Coin
      </label>

      {/* Các gói nạp nhanh */}
      <div className="grid grid-cols-4 gap-[8px] mb-[14px]">
        {[100, 200, 500, 1000].map((val) => (
          <Button
            key={val}
            type="button"
            variant="quick-select"
            isActive={amount === val}
            activeBorderColor="var(--color-chizuru-600)"
            onClick={() => onQuickSelect(val)}
          >
            +{val}
          </Button>
        ))}
      </div>

      {/* Ô tự nhập số lượng */}
      <div className="relative mb-[6px]">
        <input
          type="number"
          placeholder="Nhập số coin cần nạp"
          value={customAmount}
          onChange={onInputChange}
          className={`
            w-full h-[46px] pl-[14px] pr-[100px] border rounded-[12px] font-sans font-semibold text-[15px]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-chizuru-600)] transition-all
            ${errorMsg ? 'border-rose-400 bg-rose-50/30' : 'border-neutral-200'}
          `}
        />
        <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[12.5px] font-mono text-neutral-400 uppercase tracking-wider">
          Kano-Coin
        </span>
      </div>

      {/* Error validation */}
      {errorMsg && (
        <span className="text-[12px] text-rose-500 font-sans block mb-[10px] px-1">
          ⚠ {errorMsg}
        </span>
      )}

      {/* Quy đổi VNĐ hiển thị động */}
      {!errorMsg && amount > 0 && (
        <div className="text-[13px] text-neutral-500 mb-[18px] px-1">
          Giá thanh toán tương ứng: <span className="font-bold text-neutral-800 font-sans">{vndFormatted}</span>
        </div>
      )}

      {/* Button Submit */}
      <Button
        type="submit"
        variant="primary"
        disabled={amount < 100 || isSubmitting}
        className="w-full h-[50px] rounded-[12px] font-semibold text-[15px] mt-[8px]"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-[8px]">
            <SpinnerIcon size={20} className="text-current animate-spin" />
            Đang kết nối cổng thanh toán an toàn...
          </span>
        ) : (
          `Nạp tiền (${vndFormatted}) →`
        )}
      </Button>
    </form>
  );
};

TopUpForm.displayName = 'TopUpForm';
