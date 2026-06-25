import React, { Suspense } from 'react';
import { bookingService } from '@/shared/services/bookingService';
import { DashboardStats } from '@/shared/components/organisms/DashboardStats';
import { PendingRequests } from '@/shared/components/organisms/PendingRequests';
import { UpcomingSchedule } from '@/shared/components/organisms/UpcomingSchedule';
import { DashboardSkeleton } from '@/shared/components/organisms/DashboardSkeleton';

async function DashboardContent() {
  let bookingsData: Awaited<ReturnType<typeof bookingService.getBookings>>;
  try {
    bookingsData = await bookingService.getBookings();
  } catch (err) {
    console.error('[DashboardPage] Lỗi fetch bookings:', err);
    return <DashboardLoadError />;
  }

  const bookings = bookingsData.bookings || [];
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const upcomingBookings = bookings.filter((b) => b.status === 'ACCEPTED');

  // Số dư ví mặc định/mock
  const balance = 1250;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. Thống kê & Quick Actions */}
      <DashboardStats
        balance={balance}
        pendingCount={pendingBookings.length}
        upcomingCount={upcomingBookings.length}
      />

      {/* 2. Danh sách Yêu cầu mới chờ duyệt */}
      <PendingRequests initialBookings={bookings} />

      {/* 3. Danh sách Lịch hẹn sắp diễn ra */}
      <UpcomingSchedule bookings={bookings} />
    </div>
  );
}

function DashboardLoadError() {
  return (
    <div className="w-full rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-8 text-center">
      <p className="font-sans text-sm font-semibold text-rose-700">
        Không thể tải dữ liệu dashboard.
      </p>
      <p className="mt-1 font-sans text-xs text-rose-600">
        Vui lòng tải lại trang hoặc thử lại sau.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="max-w-md mx-auto px-4 pt-4">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
