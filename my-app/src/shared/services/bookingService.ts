import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { mockBookings, currentMockUser } from '@/mocks/fixtures/data';
import type {
  AcceptBookingResponse,
  BookingListItem,
  BookingDetail,
  CancellationReason,
  CancelBookingResponse,
  CompleteBookingResponse,
  CreateBookingBody,
  CreateBookingResponse,
  BookingsResponse,
  CreateReviewBody,
  CreateReviewResponse,
  RejectBookingResponse,
  ServiceRequestOptions,
} from '@/shared/types';

export const bookingService = {
  /**
   * Lấy danh sách booking của user hiện tại (Client hoặc Companion).
   * User-specific → KHÔNG cache. Throw ApiError khi lỗi để caller quyết UI.
   */
  async getBookings(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<BookingsResponse> {
    if (isMockMode()) {
      if (!currentMockUser) {
        return { bookings: [], nextPageToken: null };
      }
      const mappedBookings: BookingListItem[] = mockBookings.map(b => ({
        bookingId: b.bookingId,
        partnerName: b.companionName,
        partnerAvatar: b.companionAvatarUrl,
        scenarioTitle: b.scenarioTitle,
        price: b.price,
        startTime: b.startTime,
        endTime: b.endTime,
        chatRoomId: b.chatRoomId,
        hasReviewed: b.hasReviewed,
        status: b.status,
      }));
      // Mock dataset nhỏ → trả hết, nextPageToken=null.
      return { bookings: mappedBookings, nextPageToken: null };
    }

    const req = await getRequestCookieHeader(options?.req);
    // Pass-through SSOT response (`{ bookings, nextPageToken }`).
    return serverFetch<BookingsResponse>('/bookings', {
      req,
      searchParams: options?.searchParams,
    });
  },

  /**
   * Chi tiết booking. Throw ApiError nếu lỗi; trả null chỉ khi mock không tìm thấy.
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
    return serverFetch<BookingDetail>(`/bookings/${bookingId}`, { req });
  },

  /**
   * Tạo booking mới (Client). Throw lên trên để Server Action map sang state.
   */
  async createBooking(body: CreateBookingBody, options?: ServiceRequestOptions): Promise<CreateBookingResponse> {
    if (isMockMode()) {
      if (!currentMockUser) throw new Error('Unauthorized');
      return {
        bookingId: `bk-${Date.now()}`,
        clientId: 'u-client-1',
        companionId: body.companionId,
        scenarioSnapshot: {
          title: 'Cà phê & trò chuyện',
          price: 150,
          durationMinutes: 60,
          publicPlace: 'Quận 1, TP.HCM',
        },
        startTime: body.startTime,
        endTime: new Date(new Date(body.startTime).getTime() + 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
      };
    }

    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CreateBookingResponse>('/bookings', { req, method: 'POST', body });
  },

  /** Hủy đặt lịch */
  async cancelBooking(
    bookingId: string,
    reason: CancellationReason,
    options?: ServiceRequestOptions,
  ): Promise<CancelBookingResponse> {
    if (isMockMode()) {
      return { bookingId, status: 'CANCELLED', refundAmount: 150, compensationAmount: 0 };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CancelBookingResponse>(`/bookings/${bookingId}/cancel`, {
      req,
      method: 'POST',
      body: { reason },
    });
  },

  /** Chấp nhận đặt lịch (Companion) */
  async acceptBooking(bookingId: string, options?: ServiceRequestOptions): Promise<AcceptBookingResponse> {
    if (isMockMode()) {
      return { bookingId, status: 'ACCEPTED', chatRoomId: `room-${bookingId}` };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AcceptBookingResponse>(`/bookings/${bookingId}/accept`, { req, method: 'POST' });
  },

  /**
   * Submit review cho booking đã COMPLETED (Client).
   * SSOT: POST /interaction/reviews { bookingId, clientId, companionId, rating, comment }.
   * Mock mode: tự sinh review id + flip hasReviewed=true trong fixture để flow test được.
   */
  async submitReview(
    body: CreateReviewBody,
    options?: ServiceRequestOptions,
  ): Promise<CreateReviewResponse> {
    if (isMockMode()) {
      const found = mockBookings.find(b => b.bookingId === body.bookingId);
      if (!found) throw new Error('Booking không tồn tại');
      if (found.status !== 'COMPLETED') throw new Error('Chỉ review được booking đã hoàn thành');
      if (found.hasReviewed) throw new Error('Bạn đã đánh giá booking này');
      found.hasReviewed = true;
      const now = new Date().toISOString();
      return {
        reviewId: `rv-${Date.now()}`,
        bookingId: body.bookingId,
        clientId: body.clientId || found.clientId,
        companionId: body.companionId || found.companionId,
        rating: body.rating,
        comment: body.comment,
        createdAt: now,
        updatedAt: now,
      };
    }

    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CreateReviewResponse>('/interaction/reviews', {
      req,
      method: 'POST',
      body,
    });
  },

  /**
   * Đánh dấu booking hoàn thành.
   * SSOT: POST /bookings/{id}/complete (body rỗng) → `{ bookingId, status, message }`.
   */
  async completeBooking(
    bookingId: string,
    options?: ServiceRequestOptions,
  ): Promise<CompleteBookingResponse> {
    if (isMockMode()) {
      const found = mockBookings.find(b => b.bookingId === bookingId);
      if (found) {
        found.status = 'COMPLETED';
      }
      return {
        bookingId,
        status: 'BOOKING_STATUS_COMPLETED',
        message: 'Booking completed successfully',
      };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CompleteBookingResponse>(`/bookings/${bookingId}/complete`, {
      req,
      method: 'POST',
    });
  },

  /** Từ chối đặt lịch (Companion) */
  async rejectBooking(
    bookingId: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<RejectBookingResponse> {
    if (isMockMode()) {
      return { bookingId, status: 'REJECTED' };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<RejectBookingResponse>(`/bookings/${bookingId}/reject`, {
      req,
      method: 'POST',
      body: { reason },
    });
  },
};
