'use client';

import React from 'react';
import type { BookingListItem } from '@/shared/types';
import { usePendingRequests } from '@/shared/hooks/usePendingRequests';
import { PendingRequestItem } from '../molecules/PendingRequestItem';

interface PendingRequestsProps {
  initialBookings: BookingListItem[];
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({ initialBookings }) => {
  const { bookings, loadingId, handleAccept, handleReject } = usePendingRequests(initialBookings);

  return (
    <div id="pending-requests" className="w-full space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold font-sans text-neutral-800">Yêu cầu chờ duyệt</h2>
        <span className="text-[11px] font-sans font-semibold text-neutral-400 select-none">
          {bookings.length} yêu cầu
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="w-full py-8 text-center bg-cream border border-dashed border-border-card-dashed rounded-2xl">
          <p className="text-xs font-sans text-neutral-500">Bạn đã xử lý hết tất cả yêu cầu. 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <PendingRequestItem
              key={booking.bookingId}
              booking={booking}
              index={index}
              loadingId={loadingId}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
