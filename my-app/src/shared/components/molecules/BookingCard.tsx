'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { MapPinIcon, CalendarIcon, CoinIcon, ChatIcon, SpinnerIcon } from '@/shared/components/atoms/Icons';
import type { Booking } from '@/shared/types';

export interface BookingCardProps {
  booking: Booking;
}

const DotsVerticalIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatBookingTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const timeStart = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const timeEnd = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    const date = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`;

    return `${timeStart} - ${timeEnd} · ${date}`;
  };

  const handleCancel = async () => {
    setIsDropdownOpen(false);
    if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'PATCH',
      });
      const data = await res.json();

      if (res.ok && data?.data?.success) {
        toast({ message: 'Đã hủy lịch hẹn thành công.' });
        router.refresh();
      } else {
        toast({ message: data?.message || 'Có lỗi xảy ra khi hủy lịch.' });
      }
    } catch (err) {
      console.error('[BookingCard] Error cancelling booking:', err);
      toast({ message: 'Không thể kết nối đến hệ thống.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Chờ duyệt',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'ACCEPTED':
        return {
          label: 'Đã nhận',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'IN_PROGRESS':
        return {
          label: 'Đang diễn ra',
          classes: 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse',
        };
      case 'COMPLETED':
        return {
          label: 'Hoàn thành',
          classes: 'bg-neutral-50 text-neutral-600 border-neutral-200',
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          classes: 'bg-rose-50 text-rose-600 border-rose-200',
        };
      case 'REJECTED':
        return {
          label: 'Bị từ chối',
          classes: 'bg-rose-50 text-rose-600 border-rose-200',
        };
      default:
        return {
          label: status,
          classes: 'bg-neutral-50 text-neutral-800 border-neutral-200',
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const showCancelAction = booking.status === 'PENDING' || booking.status === 'ACCEPTED';
  const showChatAction = !!booking.chatRoomId;

  return (
    <article className="relative bg-white border border-neutral-200 rounded-[20px] p-4 flex flex-col sm:flex-row gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-15px_rgba(251,105,153,0.15)] hover:border-chizuru-100 transition-all duration-200">
      
      {/* Companion Avatar */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50">
        {booking.companionAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.companionAvatarUrl}
            alt={booking.companionName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-chizuru-50 text-chizuru-500 font-bold text-lg">
            {booking.companionName.charAt(0)}
          </div>
        )}
      </div>

      {/* Booking Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Header row: Companion Name & Status */}
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3 className="font-sans font-bold text-lg text-neutral-900 leading-none">
              {booking.companionName}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.classes}`}>
              {statusConfig.label}
            </span>
            {isCancelling && (
              <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                <SpinnerIcon className="animate-spin" size={12} />
                Đang xử lý...
              </span>
            )}
          </div>

          {/* Scenario Name */}
          <p className="font-sans font-semibold text-[14.5px] text-neutral-800 mb-2.5">
            {booking.scenarioName}
          </p>
        </div>

        {/* Info Rows: Time, Location, Price */}
        <div className="flex flex-col gap-1.5 text-[13px] text-neutral-500">
          <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-neutral-400 flex-shrink-0" />
            <span className="truncate">{formatBookingTime(booking.scheduledAt, booking.endsAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon size={14} className="text-neutral-400 flex-shrink-0" />
            <span className="truncate">{booking.scenarioLocation}</span>
          </div>
          <div className="flex items-center gap-1.5 font-sans font-bold text-neutral-900 mt-1">
            <CoinIcon size={14} className="text-chizuru-500 flex-shrink-0" />
            <span>{booking.priceInCoin} Kano-Coin</span>
          </div>
        </div>
      </div>

      {/* Action Dropdown Button */}
      <div className="absolute top-4 right-4" ref={dropdownRef}>
        {(showCancelAction || showChatAction) && (
          <>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 transition-colors focus:outline-none"
              aria-label="Tùy chọn lịch hẹn"
              disabled={isCancelling}
            >
              <DotsVerticalIcon size={18} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-neutral-200 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-20 py-1.5 overflow-hidden">
                {showChatAction && (
                  <Link
                    href={`/chat?roomId=${booking.chatRoomId}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[13.5px] font-bold text-neutral-700 hover:bg-chizuru-50 hover:text-chizuru-600 transition-colors w-full text-left"
                  >
                    <ChatIcon size={15} />
                    Trò chuyện
                  </Link>
                )}
                {showCancelAction && (
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-2 text-[13.5px] font-bold text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                  >
                    <span className="w-3.5 h-3.5 border-2 border-rose-600 rounded-full flex items-center justify-center font-black text-[9px] leading-none">×</span>
                    Hủy đặt lịch
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

    </article>
  );
};
