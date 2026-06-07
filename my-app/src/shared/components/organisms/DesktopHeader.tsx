import React from 'react';
import { HeartIcon } from '../atoms/Icons';
import { DesktopNav } from '../molecules/DesktopNav';
import { DesktopHeaderActions } from '../molecules/DesktopHeaderActions';

export const DesktopHeader: React.FC = () => {
  return (
    <header className="hidden md:flex items-center gap-[18px] mb-[34px] flex-wrap md:flex-nowrap">
      {/* Brand */}
      <div className="flex items-center gap-[11px] font-semibold">
        <div className="w-[40px] h-[40px] rounded-[13px] grid place-items-center bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_6px_16px_-8px_rgba(251,105,153,0.6),inset_0_1px_0_#fff]">
          <HeartIcon fill="#fff" size={22} className="text-white" />
        </div>
        <span className="font-sans text-[23px] tracking-[-0.02em] font-semibold">
          <em className="not-italic italic text-chizuru-600">kanojo</em>
        </span>
      </div>

      {/* Navigation */}
      <DesktopNav />

      {/* Right actions: search + wallet + avatar dropdown */}
      <DesktopHeaderActions />
    </header>
  );
};
