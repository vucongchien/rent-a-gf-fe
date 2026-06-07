'use client';

import React from 'react';
import { MobileHeader } from './MobileHeader';
import { DesktopHeader } from './DesktopHeader';

export const SiteHeader: React.FC = () => {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
};
