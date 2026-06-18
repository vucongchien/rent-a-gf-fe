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
   * Lấy danh sách booking của Client
   */
  async getClientBookings(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<{
    items: Booking[];
    total: number;
    hasNextPage: boolean;
  }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const clientBookings = mockBookings.filter(b => b.clientId === 'u-client-1');
      return {
        items: clientBookings as Booking[],
        total: clientBookings.length,
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
      }>('/client/bookings', {
        req,
        searchParams: options?.searchParams,
      });

      return {
        items: raw.data.items,
        total: raw.data.meta.total,
        hasNextPage: raw.data.meta.hasNextPage,
      };
    } catch (err) {
      console.error('[bookingService] Lỗi fetch client bookings:', err);
      return { items: [], total: 0, hasNextPage: false };
    }
  },

  /**
   * Lấy chi tiết lịch hẹn của Client
   */
  async getClientBookingDetail(bookingId: string, options?: ServiceRequestOptions): Promise<Booking | null> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const found = mockBookings.find(b => b.id === bookingId && b.clientId === 'u-client-1');
      return (found as Booking) || null;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<{ data: Booking }>(`/client/bookings/${bookingId}`, { req });
      return raw.data;
    } catch (err) {
      console.error(`[bookingService] Lỗi fetch client booking detail ${bookingId}:`, err);
      return null;
    }
  },

  /**
   * Tạo lịch hẹn mới (Client)
   */
  async createBooking(body: CreateBookingBody, options?: ServiceRequestOptions): Promise<CreateBookingResult> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
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
      }>('/client/bookings', {
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
   * Hủy đặt lịch (Client)
   */
  async cancelBooking(bookingId: string, options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean; status: string }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { data: { success: true, status: 'CANCELLED' } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean; status: string }>>(`/client/bookings/${bookingId}/cancel`, {
      req,
      method: 'PATCH',
    });
  },

  /**
   * Lấy danh sách booking của Companion
   */
  async getCompanionBookings(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<{
    items: Booking[];
    total: number;
    hasNextPage: boolean;
  }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const compBookings = mockBookings.filter(b => b.companionId === 'comp-1');
      return {
        items: compBookings as Booking[],
        total: compBookings.length,
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
      }>('/companion/bookings', {
        req,
        searchParams: options?.searchParams,
      });

      return {
        items: raw.data.items,
        total: raw.data.meta.total,
        hasNextPage: raw.data.meta.hasNextPage,
      };
    } catch (err) {
      console.error('[bookingService] Lỗi fetch companion bookings:', err);
      return { items: [], total: 0, hasNextPage: false };
    }
  },

  /**
   * Lấy chi tiết lịch hẹn của Companion
   */
  async getCompanionBookingDetail(bookingId: string, options?: ServiceRequestOptions): Promise<Booking | null> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const found = mockBookings.find(b => b.id === bookingId && b.companionId === 'comp-1');
      return (found as Booking) || null;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<{ data: Booking }>(`/companion/bookings/${bookingId}`, { req });
      return raw.data;
    } catch (err) {
      console.error(`[bookingService] Lỗi fetch companion booking detail ${bookingId}:`, err);
      return null;
    }
  },

  /**
   * Chấp nhận đặt lịch (Companion)
   */
  async acceptBooking(bookingId: string, options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean; status: string }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { data: { success: true, status: 'ACCEPTED' } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean; status: string }>>(`/companion/bookings/${bookingId}/accept`, {
      req,
      method: 'PATCH',
    });
  },

  /**
   * Từ chối đặt lịch (Companion)
   */
  async rejectBooking(bookingId: string, options?: ServiceRequestOptions): Promise<ApiResponse<{ success: boolean; status: string }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { data: { success: true, status: 'REJECTED' } };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<ApiResponse<{ success: boolean; status: string }>>(`/companion/bookings/${bookingId}/reject`, {
      req,
      method: 'PATCH',
    });
  }
};
