import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationListClient } from './NotificationListClient';
import type { Notification } from '@/shared/types';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockResetUnreadCount = vi.fn();
const mockDecrement = vi.fn();
vi.mock('@/shared/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    resetUnreadCount: mockResetUnreadCount,
    decrementUnreadCount: mockDecrement,
  }),
}));

// Mock fetch
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
});
global.fetch = mockFetch;

describe('NotificationListClient', () => {
  /**
   * Fixture: 3 thông báo thuộc 2 category theo API mới (TRANSACTIONAL | MARKETING).
   * eventKind derive từ eventId được service xử lý, test fixture set trực tiếp.
   */
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'Booking được xác nhận!',
      body: 'Linh đã đồng ý.',
      eventKind: 'BOOKING_ACCEPTED',
      category: 'TRANSACTIONAL',
      priority: 'HIGH',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      title: 'Tin nhắn mới',
      body: 'Alo alo.',
      eventKind: 'CHAT_MESSAGE',
      category: 'TRANSACTIONAL',
      priority: 'MEDIUM',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-3',
      title: 'Khuyến mãi hôm nay',
      body: 'Giảm 20% cho lần đặt lịch tiếp theo.',
      eventKind: 'PROMOTION_VOUCHER',
      category: 'MARKETING',
      priority: 'LOW',
      isRead: true,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all notifications and filter tabs (ALL / TRANSACTIONAL / MARKETING)', () => {
    render(
      <NotificationListClient
        initialNotifications={mockNotifications}
        initialNextCursor={null}
        initialHasMore={false}
      />,
    );

    expect(screen.getByText('Booking được xác nhận!')).toBeInTheDocument();
    expect(screen.getByText('Tin nhắn mới')).toBeInTheDocument();
    expect(screen.getByText('Khuyến mãi hôm nay')).toBeInTheDocument();

    // Check tabs theo API mới
    expect(screen.getByText('Tất cả')).toBeInTheDocument();
    expect(screen.getByText('Giao dịch')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('filters to TRANSACTIONAL only when clicking "Giao dịch" tab', () => {
    render(
      <NotificationListClient
        initialNotifications={mockNotifications}
        initialNextCursor={null}
        initialHasMore={false}
      />,
    );

    fireEvent.click(screen.getByText('Giao dịch'));

    expect(screen.getByText('Booking được xác nhận!')).toBeInTheDocument();
    expect(screen.getByText('Tin nhắn mới')).toBeInTheDocument();
    // MARKETING item ẩn đi
    expect(screen.queryByText('Khuyến mãi hôm nay')).not.toBeInTheDocument();
  });

  it('filters to MARKETING only when clicking "Marketing" tab', () => {
    render(
      <NotificationListClient
        initialNotifications={mockNotifications}
        initialNextCursor={null}
        initialHasMore={false}
      />,
    );

    fireEvent.click(screen.getByText('Marketing'));

    expect(screen.getByText('Khuyến mãi hôm nay')).toBeInTheDocument();
    expect(screen.queryByText('Booking được xác nhận!')).not.toBeInTheDocument();
    expect(screen.queryByText('Tin nhắn mới')).not.toBeInTheDocument();
  });

  it('calls markAllAsRead API and resets unread count when clicking "Đánh dấu tất cả đã đọc"', () => {
    render(
      <NotificationListClient
        initialNotifications={mockNotifications}
        initialNextCursor={null}
        initialHasMore={false}
      />,
    );

    const markAllReadBtn = screen.getByText('Đánh dấu tất cả đã đọc');
    fireEvent.click(markAllReadBtn);

    expect(mockResetUnreadCount).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/read-all', {
      method: 'PATCH',
    });
  });

  it('renders empty state when no notifications are present', () => {
    render(
      <NotificationListClient initialNotifications={[]} initialNextCursor={null} initialHasMore={false} />,
    );

    expect(screen.getByText('Không có thông báo')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bạn không có thông báo nào trong danh mục này hoặc chưa phát sinh hoạt động nào.',
      ),
    ).toBeInTheDocument();
  });

  it('prepends a new realtime notification when custom event "new-notification" is dispatched', () => {
    render(
      <NotificationListClient
        initialNotifications={mockNotifications}
        initialNextCursor={null}
        initialHasMore={false}
      />,
    );

    const newNotif: Notification = {
      id: 'notif-4-realtime',
      title: 'Giao dịch thành công',
      body: 'Bạn vừa nạp 500 coin.',
      eventKind: 'PAYMENT_SUCCESS',
      category: 'TRANSACTIONAL',
      priority: 'HIGH',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('new-notification', { detail: newNotif }));
    });

    expect(screen.getByText('Giao dịch thành công')).toBeInTheDocument();
    expect(screen.getByText('Bạn vừa nạp 500 coin.')).toBeInTheDocument();
  });

  it('renders with companion variant using correct amber/mami classes on active tab', () => {
    render(
      <NotificationListClient
        initialNotifications={mockNotifications}
        initialNextCursor={null}
        initialHasMore={false}
        variant="companion"
      />,
    );

    // Active tab "Tất cả" phải có companion style
    const activeTab = screen.getByText('Tất cả');
    expect(activeTab).toHaveClass('bg-mami-50/50');
    expect(activeTab).toHaveClass('text-amber-600');
  });
});
