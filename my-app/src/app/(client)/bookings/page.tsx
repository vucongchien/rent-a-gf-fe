import React, { Suspense } from 'react';
import { bookingService } from '@/shared/services/bookingService';
import { WipeReveal } from '@/shared/components/atoms/WipeReveal';
import { BookingsClientView } from './BookingsClientView';

export default async function BookingsPage() {
  return (
    <div className="w-full pt-20 md:pt-4 pb-12">
      <div className="flex items-center gap-3 sm:gap-4 pt-4 pb-4 sm:pb-6 mb-2 sm:mb-4 w-full">
        <div className="w-[6px] sm:w-[8px] h-[24px] sm:h-[32px] bg-ruka-500 rounded-sm shrink-0" />
        <WipeReveal variant="feathered" duration={1} delay={0.35} showIcon={true} iconSize={24} className="w-auto">
          <h1 className="text-xl sm:text-3xl font-bold font-sans tracking-[0.12em] sm:tracking-[0.15em] uppercase text-neutral-800">
            Lịch đặt hẹn
          </h1>
        </WipeReveal>
      </div>

      <div className="max-w-[680px] mx-auto w-full px-4">
        {/* Deferred Content: Streamed Booking List */}
        <Suspense fallback={<BookingsSkeleton />}>
          <BookingsLoader />
        </Suspense>
      </div>
    </div>
  );
}

/* ==========================================================================
   BookingsLoader Component (Server Component fetching deferred data)
   ========================================================================== */
async function BookingsLoader() {
  // Fetch bookings (handles mock/offline automatically via bookingService)
  const data = await bookingService.getBookings();

  return <BookingsClientView initialBookings={data.bookings} />;
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
