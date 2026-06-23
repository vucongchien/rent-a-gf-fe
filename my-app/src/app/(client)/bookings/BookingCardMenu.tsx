'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import type { BookingListItem } from '@/shared/types';
import { ChatIcon, SpinnerIcon, XIcon, MoreHorizontalIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';
import { cancelBookingAction } from './actions';

interface BookingCardMenuProps {
  bookingId: string;
  status: BookingListItem['status'];
  chatRoomId: string | null;
}

export const BookingCardMenu: React.FC<BookingCardMenuProps> = ({ bookingId, status, chatRoomId }) => {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const canCancel = status === 'PENDING' || status === 'ACCEPTED';
  const canChat = !!chatRoomId;
  const hasAnyAction = canCancel || canChat;

  // Đóng khi click ngoài / nhấn Escape
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
        setErrorMsg(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setConfirming(false);
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
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result.status === 'error') {
        setErrorMsg(result.message);
        return;
      }
      setOpen(false);
      setConfirming(false);
    });
  };

  return (
    <div ref={containerRef} className="absolute top-1 right-0 z-10">
      <Button
        variant="unstyled"
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirming(false);
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
          className="absolute right-0 top-[calc(100%+6px)] w-[200px] bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] py-1.5"
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

              {canCancel && (
                <Button
                  variant="unstyled"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setConfirming(true);
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

          {confirming && (
            <div className="px-3.5 py-2.5">
              <p className="font-sans font-semibold text-[13px] text-neutral-800 mb-0.5">
                Xác nhận hủy?
              </p>
              <p className="font-sans text-[11.5px] text-neutral-500 leading-snug mb-2.5">
                Lịch hẹn sẽ bị hủy và không thể hoàn tác.
              </p>

              {errorMsg && (
                <p className="font-sans text-[11.5px] text-rose-500 leading-snug mb-2" role="alert">
                  {errorMsg}
                </p>
              )}

              <div className="flex items-center gap-1.5">
                <Button
                  variant="unstyled"
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setErrorMsg(null);
                  }}
                  disabled={isPending}
                  className="flex-1 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-sans font-semibold text-[12px] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Quay lại
                </Button>
                <Button
                  variant="unstyled"
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="flex-1 h-8 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-sans font-semibold text-[12px] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPending && <SpinnerIcon size={13} className="animate-spin" />}
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
