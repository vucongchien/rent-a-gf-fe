import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
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
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<BookingDetail>(`/bookings/${bookingId}`, { req });
  },

  /**
   * Tạo booking mới (Client). Throw lên trên để Server Action map sang state.
   */
  async createBooking(body: CreateBookingBody, options?: ServiceRequestOptions): Promise<CreateBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CreateBookingResponse>('/bookings', { req, method: 'POST', body });
  },

  /** Hủy đặt lịch */
  async cancelBooking(
    bookingId: string,
    reason: CancellationReason,
    options?: ServiceRequestOptions,
  ): Promise<CancelBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CancelBookingResponse>(`/bookings/${bookingId}/cancel`, {
      req,
      method: 'POST',
      body: { reason },
    });
  },

  /** Chấp nhận đặt lịch (Companion) */
  async acceptBooking(bookingId: string, options?: ServiceRequestOptions): Promise<AcceptBookingResponse> {
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
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<RejectBookingResponse>(`/bookings/${bookingId}/reject`, {
      req,
      method: 'POST',
      body: { reason },
    });
  },
};
