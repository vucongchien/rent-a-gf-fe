import React from 'react';
import type { BookingListItem } from '@/shared/types';
import { UpcomingScheduleItem } from '../molecules/UpcomingScheduleItem';

interface UpcomingScheduleProps {
  bookings: BookingListItem[];
}

export const UpcomingSchedule: React.FC<UpcomingScheduleProps> = ({ bookings }) => {
  const upcomingList = bookings.filter((b) => b.status === 'ACCEPTED');

  return (
    <div id="upcoming-schedule" className="w-full space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold font-sans text-neutral-800">Lịch hẹn sắp diễn ra</h2>
        <span className="text-[11px] font-sans font-semibold text-neutral-400 select-none">
          {upcomingList.length} ca hẹn
        </span>
      </div>

      {upcomingList.length === 0 ? (
        <div className="w-full py-8 text-center bg-cream border border-dashed border-border-card-dashed rounded-2xl">
          <p className="text-xs font-sans text-neutral-500">Chưa có lịch hẹn nào sắp tới.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingList.map((booking, index) => (
            <UpcomingScheduleItem
              key={booking.bookingId}
              booking={booking}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingSchedule;
