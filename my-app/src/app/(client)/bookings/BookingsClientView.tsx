'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { BookingListItem } from '@/shared/types';
import { BookingCard } from '@/shared/components/molecules/BookingCard';
import { CalendarXIcon } from '@/shared/components/atoms/Icons';

interface BookingsClientViewProps {
  initialBookings: BookingListItem[];
}

const tabItems = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt / Hoạt động' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const BookingsClientView: React.FC<BookingsClientViewProps> = ({ initialBookings }) => {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';

  // Lọc danh sách bookings ngay tại client-side
  const filteredBookings = initialBookings.filter((booking) => {
    if (currentTab === 'pending') {
      return (
        booking.status === 'PENDING' ||
        booking.status === 'ACCEPTED'
      );
    }
    if (currentTab === 'completed') {
      return booking.status === 'COMPLETED';
    }
    if (currentTab === 'cancelled') {
      return booking.status === 'CANCELLED' || booking.status === 'REJECTED';
    }
    return true; // 'all'
  });

  // Sắp xếp bookings: Mới nhất hiển thị trước
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Status Filter Tabs (URL-as-state) */}
      <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Bộ lọc trạng thái đặt hẹn">
        {tabItems.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/bookings?tab=${tab.id}`}
              scroll={false}
              className={`
                inline-flex items-center justify-center font-sans font-bold text-[13.5px] leading-none 
                px-4 py-2.5 rounded-full border transition-all duration-150 whitespace-nowrap cursor-pointer select-none
                ${isActive
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:text-neutral-900 hover:border-neutral-300'
                }
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Render Booking Cards list or Empty State */}
      {sortedBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-neutral-200 rounded-[24px] text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-chizuru-50 flex items-center justify-center text-chizuru-500 mb-4 border border-chizuru-100">
            <CalendarXIcon size={28} className="text-chizuru-500" />
          </div>
          <h3 className="font-sans font-bold text-neutral-800 text-lg mb-1">
            Không tìm thấy lịch hẹn
          </h3>
          <p className="font-sans text-[13.5px] text-neutral-500 max-w-sm">
            {currentTab === 'all'
              ? 'Bạn chưa tạo bất kỳ lịch hẹn nào. Hãy khám phá và thuê một người bạn gái nhé!'
              : 'Không có lịch hẹn nào khớp với bộ lọc trạng thái được chọn.'}
          </p>
          {currentTab === 'all' && (
            <Link
              href="/explore"
              className="mt-5 btn-base btn-primary btn-md px-6 rounded-xl hover:brightness-105"
            >
              Khám phá ngay
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8 md:gap-10">
          {sortedBookings.map((booking) => (
            <BookingCard key={booking.bookingId} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};
