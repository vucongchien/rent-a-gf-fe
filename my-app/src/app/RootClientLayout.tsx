'use client';

import React from 'react';
import { MockProvider } from '@/mocks/components/MockProvider';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { WalletProvider } from '@/shared/contexts/WalletContext';
import { SidebarProvider } from '@/shared/contexts/SidebarContext';
import { MobileSidebar } from '@/shared/components/organisms/MobileSidebar';
import { WalletModal } from '@/shared/components/organisms/WalletModal';
import { SiteHeader } from '@/shared/components/organisms/SiteHeader';
import type { User } from '@/shared/types';

interface RootClientLayoutProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function RootClientLayout({ children, initialUser }: RootClientLayoutProps) {
  return (
    <MockProvider>
      <AuthProvider initialUser={initialUser}>
        <WalletProvider>
          <SidebarProvider>
            <WalletModal />
            {children}
          </SidebarProvider>
        </WalletProvider>
      </AuthProvider>
    </MockProvider>
  );
}

export default RootClientLayout;
