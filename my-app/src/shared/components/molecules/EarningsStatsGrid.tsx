import React from 'react';

interface StatItem {
  label: string;
  value: string;
  hint?: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

interface EarningsStatsGridProps {
  monthIncome: number;
  completedCount: number;
  avgPerBooking: number;
  tipIncome: number;
}

export const EarningsStatsGrid: React.FC<EarningsStatsGridProps> = ({
  monthIncome,
  completedCount,
  avgPerBooking,
  tipIncome,
}) => {
  const items: StatItem[] = [
    {
      label: 'Thu tháng này',
      value: monthIncome.toLocaleString('vi-VN'),
      hint: 'Coin',
      bgClass: 'bg-gradient-to-br from-rose-50 to-pink-50/60',
      textClass: 'text-rose-600',
      borderClass: 'border-rose-100',
    },
    {
      label: 'Booking hoàn thành',
      value: completedCount.toString(),
      hint: 'lượt',
      bgClass: 'bg-gradient-to-br from-emerald-50 to-teal-50/60',
      textClass: 'text-emerald-600',
      borderClass: 'border-emerald-100',
    },
    {
      label: 'TB / booking',
      value: avgPerBooking.toLocaleString('vi-VN'),
      hint: 'Coin',
      bgClass: 'bg-gradient-to-br from-sky-50 to-blue-50/60',
      textClass: 'text-sky-600',
      borderClass: 'border-sky-100',
    },
    {
      label: 'Tip nhận được',
      value: tipIncome.toLocaleString('vi-VN'),
      hint: 'Coin',
      bgClass: 'bg-gradient-to-br from-violet-50 to-purple-50/60',
      textClass: 'text-violet-600',
      borderClass: 'border-violet-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[20px] p-3.5 border ${item.borderClass} ${item.bgClass} shadow-sm`}
        >
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-neutral-500 leading-tight">
            {item.label}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`font-sans font-bold text-[22px] leading-none tracking-tight ${item.textClass}`}>
              {item.value}
            </span>
            {item.hint && (
              <span className="text-[11px] font-medium text-neutral-500">{item.hint}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
