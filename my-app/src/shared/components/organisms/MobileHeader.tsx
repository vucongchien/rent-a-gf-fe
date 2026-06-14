'use client';

import React, { useState } from 'react';
import { MobileHeaderDefault } from '../molecules/MobileHeaderDefault';
import { MobileSearchOverlay } from '../molecules/MobileSearchOverlay';

export const MobileHeader: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="md:hidden w-full relative h-[52px] flex items-center overflow-hidden">
      {/* Giao diện mặc định */}
      <MobileHeaderDefault onSearchTrigger={() => setSearchOpen(true)} />

      {/* Giao diện Search mở rộng inline phủ lên */}
      <MobileSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};
