'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;
  frozenBalance: number;
  isLoading: boolean;
  isOpen: boolean; // Trạng thái đóng/mở Wallet Modal
  open: () => void;
  close: () => void;
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

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const fetchWallet = async () => {
    if (!user) {
      setBalance(0);
      setFrozenBalance(0);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const { data } = await res.json();
        setBalance(data.balance);
        setFrozenBalance(data.frozenBalance);
      }
    } catch (err) {
      console.error('Failed to fetch wallet info', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động tải lại thông tin ví khi user thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    fetchWallet();
  }, [user]);

  const topup = async (amountInCoin: number): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/wallet/topup/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountInCoin }),
      });
      if (res.ok) {
        // Mock server đã tự động cộng tiền và ghi nhận
        // Chúng ta fetch lại ví mới nhất để đồng bộ số dư
        await fetchWallet();
        return true;
      }
      return false;
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
        open,
        close,
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
