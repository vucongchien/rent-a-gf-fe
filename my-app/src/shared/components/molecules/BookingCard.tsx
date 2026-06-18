'use client';

import React from 'react';
import type { Booking } from '@/shared/types';

export interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const formatBookingTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const timeStart = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const timeEnd = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    const date = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`;

    return `${timeStart} - ${timeEnd} · ${date}`;
  };
  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Chờ duyệt',
          textColor: 'text-amber-600',
        };
      case 'ACCEPTED':
        return {
          label: 'Đã nhận',
          textColor: 'text-emerald-600',
        };
      case 'IN_PROGRESS':
        return {
          label: 'Đang diễn ra',
          textColor: 'text-sky-600 animate-pulse',
        };
      case 'COMPLETED':
        return {
          label: 'Hoàn thành',
          textColor: 'text-neutral-500',
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          textColor: 'text-rose-600',
        };
      case 'REJECTED':
        return {
          label: 'Bị từ chối',
          textColor: 'text-rose-600',
        };
      default:
        return {
          label: status,
          textColor: 'text-neutral-700',
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <article className="relative flex flex-row items-center gap-4 sm:gap-10 w-full pt-2">
      
      {/* Companion Avatar (Capsule style: aspect 2:1) */}
      <div className="relative w-[90px] sm:w-[180px] h-[45px] sm:h-[90px] flex-shrink-0 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        {booking.companionAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.companionAvatarUrl}
            alt={booking.companionName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-chizuru-50 text-chizuru-500 font-sans font-bold text-lg">
            {booking.companionName.charAt(0)}
          </div>
        )}
      </div>

      {/* Booking Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-start">
        {/* Companion Name & Scenario Name (2 lines on mobile, 1 line on desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-2">
          <h3 className="font-sans font-bold text-sm sm:text-lg md:text-xl leading-tight text-neutral-900">
            {booking.companionName}
          </h3>
          <span className="hidden sm:inline text-neutral-400">—</span>
          <span className="font-semibold text-xs sm:text-sm md:text-base text-neutral-700 leading-tight">
            {booking.scenarioName}
          </span>
        </div>

        {/* Bullet Info list with custom SVG dot */}
        <ul className="flex flex-col gap-0.5 sm:gap-1 text-[11px] sm:text-[13px] md:text-[13.5px] text-neutral-500 font-sans" aria-label="Thông tin chi tiết đặt hẹn">
          <li className="flex items-center gap-2.5">
            <svg className="w-1.5 h-1.5 text-neutral-300 flex-shrink-0" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="3" cy="3" r="2" />
            </svg>
            <span>
              Trạng thái: <span className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <svg className="w-1.5 h-1.5 text-neutral-300 flex-shrink-0" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="3" cy="3" r="2" />
            </svg>
            <span>{formatBookingTime(booking.scheduledAt, booking.endsAt)}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <svg className="w-1.5 h-1.5 text-neutral-300 flex-shrink-0" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="3" cy="3" r="2" />
            </svg>
            <span className="truncate">{booking.scenarioLocation}</span>
          </li>
        </ul>
      </div>

    </article>
  );
};
