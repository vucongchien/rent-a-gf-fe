import React from 'react';
import type { WalletTransaction } from '@/shared/types';
import { TrendingUpIcon, CoinIcon } from '../atoms/Icons';

interface TransactionListItemProps {
  tx: WalletTransaction;
}

const statusStyle: Record<WalletTransaction['status'], { label: string; className: string }> = {
  SUCCESS: {
    label: 'Hoàn tất',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PENDING: {
    label: 'Đang chờ',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  FAILED: {
    label: 'Thất bại',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const TransactionListItem: React.FC<TransactionListItemProps> = ({ tx }) => {
  const isCredit = tx.type === 'CREDIT';
  const status = statusStyle[tx.status];

  const time = new Date(tx.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white border border-neutral-100 rounded-[20px] p-3.5 flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
            isCredit
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-rose-50 border-rose-100 text-rose-500'
          }`}
        >
          {isCredit ? (
            <TrendingUpIcon size={16} className="stroke-emerald-600" />
          ) : (
            <CoinIcon size={16} className="text-rose-500" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-sans font-bold text-[13px] text-neutral-900 leading-tight truncate">
            {tx.description || (isCredit ? 'Nạp tiền' : 'Giao dịch')}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${status.className}`}
            >
              {status.label}
            </span>
            <span className="font-mono text-[10px] text-neutral-400">{time}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span
          className={`font-sans font-bold text-[14px] tracking-tight ${
            isCredit ? 'text-emerald-600' : 'text-neutral-800'
          }`}
        >
          {isCredit ? '+' : ''}
          {tx.amount.toLocaleString('vi-VN')}
        </span>
        <span className="text-[10.5px] text-neutral-500 font-medium ml-1">Coin</span>
      </div>
    </div>
  );
};
