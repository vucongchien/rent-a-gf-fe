import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { notificationService } from '@/shared/services/notificationService';
import { authService } from '@/shared/services/authService';
import { NotificationListClient } from '@/app/(shared-authenticated)/notifications/components/NotificationListClient';
import { NotificationSkeleton } from '@/app/(shared-authenticated)/notifications/components/NotificationSkeleton';
import { AuthRequiredPage } from '@/shared/components/organisms/AuthRequiredPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông báo | Kanojo Dashboard',
  description: 'Quản lý các thông báo lịch hẹn, doanh thu và hệ thống của bạn.',
};

async function CompanionNotificationsLoader() {
  let data;
  try {
    data = await notificationService.getNotifications();
  } catch (err) {
    console.error('[CompanionNotificationsPage] Lỗi fetch notifications trên server:', err);
    return (
      <div className="text-center py-12 text-rose-500 text-sm font-medium">
        Không thể tải danh sách thông báo. Vui lòng tải lại trang.
      </div>
    );
  }

  return (
    <NotificationListClient
      initialNotifications={data.items}
      initialNextCursor={data.nextCursor}
      initialHasMore={data.hasMore}
      variant="companion"
    />
  );
}

export default async function CompanionNotificationsPage() {
  // Đọc cookies để Next.js hiểu đây là dynamic route và tránh lỗi prerender
  await cookies();

  // Auth guard: thông báo yêu cầu đăng nhập
  const user = await authService.getMe();
  if (!user) {
    return (
      <AuthRequiredPage
        redirectPath="/dashboard/notifications"
        title="Đăng nhập để xem thông báo"
        description="Bạn cần đăng nhập bằng tài khoản Companion để quản lý lịch hẹn, tin nhắn và thông báo."
      />
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-4">
      <div className="mb-4 px-1">
        <h1 className="font-sans font-bold text-[22px] tracking-tight text-neutral-900">
          Thông báo
        </h1>
        <p className="font-sans text-[12.5px] text-neutral-500 mt-0.5">
          Quản lý các yêu cầu lịch hẹn, tin nhắn và cảnh báo tài khoản.
        </p>
      </div>

      <div className="w-full pb-16">
        <Suspense fallback={<NotificationSkeleton />}>
          <CompanionNotificationsLoader />
        </Suspense>
      </div>
    </main>
  );
}

