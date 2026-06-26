'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export const TOPUP_RETURN_TO_KEY = 'rentagf.topup.returnTo';

export type TopupResult =
  | { ok: true }
  | { ok: false; reason: 'auth' | 'payment' | 'network'; message?: string };

interface WalletContextType {
  balance: number;
  frozenBalance: number;
  topupSuccess: { amount: number } | null;
  isLoading: boolean;
  isOpen: boolean; // Trạng thái đóng/mở Wallet Modal
  /** True khi user chưa đăng nhập và cố mở ví → mở AuthRequiredModal */
  isAuthModalOpen: boolean;
  open: () => void;
  close: () => void;
  closeAuthModal: () => void;
  showTopupSuccess: (amount: number) => void;
  clearTopupSuccess: () => void;
  fetchWallet: () => Promise<void>;
  topup: (amountInCoin: number) => Promise<TopupResult>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, refreshSession } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [frozenBalance, setFrozenBalance] = useState<number>(0);
  const [topupSuccess, setTopupSuccess] = useState<{ amount: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  /** Mở Wallet Modal — nếu chưa đăng nhập thì mở AuthRequiredModal thay thế */
  const open = useCallback(() => {
    setTopupSuccess(null);
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsOpen(true);
    }
  }, [user]);
  const close = useCallback(() => {
    setIsOpen(false);
    setTopupSuccess(null);
  }, []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const showTopupSuccess = useCallback((amount: number) => {
    setTopupSuccess({ amount });
    setIsOpen(true);
  }, []);
  const clearTopupSuccess = useCallback(() => setTopupSuccess(null), []);

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
  const topup = async (amountInCoin: number): Promise<TopupResult> => {
    if (!user) {
      setIsAuthModalOpen(true);
      return { ok: false, reason: 'auth', message: 'Bạn cần đăng nhập lại để nạp tiền.' };
    }

    const requestTopup = async () => {
      const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return fetch('/api/finance/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({ amount: amountInCoin }),
      });
    };

    try {
      let res = await requestTopup();

      if (res.status === 401) {
        // BE revoke access_token nhưng middleware không kịp refresh (token còn hạn
        // theo exp). Force rotation qua POST /api/auth/refresh rồi retry 1 lần.
        const rotated = await refreshSession();
        if (rotated) {
          res = await requestTopup();
        }
      }

      if (res.status === 401) {
        setIsAuthModalOpen(true);
        return {
          ok: false,
          reason: 'auth',
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại rồi thử nạp tiền.',
        };
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { message?: string } | null;
        return {
          ok: false,
          reason: 'payment',
          message: payload?.message ?? 'Không khởi tạo được giao dịch nạp tiền. Vui lòng thử lại.',
        };
      }

      const data = (await res.json()) as { paymentUrl?: string };
      if (!data.paymentUrl) {
        return { ok: false, reason: 'payment', message: 'Cổng thanh toán chưa trả về đường dẫn VNPay.' };
      }
      sessionStorage.setItem(
        TOPUP_RETURN_TO_KEY,
        `${window.location.pathname}${window.location.search}${window.location.hash}`,
      );
      window.location.href = data.paymentUrl;
      return { ok: true };
    } catch (err) {
      console.error('Failed to topup', err);
      return { ok: false, reason: 'network', message: 'Có lỗi mạng xảy ra. Vui lòng thử lại.' };
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        frozenBalance,
        topupSuccess,
        isLoading,
        isOpen,
        isAuthModalOpen,
        open,
        close,
        closeAuthModal,
        showTopupSuccess,
        clearTopupSuccess,
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
