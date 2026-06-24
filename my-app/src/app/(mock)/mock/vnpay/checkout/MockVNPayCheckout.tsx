'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, InfoCircleIcon } from '@/shared/components/atoms/Icons';

interface MockVNPayCheckoutProps {
  orderId: string;
  amount: number;
}

type Outcome = 'success' | 'failed' | 'cancelled';

const OUTCOME_CODES: Record<Outcome, { code: string; status: string }> = {
  success: { code: '00', status: '00' },
  failed: { code: '07', status: '02' },
  cancelled: { code: '24', status: '02' },
};

export const MockVNPayCheckout: React.FC<MockVNPayCheckoutProps> = ({ orderId, amount }) => {
  const [submitting, setSubmitting] = useState<Outcome | null>(null);

  const handleOutcome = (outcome: Outcome) => {
    setSubmitting(outcome);
    const { code, status } = OUTCOME_CODES[outcome];
    const qs = new URLSearchParams({
      vnp_TmnCode: 'MOCK_TMN',
      vnp_TxnRef: orderId,
      vnp_Amount: String(amount * 1000 * 100), // VNPay format: VND × 100
      vnp_ResponseCode: code,
      vnp_TransactionStatus: status,
      vnp_OrderInfo: `Nap ${amount} Kano-Coin`,
      vnp_PayDate: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
      vnp_SecureHash: 'MOCK_HASH_NOT_VERIFIED',
    });
    window.location.href = `/api/finance/vnpay-return?${qs.toString()}`;
  };

  const amountVnd = (amount * 1000).toLocaleString('vi-VN');

  return (
    <main className="min-h-[100svh] flex items-center justify-center px-4 py-10 bg-neutral-50">
      <div className="w-full max-w-[480px] bg-white border border-neutral-200 rounded-2xl shadow-[0_24px_50px_-16px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-500 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 grid place-items-center font-sans font-bold text-[16px]">
              V
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-[15px] leading-tight">VNPay (Mock Sandbox)</p>
              <p className="font-sans text-[11.5px] opacity-80">Giả lập cho dev — không tính phí thật</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
            <p className="font-sans text-[11.5px] text-neutral-500 uppercase tracking-wider font-semibold mb-1">
              Tóm tắt đơn hàng
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <p className="font-sans text-[13px] text-neutral-600">Mã đơn</p>
              <p className="font-mono text-[12.5px] text-neutral-800 truncate ml-3 max-w-[60%]">{orderId}</p>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <p className="font-sans text-[13px] text-neutral-600">Số Kano-Coin</p>
              <p className="font-sans font-semibold text-[15px] text-neutral-900">{amount.toLocaleString('vi-VN')} KC</p>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <p className="font-sans text-[13px] text-neutral-600">Tổng tiền</p>
              <p className="font-sans font-bold text-[17px] text-rose-600">{amountVnd} ₫</p>
            </div>
          </div>

          <div>
            <p className="font-sans font-semibold text-[13px] text-neutral-800 mb-1">
              Chọn kết quả thanh toán (mock)
            </p>
            <p className="font-sans text-[12px] text-neutral-500 leading-relaxed mb-3">
              Đây là trang demo — chọn nút bên dưới để giả lập outcome trả về từ VNPay.
            </p>

            <div className="flex flex-col gap-2.5">
              <Button
                variant="unstyled"
                type="button"
                onClick={() => handleOutcome('success')}
                disabled={!!submitting}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-semibold text-[14px] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting === 'success' ? (
                  <SpinnerIcon size={16} className="animate-spin" />
                ) : (
                  <CheckCircleIcon size={16} />
                )}
                Thanh toán thành công
              </Button>

              <Button
                variant="unstyled"
                type="button"
                onClick={() => handleOutcome('failed')}
                disabled={!!submitting}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-sans font-semibold text-[14px] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting === 'failed' ? (
                  <SpinnerIcon size={16} className="animate-spin" />
                ) : (
                  <XCircleIcon size={16} />
                )}
                Thanh toán thất bại
              </Button>

              <Button
                variant="unstyled"
                type="button"
                onClick={() => handleOutcome('cancelled')}
                disabled={!!submitting}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 font-sans font-semibold text-[14px] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting === 'cancelled' ? (
                  <SpinnerIcon size={16} className="animate-spin" />
                ) : (
                  <InfoCircleIcon size={16} />
                )}
                Hủy giao dịch
              </Button>
            </div>
          </div>

          <p className="text-center font-sans text-[11px] text-neutral-400 leading-relaxed">
            Khi BE thật sẵn sàng, trang này sẽ được thay bằng VNPay sandbox/prod thực.
          </p>
        </div>
      </div>
    </main>
  );
};
