import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { bookingService } from '@/shared/services/bookingService';
import { PendingRequests } from '@/shared/components/organisms/PendingRequests';

export const metadata: Metadata = {
  title: 'Yêu cầu đặt lịch | Kanojo',
  description: 'Duyệt và xử lý các yêu cầu đặt lịch mới từ khách hàng.',
};

export default function DashboardRequestsPage() {
  return (
    <main className="w-full max-w-2xl mx-auto px-4 pt-6 md:pt-6 pb-12">
      <header className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
          Yêu cầu đặt lịch
        </h1>
        <p className="text-xs text-neutral-500 font-normal leading-relaxed">
          Duyệt các yêu cầu mới từ khách hàng. Chấp nhận để mở phòng chat hoặc từ chối nếu lịch không phù hợp.
        </p>
      </header>

      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsLoader />
      </Suspense>
    </main>
  );
}

async function RequestsLoader() {
  await connection();
  let bookings;
  try {
    const data = await bookingService.getBookings();
    bookings = data.bookings;
  } catch (err) {
    console.error('[DashboardRequestsPage] Lỗi fetch bookings:', err);
    return (
      <div className="w-full py-12 text-center bg-rose-50/60 border border-rose-100 rounded-2xl">
        <p className="text-sm font-sans font-medium text-rose-600">
          Không thể tải danh sách yêu cầu. Vui lòng tải lại trang.
        </p>
      </div>
    );
  }

  return <PendingRequests initialBookings={bookings} />;
}

function RequestsSkeleton() {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="flex items-center justify-between mb-1">
        <div className="h-4 w-32 bg-neutral-200 rounded-md" />
        <div className="h-3 w-16 bg-neutral-100 rounded-md" />
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-neutral-100 rounded-[20px] p-4 flex flex-col gap-3 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-neutral-100 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-start gap-2">
                <div className="h-3.5 w-28 bg-neutral-200 rounded-md" />
                <div className="h-4 w-16 bg-emerald-50 border border-emerald-100 rounded-full" />
              </div>
              <div className="h-3 w-40 bg-neutral-100 rounded-md mt-2" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100/60">
            <div className="h-2.5 w-24 bg-neutral-100 rounded-md" />
            <div className="flex items-center gap-3">
              <div className="h-5 w-12 bg-neutral-100 rounded-md" />
              <div className="h-7 w-20 bg-chizuru-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
