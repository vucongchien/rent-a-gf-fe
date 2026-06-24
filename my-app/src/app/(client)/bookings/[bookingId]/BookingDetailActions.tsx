'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import type { BookingStatus } from '@/shared/types';
import { ChatIcon, SpinnerIcon, XIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { cancelBookingAction, completeBookingAction } from '../actions';

interface BookingDetailActionsProps {
  bookingId: string;
  status: BookingStatus;
  chatRoomId: string | null;
  hasReviewed: boolean;
  /** ISO string. Nút "Đánh dấu hoàn thành" chỉ hiện khi now >= endTime. */
  endTime?: string;
  /** true nếu user là CLIENT của booking (mới được trigger complete). */
  isClient?: boolean;
}

export const BookingDetailActions: React.FC<BookingDetailActionsProps> = ({
  bookingId,
  status,
  chatRoomId,
  hasReviewed,
  endTime,
  isClient,
}) => {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [completeConfirming, setCompleteConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completeErrorMsg, setCompleteErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCompleting, startComplete] = useTransition();

  const canCancel = status === 'PENDING' || status === 'ACCEPTED';
  const canChat = !!chatRoomId;
  const canReview = status === 'COMPLETED' && !hasReviewed;
  const canDispute = status === 'ACCEPTED' || status === 'COMPLETED';

  // `Date.now()` không pure, không gọi trong render — mount xong mới đánh giá.
  const [endPassed, setEndPassed] = useState(false);
  useEffect(() => {
    if (!endTime) return;
    const target = new Date(endTime).getTime();
    const tick = () => setEndPassed(Date.now() >= target);
    tick();
    // Re-check mỗi phút phòng khi user mở trang trước endTime.
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [endTime]);

  const canComplete = !!isClient && status === 'ACCEPTED' && endPassed;

  const handleCancel = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result.status === 'error') {
        setErrorMsg(result.message);
        return;
      }
      setConfirming(false);
    });
  };

  const handleComplete = () => {
    setCompleteErrorMsg(null);
    startComplete(async () => {
      const result = await completeBookingAction(bookingId);
      if (result.status === 'error') {
        setCompleteErrorMsg(result.message);
        return;
      }
      setCompleteConfirming(false);
      toast({ message: 'Đã đánh dấu hoàn thành.' });
    });
  };

  if (!canChat && !canCancel && !canReview && !canDispute && !canComplete) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {canChat && (
          <Link
            href={`/chat?roomId=${chatRoomId}`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-neutral-900 text-white font-sans font-semibold text-[13.5px] hover:bg-neutral-800 transition-colors"
          >
            <ChatIcon size={16} />
            Trò chuyện
          </Link>
        )}

        {canReview && (
          <Link
            href={`/bookings/${bookingId}/review`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-chizuru-500 text-white font-sans font-semibold text-[13.5px] hover:bg-chizuru-600 transition-colors"
          >
            Viết đánh giá
          </Link>
        )}

        {canComplete && !completeConfirming && (
          <Button
            variant="unstyled"
            type="button"
            onClick={() => {
              setCompleteConfirming(true);
              setCompleteErrorMsg(null);
            }}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-semibold text-[13.5px] transition-colors cursor-pointer"
          >
            Đánh dấu hoàn thành
          </Button>
        )}

        {canDispute && (
          <Link
            href={`/bookings/${bookingId}/dispute`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-rose-600 font-sans font-semibold text-[13.5px] border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            Báo cáo vấn đề
          </Link>
        )}

        {canCancel && !confirming && (
          <Button
            variant="unstyled"
            type="button"
            onClick={() => {
              setConfirming(true);
              setErrorMsg(null);
            }}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-rose-50 text-rose-600 font-sans font-semibold text-[13.5px] border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <XIcon size={16} />
            Hủy đặt lịch
          </Button>
        )}
      </div>

      {canComplete && completeConfirming && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="font-sans font-semibold text-[14px] text-neutral-900 mb-1">
            Xác nhận đã hoàn thành cuộc hẹn?
          </p>
          <p className="font-sans text-[12.5px] text-neutral-600 leading-snug mb-3">
            Sau khi xác nhận, Companion sẽ nhận thanh toán và bạn có thể viết đánh giá.
          </p>

          {completeErrorMsg && (
            <p className="font-sans text-[12.5px] text-rose-600 leading-snug mb-3" role="alert">
              {completeErrorMsg}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="unstyled"
              type="button"
              onClick={() => {
                setCompleteConfirming(false);
                setCompleteErrorMsg(null);
              }}
              disabled={isCompleting}
              className="h-10 px-4 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[13px] border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Quay lại
            </Button>
            <Button
              variant="unstyled"
              type="button"
              onClick={handleComplete}
              disabled={isCompleting}
              className="h-10 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-semibold text-[13px] transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isCompleting && <SpinnerIcon size={14} className="animate-spin" />}
              Xác nhận hoàn thành
            </Button>
          </div>
        </div>
      )}

      {canCancel && confirming && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <p className="font-sans font-semibold text-[14px] text-neutral-900 mb-1">
            Xác nhận hủy lịch hẹn?
          </p>
          <p className="font-sans text-[12.5px] text-neutral-600 leading-snug mb-3">
            Sau khi xác nhận, lịch hẹn sẽ chuyển sang trạng thái &ldquo;Đã hủy&rdquo; và không thể khôi phục.
          </p>

          {errorMsg && (
            <p className="font-sans text-[12.5px] text-rose-600 leading-snug mb-3" role="alert">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="unstyled"
              type="button"
              onClick={() => {
                setConfirming(false);
                setErrorMsg(null);
              }}
              disabled={isPending}
              className="h-10 px-4 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[13px] border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Quay lại
            </Button>
            <Button
              variant="unstyled"
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="h-10 px-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-sans font-semibold text-[13px] transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isPending && <SpinnerIcon size={14} className="animate-spin" />}
              Xác nhận hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
