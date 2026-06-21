import React, { Suspense } from 'react';
import { notificationService } from '@/shared/services/notificationService';
import { NotificationListClient } from './components/NotificationListClient';
import { NotificationSkeleton } from './components/NotificationSkeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông báo | Kanojo',
  description: 'Trung tâm thông báo tài khoản, lịch hẹn hò và giao dịch của bạn trên ứng dụng Kanojo.',
};

async function NotificationsLoader() {
  let data;
  try {
    data = await notificationService.getNotifications();
  } catch (err) {
    console.error('[NotificationsPage] Lỗi fetch notifications trên server:', err);
    return (
      <div className="text-center py-12 text-rose-500 text-sm font-medium">
        Không thể tải danh sách thông báo. Vui lòng tải lại trang.
      </div>
    );
  }

  return (
    <NotificationListClient
      initialNotifications={data.items}
      total={data.total}
    />
  );
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-neutral-50/40 pt-24 pb-20 px-0 md:px-8">
      {/* Container căn giữa rộng 720px tối ưu thị giác */}
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* Header chính của trang */}
        <div className="flex flex-col gap-1 px-4 md:px-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
            Thông báo
          </h1>
          <p className="text-xs text-neutral-500 font-normal leading-relaxed">
            Xem và quản lý các yêu cầu cuộc hẹn, tin nhắn mới và cập nhật từ hệ thống.
          </p>
        </div>

        {/* Khung nội dung trắng đơn giản tinh tế */}
        <main 
          id="notifications-container"
          className="bg-transparent rounded-none border-none p-0 shadow-none md:bg-white md:rounded-3xl md:border md:border-neutral-100/80 md:p-8 md:shadow-[0_8px_30px_rgba(0,0,0,0.015)]"
        >
          <Suspense fallback={<NotificationSkeleton />}>
            <NotificationsLoader />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
