import React, { Suspense } from 'react';
import Link from 'next/link';
import { bookingService } from '@/shared/services/bookingService';
import { BookingCard } from '@/shared/components/molecules/BookingCard';
import { MobileHeader } from '@/shared/components/organisms/MobileHeader';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const tabItems = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt / Hoạt động' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export default async function BookingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentTab = (resolvedSearchParams.tab as string) || 'all';

  return (
    <div className="min-h-full bg-neutral-50 pb-12">
      {/* Mobile Header */}
      <MobileHeader
        left={<h1 className="text-xl font-bold text-neutral-900 px-4 font-sans">Lịch đặt hẹn</h1>}
      />

      {/* Desktop Header Title */}
      <div className="hidden lg:block max-w-3xl mx-auto pt-8 px-4">
        <h1 className="text-2xl font-bold text-neutral-900 font-sans">Lịch đặt hẹn</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col gap-6">
        {/* Status Filter Tabs (URL-as-state) */}
        <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Bộ lọc trạng thái đặt hẹn">
          {tabItems.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/bookings?tab=${tab.id}`}
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

        {/* Deferred Content: Streamed Booking List */}
        <Suspense key={currentTab} fallback={<BookingsSkeleton />}>
          <BookingsListContainer currentTab={currentTab} />
        </Suspense>
      </div>
    </div>
  );
}

/* ==========================================================================
   BookingsListContainer Component (Server Component fetching deferred data)
   ========================================================================== */
interface ListContainerProps {
  currentTab: string;
}

async function BookingsListContainer({ currentTab }: ListContainerProps) {
  // Fetch bookings (handles mock/offline automatically via bookingService)
  const data = await bookingService.getBookings();

  // Filter bookings server-side based on URL tab state
  const filteredBookings = data.items.filter((booking) => {
    if (currentTab === 'pending') {
      return (
        booking.status === 'PENDING' ||
        booking.status === 'ACCEPTED' ||
        booking.status === 'IN_PROGRESS'
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

  // Sort bookings so active/pending or newest ones are shown first
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
  });

  if (sortedBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-neutral-200 rounded-[24px] text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-chizuru-50 flex items-center justify-center text-chizuru-500 mb-4 border border-chizuru-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
            <line x1="10" x2="14" y1="14" y2="18"/>
            <line x1="14" x2="10" y1="14" y2="18"/>
          </svg>
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sortedBookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

/* ==========================================================================
   BookingsSkeleton Component
   ========================================================================== */
function BookingsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-[20px] p-4 flex gap-4 shadow-sm">
          {/* Avatar Skeleton */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-2xl flex-shrink-0" />
          
          {/* Details Skeleton */}
          <div className="flex-1 py-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-4.5 w-32 bg-neutral-200 rounded-md" />
                <div className="h-4 w-16 bg-neutral-100 rounded-full" />
              </div>
              <div className="h-4 w-48 bg-neutral-100 rounded-md mb-2" />
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="h-3.5 w-44 bg-neutral-100 rounded-md" />
              <div className="h-3.5 w-36 bg-neutral-100 rounded-md" />
              <div className="h-4 w-28 bg-neutral-200 rounded-md mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
