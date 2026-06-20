'use client';

import { useState } from 'react';

export interface UseTopUpFormProps {
  topup: (amount: number) => Promise<boolean>;
}

export function useTopUpForm({ topup }: UseTopUpFormProps) {
  const [amount, setAmount] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>('200');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Thực hiện nạp tiền
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 100) {
      setErrorMsg('Số tiền nạp tối thiểu là 100 Kano-Coin');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      const success = await topup(amount);
      if (success) {
        setShowSuccess(true);
      } else {
        setErrorMsg('Giao dịch nạp tiền thất bại. Vui lòng thử lại sau.');
      }
    } catch {
      setErrorMsg('Có lỗi mạng xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vndFormatted = (amount * 1000).toLocaleString('vi-VN') + ' VNĐ';

  return {
    amount,
    customAmount,
    isSubmitting,
    errorMsg,
    showSuccess,
    setShowSuccess,
    handleQuickSelect,
    handleInputChange,
    handleSubmit,
    vndFormatted,
  };
}
