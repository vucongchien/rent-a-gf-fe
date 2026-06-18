import React, { Suspense } from 'react';
import Link from 'next/link';
import { bookingService } from '@/shared/services/bookingService';
import { BookingCard } from '@/shared/components/molecules/BookingCard';
import { WipeReveal } from '@/shared/components/atoms/WipeReveal';

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
    <div className="w-full pb-12">
      {/* Header Title (Artbook style - Shared for Desktop & Mobile) */}
      <div className="flex items-center gap-3 sm:gap-4 pt-4 pb-4 sm:pb-6 mb-2 sm:mb-4 w-full">
        <div className="w-[6px] sm:w-[8px] h-[24px] sm:h-[32px] bg-ruka-500 rounded-sm shrink-0" />
        <WipeReveal variant="feathered" duration={1} delay={0.35} showIcon={true} iconSize={24} className="w-auto">
          <h1 className="text-xl sm:text-3xl font-bold font-sans tracking-[0.12em] sm:tracking-[0.15em] uppercase text-neutral-800">
            Lịch đặt hẹn
          </h1>
        </WipeReveal>
      </div>

      <div className="max-w-[680px] mx-auto w-full flex flex-col gap-6 px-4">
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
    <div className="flex flex-col gap-8 md:gap-10">
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
    <div className="flex flex-col gap-8 md:gap-10 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-6 items-center">
          {/* Avatar Skeleton (Horizontal Capsule 2:1) */}
          <div className="w-[90px] sm:w-[180px] h-[45px] sm:h-[90px] bg-neutral-100 rounded-full flex-shrink-0" />
          
          {/* Details Skeleton */}
          <div className="flex-1 py-1 flex flex-col justify-between">
            <div>
              {/* Tiêu đề 2 dòng trên mobile, 1 dòng trên desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-3">
                <div className="h-5 w-24 sm:w-32 bg-neutral-200 rounded-md" />
                <div className="h-4 w-36 sm:w-48 bg-neutral-100 rounded-md" />
              </div>
              
              <div className="flex flex-col gap-1 sm:gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                  <div className="h-3 w-28 sm:h-3.5 sm:w-48 bg-neutral-100 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                  <div className="h-3 w-40 sm:h-3.5 sm:w-64 bg-neutral-100 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                  <div className="h-3 w-32 sm:h-3.5 sm:w-36 bg-neutral-100 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
