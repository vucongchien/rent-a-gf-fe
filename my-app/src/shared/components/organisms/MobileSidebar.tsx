'use client';

import React, { useEffect, useRef } from 'react';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import { SidebarHeader } from '../molecules/SidebarHeader';
import { SidebarNavList } from '../molecules/SidebarNavList';
import { SoonNavList } from '../molecules/SoonNavList';
import { SidebarUserSection } from '../molecules/SidebarUserSection';
import { Divider } from '../atoms/Divider';

export const MobileSidebar: React.FC = () => {
  const { isOpen, close } = useSidebar();
  const panelRef = useRef<HTMLDivElement>(null);

  // Khoá scroll body khi sidebar mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  return (
    <>
      {/* Overlay backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`
          fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Sidebar panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`
          fixed left-0 top-0 bottom-0 z-50
          w-70 bg-surface
          flex flex-col
          shadow-[4px_0_32px_-8px_rgba(0,0,0,0.18)]
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Header ── */}
        <SidebarHeader onClose={close} />

        {/* ── Nav items ── */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {/* Active routes */}
          <SidebarNavList onItemClick={close} />

          {/* Divider */}
          <Divider />

          {/* Placeholder routes */}
          <SoonNavList />
        </nav>

        {/* ── User section (bottom) ── */}
        <SidebarUserSection />
      </div>
    </>
  );
};
