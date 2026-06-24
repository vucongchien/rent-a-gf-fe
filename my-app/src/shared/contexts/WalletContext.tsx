'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;
  frozenBalance: number;
  isLoading: boolean;
  isOpen: boolean; // Trạng thái đóng/mở Wallet Modal
  /** True khi user chưa đăng nhập và cố mở ví → mở AuthRequiredModal */
  isAuthModalOpen: boolean;
  open: () => void;
  close: () => void;
  closeAuthModal: () => void;
  fetchWallet: () => Promise<void>;
  topup: (amountInCoin: number) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [frozenBalance, setFrozenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  /** Mở Wallet Modal — nếu chưa đăng nhập thì mở AuthRequiredModal thay thế */
  const open = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsOpen(true);
    }
  };
  const close = () => setIsOpen(false);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const fetchWallet = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setFrozenBalance(0);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('/api/finance/wallet');
      if (res.ok) {
        const wallet = await res.json();
        setBalance(wallet.availableBalance);
        setFrozenBalance(wallet.frozenBalance);
      }
    } catch (err) {
      console.error('Failed to fetch wallet info', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Tự động tải lại thông tin ví khi user thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWallet();
  }, [fetchWallet]);

  /**
   * Khởi tạo nạp tiền: gọi BFF/BE để lấy paymentUrl (VNPay sandbox/prod hoặc
   * /mock/vnpay/checkout ở mock mode), rồi redirect browser sang đó.
   * KHÔNG credit wallet ở đây — chỉ được credit sau khi user hoàn tất ở VNPay
   * và quay về qua /api/finance/vnpay-return.
   */
  const topup = async (amountInCoin: number): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/finance/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCoin }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { paymentUrl?: string };
      if (!data.paymentUrl) return false;
      window.location.href = data.paymentUrl;
      return true;
    } catch (err) {
      console.error('Failed to topup', err);
      return false;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        frozenBalance,
        isLoading,
        isOpen,
        isAuthModalOpen,
        open,
        close,
        closeAuthModal,
        fetchWallet,
        topup,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
