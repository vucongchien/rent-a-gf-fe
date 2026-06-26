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

  const mockBookingNotification: Notification = {
    id: 'notif-1',
    title: 'Booking được xác nhận!',
    body: 'Linh đã xác nhận lịch hẹn Cà phê của bạn.',
    type: 'BOOKING_ACCEPTED',
    category: 'TRANSACTIONAL',
    isRead: false,
    actionUrl: '/bookings/bk-1',
    bookingId: 'bk-1',
    senderName: 'Nguyễn Thị Linh',
    senderAvatar: 'https://example.com/linh.jpg',
    createdAt: new Date().toISOString(),
  };

  const mockSystemNotification: Notification = {
    id: 'notif-2',
    title: 'Hệ thống bảo trì',
    body: 'Bảo trì từ 2h-4h sáng.',
    type: 'SYSTEM_MAINTENANCE',
    category: 'PROMOTIONAL',
    isRead: true,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders avatar for booking notifications when senderAvatar is provided', () => {
    render(
      <NotificationItem
        notification={mockBookingNotification}
        onMarkAsReadLocal={mockMarkAsReadLocal}
      />
    );

    expect(screen.getByText('Booking được xác nhận!')).toBeInTheDocument();
    expect(screen.getByText('Linh đã xác nhận lịch hẹn Cà phê của bạn.')).toBeInTheDocument();
    
    // Check if Avatar is rendered with the correct alt text
    const avatarImg = screen.getByAltText('Nguyễn Thị Linh');
    expect(avatarImg).toBeInTheDocument();
  });

  it('renders icon instead of avatar for system/promotional notifications', () => {
    render(
      <NotificationItem
        notification={mockSystemNotification}
        onMarkAsReadLocal={mockMarkAsReadLocal}
      />
    );

    expect(screen.getByText('Hệ thống bảo trì')).toBeInTheDocument();
    expect(screen.getByText('Bảo trì từ 2h-4h sáng.')).toBeInTheDocument();
    
    // Avatar should NOT be in the document
    expect(screen.queryByAltText('Nguyễn Thị Linh')).not.toBeInTheDocument();
    // Dot indicator should NOT be rendered since it's already read (isRead: true)
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('calls onMarkAsReadLocal, decrementUnreadCount, calls fetch API and redirects on click', async () => {
    render(
      <NotificationItem
        notification={mockBookingNotification}
        onMarkAsReadLocal={mockMarkAsReadLocal}
      />
    );

    const container = screen.getByRole('button');
    fireEvent.click(container);

    // Should call local update callback immediately (Optimistic UI)
    expect(mockMarkAsReadLocal).toHaveBeenCalledWith('notif-1');
    expect(mockDecrement).toHaveBeenCalled();

    // Should call fetch PATCH API
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/notif-1/read', {
      method: 'PATCH',
    });

    // Should route to actionUrl
    await waitFor(() => {
       expect(mockPush).toHaveBeenCalledWith('/bookings/bk-1');
    });
  });

  it('renders with companion variant using correct classes for unread card and indicators', () => {
    render(
      <NotificationItem
        notification={mockBookingNotification}
        onMarkAsReadLocal={mockMarkAsReadLocal}
        variant="companion"
      />
    );

    // Unread container should have bg-mami classes
    const container = screen.getByRole('button');
    expect(container).toHaveClass('bg-mami-50/10');
    expect(container).toHaveClass('border-mami-100/20');
  });
});
