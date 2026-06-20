'use client';

import React, { Suspense } from 'react';
import { MockProvider } from '@/mocks/components/MockProvider';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { WalletProvider } from '@/shared/contexts/WalletContext';
import { ToastProvider } from '@/shared/components/atoms/ToastNotification';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';
import { WalletModal } from '@/shared/components/organisms/WalletModal';
import { GlobalNavBar } from '@/shared/components/organisms/GlobalNavBar';

export function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <MockProvider>
      <AuthProvider>
        <WalletProvider>
          <ToastProvider>
            <NotificationProvider>
              <WalletModal />
              <Suspense fallback={null}>
                <GlobalNavBar />
              </Suspense>
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </NotificationProvider>
          </ToastProvider>
        </WalletProvider>
      </AuthProvider>
    </MockProvider>
  );
}

export default RootClientLayout;