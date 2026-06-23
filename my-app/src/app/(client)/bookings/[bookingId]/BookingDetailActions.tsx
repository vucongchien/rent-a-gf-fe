'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import type { BookingStatus } from '@/shared/types';
import { ChatIcon, SpinnerIcon, XIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';
import { cancelBookingAction } from '../actions';

interface BookingDetailActionsProps {
  bookingId: string;
  status: BookingStatus;
  chatRoomId: string | null;
  hasReviewed: boolean;
}

export const BookingDetailActions: React.FC<BookingDetailActionsProps> = ({
  bookingId,
  status,
  chatRoomId,
  hasReviewed,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canCancel = status === 'PENDING' || status === 'ACCEPTED';
  const canChat = !!chatRoomId;
  const canReview = status === 'COMPLETED' && !hasReviewed;

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

  if (!canChat && !canCancel && !canReview) return null;

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
