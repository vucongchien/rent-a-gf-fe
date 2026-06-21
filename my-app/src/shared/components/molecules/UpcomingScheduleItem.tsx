import React from 'react';
import type { BookingListItem } from '@/shared/types';
import { DoodleAvatar } from './DoodleAvatar';
import { ChatIcon } from '../atoms/Icons';
import Link from 'next/link';

interface UpcomingScheduleItemProps {
  booking: BookingListItem;
  index: number;
}

export const UpcomingScheduleItem: React.FC<UpcomingScheduleItemProps> = ({
  booking,
  index,
}) => {
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('vi-VN')} · ${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-[20px] p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <DoodleAvatar name={booking.partnerName} index={index} />
        <div className="min-w-0">
          <h3 className="font-sans font-bold text-[13.5px] text-neutral-900 leading-tight truncate">
            {booking.partnerName}
          </h3>
          <p className="font-sans text-[11px] text-neutral-500 mt-1 leading-tight truncate">
            {booking.scenarioTitle}
          </p>
          <p className="font-mono text-[9.5px] text-neutral-400 mt-0.5">
            {formatDate(booking.startTime)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Số coin nhận được */}
        <span className="hidden sm:inline-block font-sans font-bold text-[11.5px] text-neutral-600">
          {booking.price} Coin
        </span>
        {/* Nút nhắn tin nhanh */}
        <Link
          href="/dashboard/chat"
          className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-amber-500 hover:border-amber-400 active:scale-90 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
          title="Nhắn tin cho khách hàng"
        >
          <ChatIcon size={16} />
        </Link>
      </div>
    </div>
  );
};
