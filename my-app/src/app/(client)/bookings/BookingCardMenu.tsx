'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BookingListItem } from '@/shared/types';
import {
  ChatIcon,
  SpinnerIcon,
  XIcon,
  MoreHorizontalIcon,
  CheckIcon,
  StarIcon,
  InfoIcon,
} from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { cancelBookingAction, completeBookingAction } from './actions';

interface BookingCardMenuProps {
  bookingId: string;
  status: BookingListItem['status'];
  chatRoomId: string | null;
  /** ISO string endTime — gate "Đánh dấu hoàn thành" chỉ hiện khi đã qua endTime. */
  endTime: string;
  /** Đã review chưa — gate "Viết đánh giá". */
  hasReviewed: boolean;
}

type ConfirmMode = null | 'cancel' | 'complete';

export const BookingCardMenu: React.FC<BookingCardMenuProps> = ({
  bookingId,
  status,
  chatRoomId,
  endTime,
  hasReviewed,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<ConfirmMode>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCancelling, startCancel] = useTransition();
  const [isCompleting, startComplete] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Tick `endPassed` sau mount (Date.now() impure không gọi trong render).
  const [endPassed, setEndPassed] = useState(false);
  useEffect(() => {
    if (!endTime) return;
    const target = new Date(endTime).getTime();
    const tick = () => setEndPassed(Date.now() >= target);
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [endTime]);

  const canCancel = status === 'PENDING' || status === 'ACCEPTED';
  const canChat = !!chatRoomId;
  const canComplete = status === 'ACCEPTED' && endPassed;
  const canDispute = status === 'ACCEPTED' || status === 'COMPLETED';
  const canReview = status === 'COMPLETED' && !hasReviewed;
  const hasAnyAction = canCancel || canChat || canComplete || canDispute || canReview;

  // Đóng khi click ngoài / nhấn Escape
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(null);
        setErrorMsg(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setConfirming(null);
        setErrorMsg(null);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!hasAnyAction) return null;

  const handleCancel = () => {
    setErrorMsg(null);
    startCancel(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result.status === 'error') {
        setErrorMsg(result.message);
        return;
      }
      setOpen(false);
      setConfirming(null);
      router.refresh();
    });
  };

  const handleComplete = () => {
    setErrorMsg(null);
    startComplete(async () => {
      const result = await completeBookingAction(bookingId);
      if (result.status === 'error') {
        setErrorMsg(result.message);
        return;
      }
      toast({ message: 'Đã đánh dấu hoàn thành.' });
      setOpen(false);
      setConfirming(null);
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="absolute top-1 right-0 z-10">
      <Button
        variant="unstyled"
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirming(null);
          setErrorMsg(null);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tùy chọn đặt hẹn"
        className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chizuru-300"
      >
        <MoreHorizontalIcon size={18} />
      </Button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-[calc(100%+6px)] bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] py-1.5 ${
            confirming ? 'w-[300px]' : 'w-[220px]'
          }`}
        >
          {!confirming && (
            <>
              {canChat && (
                <Link
                  href={`/chat?roomId=${chatRoomId}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13.5px] font-sans font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <ChatIcon size={15} className="flex-none text-neutral-500" />
                  Trò chuyện
                </Link>
              )}

              {canReview && (
                <Link
                  href={`/bookings/${bookingId}/review`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13.5px] font-sans font-medium text-chizuru-600 hover:bg-chizuru-50 transition-colors"
                >
                  <StarIcon size={15} className="flex-none" />
                  Viết đánh giá
                </Link>
              )}

              {canComplete && (
                <Button
                  variant="unstyled"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setConfirming('complete');
                    setErrorMsg(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-sans font-medium text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <CheckIcon size={15} className="flex-none" />
                  Đánh dấu hoàn thành
                </Button>
              )}

              {canDispute && (
                <Link
                  href={`/bookings/${bookingId}/dispute`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13.5px] font-sans font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <InfoIcon size={15} className="flex-none" />
                  Báo cáo vấn đề
                </Link>
              )}

              {canCancel && (
                <Button
                  variant="unstyled"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setConfirming('cancel');
                    setErrorMsg(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-sans font-medium text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <XIcon size={15} className="flex-none" />
                  Hủy đặt lịch
                </Button>
              )}
            </>
          )}

          {confirming === 'cancel' && (
            <ConfirmPanel
              title="Xác nhận hủy?"
              description="Lịch hẹn sẽ bị hủy và không thể hoàn tác."
              actionLabel="Xác nhận hủy"
              tone="rose"
              isPending={isCancelling}
              errorMsg={errorMsg}
              onCancel={() => { setConfirming(null); setErrorMsg(null); }}
              onConfirm={handleCancel}
            />
          )}

          {confirming === 'complete' && (
            <ConfirmPanel
              title="Xác nhận đã hoàn thành?"
              description="Companion sẽ nhận thanh toán và bạn có thể viết đánh giá."
              actionLabel="Xác nhận hoàn thành"
              tone="emerald"
              isPending={isCompleting}
              errorMsg={errorMsg}
              onCancel={() => { setConfirming(null); setErrorMsg(null); }}
              onConfirm={handleComplete}
            />
          )}
        </div>
      )}
    </div>
  );
};

interface ConfirmPanelProps {
  title: string;
  description: string;
  actionLabel: string;
  tone: 'rose' | 'emerald';
  isPending: boolean;
  errorMsg: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmPanel: React.FC<ConfirmPanelProps> = ({
  title,
  description,
  actionLabel,
  tone,
  isPending,
  errorMsg,
  onCancel,
  onConfirm,
}) => {
  const toneClass = tone === 'rose'
    ? 'bg-rose-500 hover:bg-rose-600'
    : 'bg-emerald-500 hover:bg-emerald-600';

  return (
    <div className="px-4 py-3">
      <p className="font-sans font-semibold text-[14px] text-neutral-800 mb-1">{title}</p>
      <p className="font-sans text-[12.5px] text-neutral-500 leading-relaxed mb-3">{description}</p>

      {errorMsg && (
        <p className="font-sans text-[11.5px] text-rose-500 leading-snug mb-2" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="unstyled"
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 h-9 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-sans font-semibold text-[12.5px] transition-colors disabled:opacity-50 cursor-pointer"
        >
          Quay lại
        </Button>
        <Button
          variant="unstyled"
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={`flex-1 h-9 rounded-lg ${toneClass} text-white font-sans font-semibold text-[12.5px] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer`}
        >
          {isPending && <SpinnerIcon size={13} className="animate-spin" />}
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};
