import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/shared/types';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockDecrement = vi.fn();
vi.mock('@/shared/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    decrementUnreadCount: mockDecrement,
  }),
}));

// Mock fetch toàn cục
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
});
global.fetch = mockFetch;

describe('NotificationItem', () => {
  const mockMarkAsReadLocal = vi.fn();

  /**
   * Fixture: booking notification với senderAvatar.
   * eventKind = 'BOOKING_ACCEPTED' → icon là CheckIcon, nhưng có senderAvatar
   * nên shouldRenderAvatar = false (chỉ BOOKING_REQUESTED | CHAT_MESSAGE | NEW_REVIEW mới show avatar).
   */
  const mockBookingNotification: Notification = {
    id: 'notif-1',
    title: 'Booking được xác nhận!',
    body: 'Linh đã xác nhận lịch hẹn Cà phê của bạn.',
    eventKind: 'BOOKING_ACCEPTED',
    category: 'TRANSACTIONAL',
    priority: 'HIGH',
    isRead: false,
    actionUrl: '/bookings/bk-1',
    bookingId: 'bk-1',
    senderName: 'Nguyễn Thị Linh',
    senderAvatar: 'https://example.com/linh.jpg',
    createdAt: new Date().toISOString(),
  };

  /**
   * Fixture: booking_requested notification — loại này MỚI hiển thị avatar.
   */
  const mockBookingRequestedWithAvatar: Notification = {
    id: 'notif-0',
    title: 'Yêu cầu đặt lịch mới',
    body: 'Kazuya muốn hẹn xem phim.',
    eventKind: 'BOOKING_REQUESTED',
    category: 'TRANSACTIONAL',
    priority: 'HIGH',
    isRead: false,
    actionUrl: '/dashboard/requests/bk-0',
    bookingId: 'bk-0',
    senderName: 'Kazuya',
    senderAvatar: 'https://example.com/kazuya.jpg',
    createdAt: new Date().toISOString(),
  };

  /**
   * Fixture: system notification đã đọc, không có senderAvatar.
   */
  const mockSystemNotification: Notification = {
    id: 'notif-2',
    title: 'Hệ thống bảo trì',
    body: 'Bảo trì từ 2h-4h sáng.',
    eventKind: 'SYSTEM_MAINTENANCE',
    category: 'TRANSACTIONAL',
    priority: 'LOW',
    isRead: true,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and body correctly', () => {
    render(
      <NotificationItem notification={mockBookingNotification} onMarkAsReadLocal={mockMarkAsReadLocal} />,
    );

    expect(screen.getByText('Booking được xác nhận!')).toBeInTheDocument();
    expect(screen.getByText('Linh đã xác nhận lịch hẹn Cà phê của bạn.')).toBeInTheDocument();
  });

  it('renders Avatar for BOOKING_REQUESTED when senderAvatar is provided', () => {
    render(
      <NotificationItem
        notification={mockBookingRequestedWithAvatar}
        onMarkAsReadLocal={mockMarkAsReadLocal}
      />,
    );

    const avatarImg = screen.getByAltText('Kazuya');
    expect(avatarImg).toBeInTheDocument();
  });

  it('renders icon (not avatar) for BOOKING_ACCEPTED even when senderAvatar is set', () => {
    render(
      <NotificationItem notification={mockBookingNotification} onMarkAsReadLocal={mockMarkAsReadLocal} />,
    );

    // BOOKING_ACCEPTED không thuộc danh sách show avatar
    expect(screen.queryByAltText('Nguyễn Thị Linh')).not.toBeInTheDocument();
  });

  it('renders icon instead of avatar for SYSTEM_MAINTENANCE (no avatar)', () => {
    render(
      <NotificationItem notification={mockSystemNotification} onMarkAsReadLocal={mockMarkAsReadLocal} />,
    );

    expect(screen.getByText('Hệ thống bảo trì')).toBeInTheDocument();
    expect(screen.queryByAltText('Nguyễn Thị Linh')).not.toBeInTheDocument();
  });

  it('does NOT render unread dot indicator for read notifications', () => {
    render(
      <NotificationItem notification={mockSystemNotification} onMarkAsReadLocal={mockMarkAsReadLocal} />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('calls onMarkAsReadLocal, decrementUnreadCount, fetch PATCH, and redirects on click', async () => {
    render(
      <NotificationItem notification={mockBookingNotification} onMarkAsReadLocal={mockMarkAsReadLocal} />,
    );

    const container = screen.getByRole('button');
    fireEvent.click(container);

    // Optimistic UI: gọi ngay không cần await
    expect(mockMarkAsReadLocal).toHaveBeenCalledWith('notif-1');
    expect(mockDecrement).toHaveBeenCalled();

    // Gọi fetch PATCH đánh dấu đã đọc
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/notif-1/read', {
      method: 'PATCH',
    });

    // Redirect về actionUrl
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/bookings/bk-1');
    });
  });

  it('does NOT call fetch or redirect when notification is already read', async () => {
    render(
      <NotificationItem notification={mockSystemNotification} onMarkAsReadLocal={mockMarkAsReadLocal} />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockMarkAsReadLocal).not.toHaveBeenCalled();
    expect(mockDecrement).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
    // isRead + no actionUrl → không redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders with companion variant applying correct mami/amber classes for unread card', () => {
    render(
      <NotificationItem
        notification={mockBookingNotification}
        onMarkAsReadLocal={mockMarkAsReadLocal}
        variant="companion"
      />,
    );

    const container = screen.getByRole('button');
    expect(container).toHaveClass('bg-mami-50/10');
    expect(container).toHaveClass('border-mami-100/20');
  });

  it('renders with client variant (default) applying chizuru classes for unread card', () => {
    render(
      <NotificationItem notification={mockBookingNotification} onMarkAsReadLocal={mockMarkAsReadLocal} />,
    );

    const container = screen.getByRole('button');
    expect(container).toHaveClass('bg-chizuru-50/10');
    expect(container).toHaveClass('border-chizuru-100/20');
  });
});
