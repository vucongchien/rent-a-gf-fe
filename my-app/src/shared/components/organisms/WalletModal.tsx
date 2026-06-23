'use client';

import React, { useEffect, useRef } from 'react';
import { useWallet } from '@/shared/contexts/WalletContext';
import { CloseButton } from '../atoms/CloseButton';
import { useTopUpForm } from './useTopUpForm';
import { WalletDashboard } from './WalletDashboard';
import { TopUpForm } from './TopUpForm';
import { TopUpSuccess } from './TopUpSuccess';
import { AuthRequiredModal } from '../molecules/AuthRequiredModal';

export const WalletModal: React.FC = () => {
  const { isOpen, close, balance, frozenBalance, topup, isAuthModalOpen, closeAuthModal } = useWallet();
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const form = useTopUpForm({ topup });

  // Điều khiển đóng mở dialog native
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        // Reset success state khi mở modal
        form.setShowSuccess(false);
        form.handleQuickSelect(200); // Khôi phục gói nạp mặc định
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Đóng modal khi click ra ngoài vùng dialog (click backdrop)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      close();
    }
  };

  // Lắng nghe sự kiện close của native dialog (ví dụ nhấn ESC)
  const handleNativeClose = () => {
    close();
  };

  return (
    <>
      {/* AuthRequiredModal: hiện khi user chưa đăng nhập cố mở ví */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        title="Đăng nhập để dùng ví"
        description="Bạn cần đăng nhập để xem số dư Kano-Coin và nạp tiền vào ví."
      />

      {/* Wallet Modal chính */}
      <dialog
        ref={dialogRef}
        onClose={handleNativeClose}
        onClick={handleBackdropClick}
        className="modern-dialog fixed inset-0 m-auto z-50 p-0 border-none bg-transparent outline-none focus:outline-none max-w-[480px] w-[calc(100%-32px)]"
      >
        {/* Container chính của Modal, bo góc rounded-[28px] theo ratio height/4 */}
        <div className="bg-white border border-neutral-900 rounded-[28px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] p-[24px] font-sans text-neutral-900 overflow-hidden relative">
          
          {/* Nút đóng */}
          <CloseButton
            onClose={close}
            variant="outline"
            size={16}
            aria-label="Đóng"
            className="absolute top-5 right-5 z-10"
          />

          {form.showSuccess ? (
            <TopUpSuccess
              amount={form.amount}
              balance={balance}
              onClose={close}
            />
          ) : (
            <>
              <h2 className="font-sans font-semibold text-[20px] text-neutral-950 mb-[22px] pr-[30px]">
                Ví Kano-Coin
              </h2>

              {/* Dashboard số dư ví */}
              <WalletDashboard
                balance={balance}
                frozenBalance={frozenBalance}
                className="mb-[24px]"
              />

              {/* Form nạp tiền */}
              <TopUpForm
                amount={form.amount}
                customAmount={form.customAmount}
                errorMsg={form.errorMsg}
                isSubmitting={form.isSubmitting}
                vndFormatted={form.vndFormatted}
                onQuickSelect={form.handleQuickSelect}
                onInputChange={form.handleInputChange}
                onSubmit={form.handleSubmit}
              />
            </>
          )}
        </div>
      </dialog>
    </>
  );
};

WalletModal.displayName = 'WalletModal';
