import React from 'react';
import { QuickActionCard } from '../molecules/QuickActionCard';
import { CalendarIcon, CalendarLineIcon, StarIcon } from '../atoms/Icons';

interface QuickActionsProps {
  pendingCount: number;
  upcomingCount: number;
  reviewsCount?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  pendingCount,
  upcomingCount,
  reviewsCount = 23,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[13px] font-bold font-sans text-neutral-500 uppercase tracking-wider">
          Thao tác nhanh
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: Yêu cầu mới */}
        <QuickActionCard
          href="#pending-requests"
          bgClass="bg-blue-50/30"
          bgHoverClass="hover:bg-blue-100/40"
          textClass="text-blue-600"
          title="Yêu cầu mới"
          countText={`(${pendingCount})`}
          icon={<CalendarIcon size={18} className="text-blue-600" />}
          shadowClass="shadow-sm"
        />

        {/* Card 2: Lịch hẹn */}
        <QuickActionCard
          href="#upcoming-schedule"
          bgClass="bg-amber-50/30"
          bgHoverClass="hover:bg-amber-100/40"
          textClass="text-amber-600"
          title="Lịch hẹn"
          countText={`(${upcomingCount})`}
          icon={<CalendarLineIcon size={18} className="text-amber-600" />}
          shadowClass="shadow-sm"
        />

        {/* Card 3: Đánh giá mới */}
        <QuickActionCard
          href="#reviews"
          bgClass="bg-rose-50/30"
          bgHoverClass="hover:bg-rose-100/40"
          textClass="text-rose-600"
          title="Đánh giá mới"
          countText={`${reviewsCount}`}
          icon={<StarIcon size={18} className="text-rose-500" />}
          shadowClass="shadow-sm"
        />
      </div>
    </div>
  );
};

