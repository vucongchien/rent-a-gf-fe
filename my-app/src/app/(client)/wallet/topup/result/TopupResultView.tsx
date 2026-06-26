'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/atoms/Button';
import {
  CheckCircleIcon,
  XCircleIcon,
  InfoCircleIcon,
} from '@/shared/components/atoms/Icons';
import { TOPUP_RETURN_TO_KEY, useWallet } from '@/shared/contexts/WalletContext';

interface TopupResultViewProps {
  status: 'success' | 'cancelled' | 'failed';
  orderId: string;
  amount: number;
  code: string;
}

const STATUS_CONFIG = {
  success: {
    tone: 'emerald',
    title: 'Nạp tiền thành công',
    description: 'Số dư ví của bạn đã được cập nhật.',
    Icon: CheckCircleIcon,
  },
  cancelled: {
    tone: 'neutral',
    title: 'Bạn đã hủy giao dịch',
    description: 'Không có khoản tiền nào được trừ. Bạn có thể thử lại bất kỳ lúc nào.',
    Icon: InfoCircleIcon,
  },
  failed: {
    tone: 'rose',
    title: 'Thanh toán thất bại',
    description: 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
    Icon: XCircleIcon,
  },
} as const;

const TONE_CLASS = {
  emerald: 'text-emerald-500 bg-emerald-50',
  neutral: 'text-neutral-500 bg-neutral-100',
  rose: 'text-rose-500 bg-rose-50',
} as const;

export const TopupResultView: React.FC<TopupResultViewProps> = ({
  status,
  orderId,
  amount,
  code,
}) => {
  const router = useRouter();
  const didHandleSuccess = useRef(false);
  const { fetchWallet, open, showTopupSuccess } = useWallet();
  const cfg = STATUS_CONFIG[status];
  const { Icon } = cfg;

  // Sau khi VNPay báo thành công, dùng page này như bridge mở wallet modal success.
  useEffect(() => {
    if (status === 'success' && !didHandleSuccess.current) {
      didHandleSuccess.current = true;
      void fetchWallet().finally(() => {
        const returnTo = sessionStorage.getItem(TOPUP_RETURN_TO_KEY) || '/';
        sessionStorage.removeItem(TOPUP_RETURN_TO_KEY);
        showTopupSuccess(amount);
        router.replace(returnTo);
      });
    }
  }, [amount, fetchWallet, router, showTopupSuccess, status]);

  if (status === 'success') {
    return (
      <main className="min-h-[80svh] flex items-center justify-center px-4 py-10">
        <p className="font-sans text-[13.5px] text-neutral-500">
          Đang cập nhật ví của bạn...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[80svh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px] bg-white border border-neutral-200 rounded-2xl shadow-[0_24px_50px_-16px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-3">
          <div className={`w-16 h-16 rounded-full grid place-items-center ${TONE_CLASS[cfg.tone]}`}>
            <Icon size={32} />
          </div>
          <h1 className="font-sans font-bold text-[20px] text-neutral-900 leading-tight">
            {cfg.title}
          </h1>
          <p className="font-sans text-[13.5px] text-neutral-500 leading-relaxed">
            {cfg.description}
          </p>

          {amount > 0 && (
            <div className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 mt-3 text-left">
              <div className="flex items-baseline justify-between">
                <p className="font-sans text-[12.5px] text-neutral-500">Số Kano-Coin</p>
                <p className="font-sans font-bold text-[15px] text-neutral-900">
                  {amount.toLocaleString('vi-VN')} KC
                </p>
              </div>
              {orderId && (
                <div className="flex items-baseline justify-between mt-1.5">
                  <p className="font-sans text-[12px] text-neutral-500">Mã đơn</p>
                  <p className="font-mono text-[11.5px] text-neutral-700 truncate ml-3 max-w-[60%]">
                    {orderId}
                  </p>
                </div>
              )}
              {code && (
                <div className="flex items-baseline justify-between mt-1.5">
                  <p className="font-sans text-[12px] text-neutral-500">Mã phản hồi</p>
                  <p className="font-mono text-[11.5px] text-neutral-700">{code}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2.5 w-full mt-4">
            <Link
              href="/me"
              className="flex-1 h-11 inline-flex items-center justify-center rounded-xl bg-neutral-900 text-white font-sans font-semibold text-[13.5px] hover:bg-neutral-800 transition-colors"
            >
              Về ví của tôi
            </Link>
            <Button
              variant="unstyled"
              type="button"
              onClick={open}
              className="flex-1 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-neutral-300 text-neutral-700 font-sans font-semibold text-[13.5px] hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};
