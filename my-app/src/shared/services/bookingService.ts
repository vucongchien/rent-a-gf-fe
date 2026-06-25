import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AcceptBookingResponse,
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
    return serverFetch<BookingsResponse>('/bookings', {
      req,
      searchParams: options?.searchParams,
    });
  },

  async getBookingDetail(bookingId: string, options?: ServiceRequestOptions): Promise<BookingDetail | null> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<BookingDetail>(`/bookings/${bookingId}`, { req });
  },

  async createBooking(body: CreateBookingBody, options?: ServiceRequestOptions): Promise<CreateBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CreateBookingResponse>('/bookings', { req, method: 'POST', body });
  },

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

  async acceptBooking(bookingId: string, options?: ServiceRequestOptions): Promise<AcceptBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AcceptBookingResponse>(`/bookings/${bookingId}/accept`, { req, method: 'POST' });
  },

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
