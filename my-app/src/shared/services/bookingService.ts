import { serverFetch } from '@/shared/lib/apiClient';
import { mockBookings } from '@/mocks/fixtures/data';
import type { Booking, CreateBookingBody, CreateBookingResult, ServiceRequestOptions, ApiResponse } from '@/shared/types';
import { cookies } from 'next/headers';

// Helper tự động lấy cookie header từ next/headers nếu không truyền req từ Route Handler
async function getRequestCookieHeader(req?: { headers: { get(name: string): string | null } }) {
  if (req) return req;
  try {
    const cookieStore = await cookies();
    return {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'cookie') {
            return cookieStore.toString();
          }
          return null;
        }
      }
    };
  } catch {
    return undefined;
  }
}

export const bookingService = {
  /**
   * Lấy danh sách booking của user hiện tại
   */
  async getBookings(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<{
    items: Booking[];
    total: number;
    hasNextPage: boolean;
  }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      // Offline mock data
      return {
        items: mockBookings as Booking[],
        total: mockBookings.length,
        hasNextPage: false,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<{
        data: {
          items: Booking[];
          meta: { total: number; hasNextPage: boolean };
        }
      }>('/bookings', {
        req,
        searchParams: options?.searchParams,
      });

      return {
        items: raw.data.items,
        total: raw.data.meta.total,
        hasNextPage: raw.data.meta.hasNextPage,
      };
    } catch (err) {
      console.error('[bookingService] Lỗi fetch bookings:', err);
      return { items: [], total: 0, hasNextPage: false };
    }
  },

  /**
   * Lấy chi tiết một lịch hẹn
   */
  async getBookingDetail(bookingId: string, options?: ServiceRequestOptions): Promise<Booking | null> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const found = mockBookings.find(b => b.id === bookingId);
      return (found as Booking) || null;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<{ data: Booking }>(`/bookings/${bookingId}`, { req });
      return raw.data;
    } catch (err) {
      console.error(`[bookingService] Lỗi fetch booking detail ${bookingId}:`, err);
      return null;
    }
  },

  /**
   * Tạo lịch hẹn mới
   */
  async createBooking(body: CreateBookingBody, options?: ServiceRequestOptions): Promise<CreateBookingResult> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      // NOTE: Không modify mockWallet ở đây - Server Action chạy trong Node.js,
      // còn MSW (source of truth cho wallet) chạy trong Browser Service Worker.
      // Đây là 2 process/module instance riêng biệt - mutation server-side vô nghĩa.
      // Việc trừ coin được xử lý bởi MSW POST /api/bookings handler (browser-side).
      return {
        id: `bk-${Date.now()}`,
        status: 'PENDING',
        frozenCoin: 150,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<{
        data: { bookingId: string; status: string; frozenCoin: number }
      }>('/bookings', {
        req,
        method: 'POST',
        body,
      });

      return {
        id: raw.data.bookingId,
        status: raw.data.status as CreateBookingResult['status'],
        frozenCoin: raw.data.frozenCoin,
      };
    } catch (err) {
      console.error('[bookingService] Lỗi tạo booking:', err);
      throw err;
    }
  },

  /**
   * Chấp nhận đặt lịch (cho Companion)
   */
  async acceptBooking(bookingId: string, options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean; status: string }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { data: { success: true, status: 'ACCEPTED' } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean; status: string }>>(`/bookings/${bookingId}/accept`, {
      req,
      method: 'PATCH',
    });
  },

  /**
   * Từ chối đặt lịch (cho Companion)
   */
  async rejectBooking(bookingId: string, options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean; status: string }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { data: { success: true, status: 'REJECTED' } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean; status: string }>>(`/bookings/${bookingId}/reject`, {
      req,
      method: 'PATCH',
    });
  },

  /**
   * Hủy đặt lịch (cho Client/Companion)
   */
  async cancelBooking(bookingId: string, options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean; status: string }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { data: { success: true, status: 'CANCELLED' } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean; status: string }>>(`/bookings/${bookingId}/cancel`, {
      req,
      method: 'PATCH',
    });
  }
};
