import React, { Suspense } from 'react';
import { companionService } from '@/shared/services/companionService';
import { bookingService } from '@/shared/services/bookingService';
import { DashboardStats } from '@/shared/components/organisms/DashboardStats';
import { PendingRequests } from '@/shared/components/organisms/PendingRequests';
import { UpcomingSchedule } from '@/shared/components/organisms/UpcomingSchedule';
import { DashboardSkeleton } from '@/shared/components/organisms/DashboardSkeleton';

async function DashboardContent() {
  // Fetch song song để tránh waterfall
  const [bookingsData] = await Promise.all([
    bookingService.getBookings().catch(() => ({ bookings: [], total: 0 })),
  ]);

  const bookings = bookingsData?.bookings || [];
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

export default function DashboardPage() {
  return (
    <main className="max-w-md mx-auto px-4 pt-4">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
