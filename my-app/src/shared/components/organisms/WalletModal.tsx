'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@/shared/contexts/WalletContext';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';
import { Button } from '../atoms/Button';
import { CloseButton } from '../atoms/CloseButton';
import { SpinnerIcon } from '../atoms/Icons';

export const WalletModal: React.FC = () => {
  const { isOpen, close, balance, frozenBalance, topup } = useWallet();
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const [amount, setAmount] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>('200');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Hiệu ứng số chạy cho số dư khả dụng
  const animatedBalance = useAnimatedNumber(balance);

  // Điều khiển đóng mở dialog native
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        // Reset state khi mở modal
        setShowSuccess(false);
        setErrorMsg(null);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
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

  // Cập nhật khi nhấn nút nạp nhanh
  const handleQuickSelect = (value: number) => {
    setAmount(value);
    setCustomAmount(value.toString());
    setErrorMsg(null);
  };

  // Cập nhật khi tự nhập input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setCustomAmount(valStr);
    
    const valNum = parseInt(valStr, 10);
    if (isNaN(valNum)) {
      setAmount(0);
      setErrorMsg('Vui lòng nhập số hợp lệ');
    } else if (valNum < 100) {
      setAmount(valNum);
      setErrorMsg('Số tiền nạp tối thiểu là 100 Kano-Coin');
    } else {
      setAmount(valNum);
      setErrorMsg(null);
    }
  };

  // Thực hiện nạp tiền giả lập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 100) {
      setErrorMsg('Số tiền nạp tối thiểu là 100 Kano-Coin');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      // Giả lập delay xử lý giao dịch nạp tiền
      const success = await topup(amount);
      if (success) {
        setShowSuccess(true);
      } else {
        setErrorMsg('Giao dịch nạp tiền thất bại. Vui lòng thử lại sau.');
      }
    } catch (err) {
      setErrorMsg('Có lỗi mạng xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vndFormatted = (amount * 1000).toLocaleString('vi-VN') + ' VNĐ';

  return (
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

        {showSuccess ? (
          /* GIAO DIỆN NẠP TIỀN THÀNH CÔNG */
          <div className="flex flex-col items-center text-center py-[20px] animate-fade-in">
            <div className="w-[64px] h-[64px] rounded-full bg-emerald-50 border-[2px] border-emerald-500 flex items-center justify-center text-emerald-500 text-[32px] mb-[18px]">
              ✓
            </div>
            <h3 className="font-sans font-semibold text-[22px] text-neutral-950 mb-[8px]">
              Nạp tiền thành công!
            </h3>
            <p className="text-[14px] text-neutral-500 max-w-[320px] mb-[24px]">
              Bạn đã nạp thành công <span className="font-semibold text-neutral-800">+{amount.toLocaleString('vi-VN')} Kano-Coin</span> vào ví.
            </p>
            
            {/* Box hiển thị số dư mới cập nhật */}
            <div className="w-full bg-neutral-50 border border-neutral-200 rounded-[16px] p-[16px] mb-[28px] flex justify-between items-center">
              <span className="text-[14px] text-neutral-500">Số dư hiện tại</span>
              <span className="font-sans font-bold text-[20px] text-[var(--color-chizuru-600)]">
                {animatedBalance.toLocaleString('vi-VN')} Coin
              </span>
            </div>

            <Button
              variant="primary"
              onClick={close}
              className="w-full h-[48px] rounded-[12px] font-semibold text-[15px]"
            >
              Hoàn tất
            </Button>
          </div>
        ) : (
          /* GIAO DIỆN CHÍNH CỦA VÍ */
          <div>
            <h2 className="font-sans font-semibold text-[20px] text-neutral-950 mb-[22px] pr-[30px]">
              Ví Kano-Coin
            </h2>

            {/* Dashboard số dư ví */}
            <div className="bg-gradient-to-br from-chizuru-50/70 to-pink-50/50 border border-neutral-200 rounded-[20px] p-[18px] mb-[24px] shadow-sm">
              <span className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-neutral-500 block">
                Số dư khả dụng
              </span>
              
              <div className="flex items-baseline gap-[6px] mt-[6px] mb-[4px]">
                {/* Số dư chạy animation */}
                <span className="font-sans font-bold text-[36px] tracking-tight leading-none text-neutral-900">
                  {animatedBalance.toLocaleString('vi-VN')}
                </span>
                <span className="text-[18px] font-semibold text-neutral-500">Kano-Coin</span>
              </div>
              
              {frozenBalance > 0 && (
                <div className="text-[12.5px] text-neutral-500 border-t border-neutral-200/50 pt-[10px] mt-[10px] flex items-center justify-between">
                  <span>Tạm đóng băng (Lịch hẹn đang giữ)</span>
                  <span className="font-semibold font-mono text-neutral-700">-{frozenBalance} Coin</span>
                </div>
              )}
            </div>

            {/* Form nạp tiền */}
            <form onSubmit={handleSubmit} className="flex flex-col">
              <label className="font-sans font-semibold text-[14px] text-neutral-800 mb-[10px] block">
                Nạp thêm Kano-Coin
              </label>

              {/* Các gói nạp nhanh */}
              <div className="grid grid-cols-4 gap-[8px] mb-[14px]">
                {[100, 200, 500, 1000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant="quick-select"
                    isActive={amount === val}
                    activeBorderColor="var(--color-chizuru-600)"
                    onClick={() => handleQuickSelect(val)}
                  >
                    +{val}
                  </Button>
                ))}
              </div>

              {/* Ô tự nhập số lượng */}
              <div className="relative mb-[6px]">
                <input
                  type="number"
                  placeholder="Nhập số coin cần nạp"
                  value={customAmount}
                  onChange={handleInputChange}
                  className={`
                    w-full h-[46px] pl-[14px] pr-[100px] border rounded-[12px] font-sans font-semibold text-[15px]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-chizuru-600)] transition-all
                    ${errorMsg ? 'border-rose-400 bg-rose-50/30' : 'border-neutral-200'}
                  `}
                />
                <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[12.5px] font-mono text-neutral-400 uppercase tracking-wider">
                  Kano-Coin
                </span>
              </div>

              {/* Error validation */}
              {errorMsg && (
                <span className="text-[12px] text-rose-500 font-sans block mb-[10px] px-1">
                  ⚠ {errorMsg}
                </span>
              )}

              {/* Quy đổi VNĐ hiển thị động */}
              {!errorMsg && amount > 0 && (
                <div className="text-[13px] text-neutral-500 mb-[18px] px-1">
                  Giá thanh toán tương ứng: <span className="font-bold text-neutral-800 font-sans">{vndFormatted}</span>
                </div>
              )}

              {/* Button Submit */}
              <Button
                type="submit"
                variant="primary"
                disabled={amount < 100 || isSubmitting}
                className="w-full h-[50px] rounded-[12px] font-semibold text-[15px] mt-[8px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-[8px]">
                    <SpinnerIcon size={20} className="text-current" />
                    Đang kết nối cổng thanh toán an toàn...
                  </span>
                ) : (
                  `Nạp tiền (${vndFormatted}) →`
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </dialog>
  );
};
