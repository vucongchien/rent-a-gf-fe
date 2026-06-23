import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { mockBookings, currentMockUser } from '@/mocks/fixtures/data';
import type { BookingListItem, BookingDetail, CreateBookingBody, CreateBookingResponse, CancelBookingResponse, BookingsResponse, ServiceRequestOptions } from '@/shared/types';

export const bookingService = {
  /**
   * Lấy danh sách booking (Dùng chung cho cả Client và Companion)
   */
  async getBookings(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<BookingsResponse> {
    if (isMockMode()) {
      if (!currentMockUser) {
        return {
          bookings: [],
          total: 0,
          page: 1,
          pageSize: 10,
        };
      }
      // Mock: trả về bookings của user hiện tại
      // Đối với mock, giả định client-1
      const mappedBookings: BookingListItem[] = mockBookings.map(b => ({
        bookingId: b.bookingId,
        partnerName: b.companionName,
        partnerAvatar: b.companionAvatarUrl,
        scenarioTitle: b.scenarioTitle,
        price: b.price,
        startTime: b.startTime,
        chatRoomId: b.chatRoomId,
        hasReviewed: b.hasReviewed,
        status: b.status,
      }));

      return {
        bookings: mappedBookings,
        total: mappedBookings.length,
        page: 1,
        pageSize: 10,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<BookingsResponse>('/bookings', {
        req,
        searchParams: options?.searchParams,
      });

      return raw;
    } catch (err) {
      console.error('[bookingService] Lỗi fetch bookings:', err);
      return { bookings: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  /**
   * Lấy chi tiết lịch hẹn
   */
  async getBookingDetail(bookingId: string, options?: ServiceRequestOptions): Promise<BookingDetail | null> {
    if (isMockMode()) {
      if (!currentMockUser) return null;
      const found = mockBookings.find(b => b.bookingId === bookingId);
      if (!found) return null;
      return {
        bookingId: found.bookingId,
        clientId: found.clientId,
        companionId: found.companionId,
        scenarioSnapshot: found.scenarioSnapshot,
        startTime: found.startTime,
        endTime: found.endTime,
        status: found.status,
        chatRoomId: found.chatRoomId,
        chatRoomStatus: found.chatRoomStatus,
        hasReviewed: found.hasReviewed,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<BookingDetail>(`/bookings/${bookingId}`, { req });
      return raw;
    } catch (err) {
      console.error(`[bookingService] Lỗi fetch booking detail ${bookingId}:`, err);
      return null;
    }
  },

  /**
   * Tạo lịch hẹn mới (Client)
   */
  async createBooking(body: CreateBookingBody, options?: ServiceRequestOptions): Promise<CreateBookingResponse> {
    if (isMockMode()) {
      if (!currentMockUser) {
        throw new Error('Unauthorized');
      }
      return {
        bookingId: `bk-${Date.now()}`,
        clientId: 'u-client-1',
        companionId: body.companionId,
        scenarioSnapshot: {
          title: 'Cà phê & trò chuyện',
          price: 150,
          durationMinutes: 60,
          publicPlace: 'Quận 1, TP.HCM'
        },
        startTime: body.startTime,
        endTime: new Date(new Date(body.startTime).getTime() + 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      const raw = await serverFetch<CreateBookingResponse>('/bookings', {
        req,
        method: 'POST',
        body,
      });

      return raw;
    } catch (err) {
      console.error('[bookingService] Lỗi tạo booking:', err);
      throw err;
    }
  },

  /**
   * Hủy đặt lịch
   */
  async cancelBooking(bookingId: string, options?: ServiceRequestOptions): Promise<CancelBookingResponse> {
    if (isMockMode()) {
      return {
        bookingId,
        status: 'CANCELLED',
        refundAmount: 150,
        compensationAmount: 0
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<CancelBookingResponse>(`/bookings/${bookingId}/cancel`, {
      req,
      method: 'PUT',
    });
  },

  /**
   * Chấp nhận đặt lịch (Companion)
   */
  async acceptBooking(bookingId: string, options?: ServiceRequestOptions): Promise<{ bookingId: string; status: string; chatRoomId: string }> {
    if (isMockMode()) {
      return { bookingId, status: 'ACCEPTED', chatRoomId: `room-${bookingId}` };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<{ bookingId: string; status: string; chatRoomId: string }>(`/bookings/${bookingId}/accept`, {
      req,
      method: 'PUT',
    });
  },

  /**
   * Từ chối đặt lịch (Companion)
   */
  async rejectBooking(bookingId: string, options?: ServiceRequestOptions): Promise<{ bookingId: string; status: string }> {
    if (isMockMode()) {
      return { bookingId, status: 'REJECTED' };
    }

    const req = await getRequestCookieHeader(options?.req);

    return serverFetch<{ bookingId: string; status: string }>(`/bookings/${bookingId}/reject`, {
      req,
      method: 'PUT',
    });
  }
};

