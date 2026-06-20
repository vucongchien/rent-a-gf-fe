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
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'Booking được xác nhận!',
      body: 'Linh đã đồng ý.',
      type: 'BOOKING_ACCEPTED',
      category: 'TRANSACTIONAL',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      title: 'Tin nhắn mới',
      body: 'Alo alo.',
      type: 'CHAT_MESSAGE',
      category: 'INTERACTION',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-3',
      title: 'Hệ thống bảo trì',
      body: 'Nâng cấp hệ thống.',
      type: 'SYSTEM_MAINTENANCE',
      category: 'PROMOTIONAL',
      isRead: true,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all notifications and filter tabs', () => {
    render(<NotificationListClient initialNotifications={mockNotifications} total={3} />);

    expect(screen.getByText('Booking được xác nhận!')).toBeInTheDocument();
    expect(screen.getByText('Tin nhắn mới')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống bảo trì')).toBeInTheDocument();
    
    // Check tabs
    expect(screen.getByText('Tất cả')).toBeInTheDocument();
    expect(screen.getByText('Giao dịch')).toBeInTheDocument();
    expect(screen.getByText('Tương tác')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống')).toBeInTheDocument();
  });

  it('filters notifications when clicking tabs', () => {
    render(<NotificationListClient initialNotifications={mockNotifications} total={3} />);

    // Click on "Tương tác" tab
    const interactionTab = screen.getByText('Tương tác');
    fireEvent.click(interactionTab);

    // Should only show interaction notification (notif-2)
    expect(screen.getByText('Tin nhắn mới')).toBeInTheDocument();
    expect(screen.queryByText('Booking được xác nhận!')).not.toBeInTheDocument();
    expect(screen.queryByText('Hệ thống bảo trì')).not.toBeInTheDocument();
  });

  it('calls markAllAsRead API and updates local state on clicking mark all read button', () => {
    render(<NotificationListClient initialNotifications={mockNotifications} total={3} />);

    const markAllReadBtn = screen.getByText('Đánh dấu tất cả đã đọc');
    fireEvent.click(markAllReadBtn);

    expect(mockResetUnreadCount).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/read-all', {
      method: 'PATCH',
    });
  });

  it('renders empty state when no notifications are present', () => {
    render(<NotificationListClient initialNotifications={[]} total={0} />);

    expect(screen.getByText('Không có thông báo')).toBeInTheDocument();
    expect(screen.getByText('Bạn không có thông báo nào trong danh mục này hoặc chưa phát sinh hoạt động nào.')).toBeInTheDocument();
  });

  it('prepends a new notification when custom event new-notification is dispatched', () => {
    render(<NotificationListClient initialNotifications={mockNotifications} total={3} />);

    // Dispatch custom event
    const newNotif: Notification = {
      id: 'notif-4-realtime',
      title: 'Giao dịch thành công',
      body: 'Bạn vừa nạp 500 coin.',
      type: 'PAYMENT_SUCCESS',
      category: 'TRANSACTIONAL',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('new-notification', { detail: newNotif }));
    });

    // Check if new notification is in the document
    expect(screen.getByText('Giao dịch thành công')).toBeInTheDocument();
    expect(screen.getByText('Bạn vừa nạp 500 coin.')).toBeInTheDocument();
  });
});
