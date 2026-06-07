import React from 'react';
import {
  ChatIcon,
  HistoryIcon,
} from '../atoms/Icons';

const NAV_ITEMS = [
  { href: '#',            label: 'Chat',        icon: ChatIcon,       live: false },
  { href: '#',            label: 'Lịch sử đặt', icon: HistoryIcon,   live: false },
];

export const SoonNavList: React.FC = () => {
  return (
    <>
      <p className="px-3 text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-400 mb-1">
        Sắp ra mắt
      </p>
      {NAV_ITEMS.map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 cursor-not-allowed select-none"
        >
          <Icon size={18} />
          <span className="font-sans text-sm font-medium">{label}</span>
          <span className="ml-auto text-[10px] font-mono bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded-full">soon</span>
        </div>
      ))}
    </>
  );
};
