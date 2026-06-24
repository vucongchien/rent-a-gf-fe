'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import type { BookingStatus } from '@/shared/types';
import { ChatIcon, SpinnerIcon, XIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { acceptBookingAction, rejectBookingAction, cancelBookingAction } from '../../actions';

interface RequestDetailActionsProps {
  bookingId: string;
  status: BookingStatus;
  chatRoomId: string | null;
}

export const RequestDetailActions: React.FC<RequestDetailActionsProps> = ({
  bookingId,
  status,
  chatRoomId,
}) => {
  const { toast } = useToast();

  const [acceptConfirming, setAcceptConfirming] = useState(false);
  const [rejectConfirming, setRejectConfirming] = useState(false);
  const [cancelConfirming, setCancelConfirming] = useState(false);

  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [isAccepting, startAccept] = useTransition();
  const [isRejecting, startReject] = useTransition();
  const [isCancelling, startCancel] = useTransition();

  const canAccept = status === 'PENDING';
  const canReject = status === 'PENDING';
  const canChat = !!chatRoomId;
  const canCancel = status === 'ACCEPTED';

  const handleAccept = () => {
    setAcceptError(null);
    startAccept(async () => {
      const result = await acceptBookingAction(bookingId);
      if (result.status === 'error') {
        setAcceptError(result.message);
        return;
      }
      setAcceptConfirming(false);
      toast({ message: 'Đã chấp nhận yêu cầu. Phòng chat đã được mở.' });
    });
  };

  const handleReject = () => {
    setRejectError(null);
    startReject(async () => {
      const result = await rejectBookingAction(bookingId);
      if (result.status === 'error') {
        setRejectError(result.message);
        return;
      }
      setRejectConfirming(false);
      toast({ message: 'Đã từ chối yêu cầu.' });
    });
  };

  const handleCancel = () => {
    setCancelError(null);
    startCancel(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result.status === 'error') {
        setCancelError(result.message);
        return;
      }
      setCancelConfirming(false);
      toast({ message: 'Đã hủy lịch hẹn.' });
    });
  };

  if (!canAccept && !canReject && !canChat && !canCancel) return null;

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

        {canAccept && !acceptConfirming && !rejectConfirming && (
          <Button
            variant="unstyled"
            type="button"
            onClick={() => { setAcceptConfirming(true); setAcceptError(null); }}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-semibold text-[13.5px] transition-colors cursor-pointer"
          >
            Chấp nhận
          </Button>
        )}

        {canReject && !rejectConfirming && !acceptConfirming && (
          <Button
            variant="unstyled"
            type="button"
            onClick={() => { setRejectConfirming(true); setRejectError(null); }}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-rose-50 text-rose-600 font-sans font-semibold text-[13.5px] border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Từ chối
          </Button>
        )}

        {canCancel && !cancelConfirming && !acceptConfirming && !rejectConfirming && (
          <Button
            variant="unstyled"
            type="button"
            onClick={() => { setCancelConfirming(true); setCancelError(null); }}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-rose-50 text-rose-600 font-sans font-semibold text-[13.5px] border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <XIcon size={16} />
            Hủy lịch hẹn
          </Button>
        )}
      </div>

      {/* Accept confirm */}
      {canAccept && acceptConfirming && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="font-sans font-semibold text-[14px] text-neutral-900 mb-1">
            Xác nhận chấp nhận yêu cầu?
          </p>
          <p className="font-sans text-[12.5px] text-neutral-600 leading-snug mb-3">
            Phòng chat sẽ được mở và khách hàng sẽ nhận được thông báo.
          </p>
          {acceptError && (
            <p className="font-sans text-[12.5px] text-rose-600 leading-snug mb-3" role="alert">
              {acceptError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="unstyled"
              type="button"
              onClick={() => { setAcceptConfirming(false); setAcceptError(null); }}
              disabled={isAccepting}
              className="h-10 px-4 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[13px] border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Quay lại
            </Button>
            <Button
              variant="unstyled"
              type="button"
              onClick={handleAccept}
              disabled={isAccepting}
              className="h-10 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-semibold text-[13px] transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isAccepting && <SpinnerIcon size={14} className="animate-spin" />}
              Xác nhận chấp nhận
            </Button>
          </div>
        </div>
      )}

      {/* Reject confirm */}
      {canReject && rejectConfirming && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <p className="font-sans font-semibold text-[14px] text-neutral-900 mb-1">
            Xác nhận từ chối yêu cầu?
          </p>
          <p className="font-sans text-[12.5px] text-neutral-600 leading-snug mb-3">
            Yêu cầu sẽ bị từ chối và khách hàng sẽ được hoàn tiền đặt cọc.
          </p>
          {rejectError && (
            <p className="font-sans text-[12.5px] text-rose-600 leading-snug mb-3" role="alert">
              {rejectError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="unstyled"
              type="button"
              onClick={() => { setRejectConfirming(false); setRejectError(null); }}
              disabled={isRejecting}
              className="h-10 px-4 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[13px] border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Quay lại
            </Button>
            <Button
              variant="unstyled"
              type="button"
              onClick={handleReject}
              disabled={isRejecting}
              className="h-10 px-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-sans font-semibold text-[13px] transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isRejecting && <SpinnerIcon size={14} className="animate-spin" />}
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      )}

      {/* Cancel confirm */}
      {canCancel && cancelConfirming && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <p className="font-sans font-semibold text-[14px] text-neutral-900 mb-1">
            Xác nhận hủy lịch hẹn?
          </p>
          <p className="font-sans text-[12.5px] text-neutral-600 leading-snug mb-3">
            Sau khi hủy, lịch hẹn sẽ chuyển sang trạng thái &ldquo;Đã hủy&rdquo; và không thể khôi phục.
          </p>
          {cancelError && (
            <p className="font-sans text-[12.5px] text-rose-600 leading-snug mb-3" role="alert">
              {cancelError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="unstyled"
              type="button"
              onClick={() => { setCancelConfirming(false); setCancelError(null); }}
              disabled={isCancelling}
              className="h-10 px-4 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[13px] border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Quay lại
            </Button>
            <Button
              variant="unstyled"
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="h-10 px-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-sans font-semibold text-[13px] transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isCancelling && <SpinnerIcon size={14} className="animate-spin" />}
              Xác nhận hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
