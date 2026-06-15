'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from '../atoms/Button';
import { Avatar } from '../atoms/Avatar';
import { LogOutIcon, CoinIcon, UserIcon } from '../atoms/Icons';
import { useWallet } from '@/shared/contexts/WalletContext';

export interface MobileProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileProfileSheet: React.FC<MobileProfileSheetProps> = ({ isOpen, onClose }) => {
  const { user, logout, login, isLoading } = useAuth();
  const { balance, open: openWalletModal } = useWallet();

  // Đóng khi click escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.15)] flex flex-col p-6 pb-12 transition-transform duration-300 ease-out md:hidden"
      >
        <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 animate-pulse" />
            <div className="w-24 h-4 rounded-md bg-neutral-100 animate-pulse" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
              {/* Optional: Add a large user icon here */}
              <UserIcon size={32} />
            </div>
            <h3 className="font-sans font-bold text-xl text-neutral-900 mb-2">Bạn chưa đăng nhập</h3>
            <p className="font-sans text-sm text-neutral-500 mb-8 max-w-[260px]">
              Đăng nhập để xem thông tin cá nhân, lịch sử đặt và ví của bạn.
            </p>
            <Button
              onClick={() => {
                onClose();
                login('client');
              }}
              className="w-full h-12 rounded-xl bg-neutral-900 text-white font-sans font-bold text-base hover:bg-neutral-800"
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <Avatar src={user.avatarUrl} name={user.displayName} size={64} className="border border-neutral-200" />
              <div>
                <h3 className="font-sans font-bold text-xl text-neutral-900 truncate max-w-[200px]">{user.displayName}</h3>
                <p className="font-mono text-sm text-neutral-500 capitalize">{user.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-4 bg-chizuru-50 rounded-2xl border border-chizuru-100 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => {
                  onClose();
                  openWalletModal();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-chizuru-600 shadow-sm border border-chizuru-100/50">
                    <CoinIcon size={20} />
                  </div>
                  <div>
                    <p className="font-sans text-xs text-neutral-500 font-medium mb-0.5">Số dư ví</p>
                    <p className="font-sans font-bold text-base text-chizuru-600 leading-none">{balance.toLocaleString()} Coin</p>
                  </div>
                </div>
                <Button className="h-8 px-4 rounded-full bg-white text-chizuru-600 border border-chizuru-200 text-sm font-bold shadow-sm">
                  Nạp thêm
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="w-full h-14 justify-start gap-3 px-4 rounded-2xl text-left text-base font-sans text-rose-500 hover:bg-rose-50 border border-transparent font-semibold transition-colors"
                >
                  <LogOutIcon size={20} className="flex-none" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
