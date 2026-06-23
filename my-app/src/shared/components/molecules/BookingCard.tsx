'use client';

import React from 'react';
import Link from 'next/link';
import type { BookingListItem } from '@/shared/types';
import { BulletDot } from '@/shared/components/atoms/BulletDot';

export interface BookingCardProps {
  booking: BookingListItem;
  /** Slot góc phải card (vd: dropdown menu hành động). Caller tự chịu positioning. */
  actions?: React.ReactNode;
  /** Khi truyền, content (avatar + thông tin) bọc trong Link tới href này. */
  href?: string;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, actions, href }) => {
  const formatBookingTime = (startStr: string) => {
    const start = new Date(startStr);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const timeStart = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const date = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`;

    return `${timeStart} · ${date}`;
  };
  const getStatusConfig = (status: BookingListItem['status']) => {
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

  const inner = (
    <>
      {/* Companion Avatar (Capsule style: aspect 2:1) */}
      <div className="relative w-[90px] sm:w-[180px] h-[45px] sm:h-[90px] flex-shrink-0 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        {booking.partnerAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.partnerAvatar}
            alt={booking.partnerName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-chizuru-50 text-chizuru-500 font-sans font-bold text-lg">
            {booking.partnerName.charAt(0)}
          </div>
        )}
      </div>

      {/* Booking Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-start">
        {/* Companion Name & Scenario Name (2 lines on mobile, 1 line on desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-2">
          <h3 className="font-sans font-bold text-sm sm:text-lg md:text-xl leading-tight text-neutral-900">
            {booking.partnerName}
          </h3>
          <span className="hidden sm:inline text-neutral-400">—</span>
          <span className="font-semibold text-xs sm:text-sm md:text-base text-neutral-700 leading-tight">
            {booking.scenarioTitle}
          </span>
        </div>

        {/* Bullet Info list with custom SVG dot */}
        <ul className="flex flex-col gap-0.5 sm:gap-1 text-[11px] sm:text-[13px] md:text-[13.5px] text-neutral-500 font-sans" aria-label="Thông tin chi tiết đặt hẹn">
          <li className="flex items-center gap-2.5">
            <BulletDot className="w-1.5 h-1.5" aria-hidden="true" />
            <span>
              Trạng thái: <span className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <BulletDot className="w-1.5 h-1.5" aria-hidden="true" />
            <span>Thời gian: {formatBookingTime(booking.startTime)}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <BulletDot className="w-1.5 h-1.5" aria-hidden="true" />
            <span>Giá: <span className="font-semibold text-neutral-700">{booking.price} Kano-Coin</span></span>
          </li>
        </ul>
      </div>
    </>
  );

  const contentClass = 'flex flex-row items-center gap-4 sm:gap-10 w-full';

  return (
    <article className="relative pt-2 pr-9">
      {actions}
      {href ? (
        <Link
          href={href}
          aria-label={`Xem chi tiết lịch hẹn với ${booking.partnerName}`}
          className={`${contentClass} rounded-2xl -mx-2 px-2 py-1 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chizuru-300`}
        >
          {inner}
        </Link>
      ) : (
        <div className={contentClass}>{inner}</div>
      )}
    </article>
  );
};

