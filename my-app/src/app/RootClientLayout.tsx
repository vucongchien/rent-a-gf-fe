'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { WalletProvider } from '@/shared/contexts/WalletContext';
import { ToastProvider } from '@/shared/components/atoms/ToastNotification';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';
import { WalletModal } from '@/shared/components/organisms/WalletModal';
import { GlobalNavBar } from '@/shared/components/organisms/GlobalNavBar';

export function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <ToastProvider>
          <NotificationProvider>
            <WalletModal />
            <Suspense fallback={null}>
              <GlobalNavBar />
            </Suspense>
            <Suspense fallback={null}>
              <div className="flex-1 pb-24 md:pb-0 flex flex-col">
                {children}
              </div>
            </Suspense>
          </NotificationProvider>
        </ToastProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

export default RootClientLayout;