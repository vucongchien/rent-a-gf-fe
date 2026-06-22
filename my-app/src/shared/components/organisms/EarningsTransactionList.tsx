'use client';

import React, { useMemo, useState } from 'react';
import type { WalletTransaction } from '@/shared/types';
import { TransactionListItem } from '../molecules/TransactionListItem';

interface EarningsTransactionListProps {
  transactions: WalletTransaction[];
}

type Range = '7d' | '30d' | 'all';

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: 'all', label: 'Tất cả' },
];

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Hôm nay';
  if (sameDay(d, yesterday)) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const EarningsTransactionList: React.FC<EarningsTransactionListProps> = ({
  transactions,
}) => {
  const [range, setRange] = useState<Range>('30d');

  const filtered = useMemo(() => {
    if (range === 'all') return transactions;
    const days = range === '7d' ? 7 : 30;
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
    return transactions.filter((tx) => new Date(tx.createdAt).getTime() >= threshold);
  }, [transactions, range]);

  const grouped = useMemo(() => {
    const map = new Map<string, WalletTransaction[]>();
    [...filtered]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach((tx) => {
        const key = formatDayLabel(tx.createdAt);
        const list = map.get(key) ?? [];
        list.push(tx);
        map.set(key, list);
      });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-sans font-bold text-[15px] text-neutral-900">Lịch sử giao dịch</h2>
        <span className="font-mono text-[10.5px] text-neutral-400 uppercase tracking-[0.12em]">
          {filtered.length} mục
        </span>
      </div>

      {/* Range tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100/70 rounded-full border border-neutral-200/70 w-fit">
        {RANGE_OPTIONS.map((opt) => {
          const active = opt.value === range;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1 rounded-full text-[11.5px] font-sans font-semibold transition-all ${
                active
                  ? 'bg-white text-amber-700 shadow-sm border border-amber-100'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-200 rounded-[20px] py-10 px-4 text-center">
          <p className="text-3xl">📭</p>
          <p className="font-sans font-semibold text-neutral-700 text-[14px] mt-2">
            Chưa có giao dịch
          </p>
          <p className="font-sans text-[12px] text-neutral-500 mt-1">
            Khoảng thời gian này chưa ghi nhận giao dịch nào.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([day, txs]) => (
            <div key={day} className="space-y-2">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.15em] text-neutral-400 px-1">
                {day}
              </p>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <TransactionListItem key={tx.transactionId} tx={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
