import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { companionService } from '@/shared/services/companionService';
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
  BookingListItem,
  BookingStatus,
} from '@/shared/types';

function normalizeBookingStatus(status: string): BookingStatus {
  if (!status) return 'PENDING';
  const cleanStatus = status.replace(/^BOOKING_STATUS_/, '');
  return cleanStatus as BookingStatus;
}

export const bookingService = {
  /**
   * Lấy danh sách booking của user hiện tại (Client hoặc Companion).
   * User-specific → KHÔNG cache. Throw ApiError khi lỗi để caller quyết UI.
   */
  async getBookings(options?: ServiceRequestOptions & {
    searchParams?: URLSearchParams;
  }): Promise<BookingsResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const raw = await serverFetch<any>('/bookings', {
      req,
      searchParams: options?.searchParams,
    });

    if (!raw || !Array.isArray(raw.bookings)) {
      return {
        bookings: [],
        nextPageToken: raw?.nextPageToken ?? null,
      };
    }

    // Thu thập toàn bộ unique companionId từ tất cả bookings.
    // Luôn dùng companionId để fetch tên — API /companions/{id} hoạt động ổn định.
    // API /profiles/{clientId} bị backend trả 404 cho client thông thường nên không dùng.
    const allCompanionIds = Array.from(
      new Set(
        raw.bookings
          .map((b: any) => b.companionId)
          .filter(Boolean)
      )
    ) as string[];

    // Fetch companion details song song (getCompanionDetail có cache 'minutes' → safe)
    const companionDetailsArray = await Promise.all(
      allCompanionIds.map((id) =>
        companionService.getCompanionDetail(id).catch(() => {
          console.warn(`[bookingService.getBookings] Không fetch được companion ${id}`);
          return null;
        })
      )
    );

    const companionMap = new Map(
      allCompanionIds.map((id, index) => [id, companionDetailsArray[index]])
    );

    // Chuẩn hóa và mapping dữ liệu
    const normalizedBookings = raw.bookings.map((b: any): BookingListItem => {
      const cleanStatus = normalizeBookingStatus(b.status);
      const companion = companionMap.get(b.companionId);
      const price = Number(b.price || 0);
      const durationMin = Number(b.durationMinutes || 0);

      // Tìm scenario từ companion profile để lấy title
      const scenario = companion?.scenarios?.find(
        (s) => Number(s.price) === price && Number(s.durationMinutes) === durationMin
      );

      const partnerName = companion?.displayName || `Bạn đồng hành #${b.companionId?.slice(0, 6) ?? '?'}`;
      const partnerAvatar = companion?.avatarUrl || '';

      return {
        bookingId: b.bookingId || '',
        partnerName,
        partnerAvatar,
        scenarioTitle: scenario?.title || 'Kịch bản hẹn hò',
        price,
        startTime: b.startTime || b.createdAt || '',
        endTime: b.endTime || '',
        chatRoomId: b.chatRoomId || null,
        hasReviewed: !!b.hasReviewed,
        status: cleanStatus,
      };
    });

    return {
      bookings: normalizedBookings,
      nextPageToken: raw.nextPageToken ?? null,
    };
  },

  async getBookingDetail(bookingId: string, options?: ServiceRequestOptions): Promise<BookingDetail | null> {
    const req = await getRequestCookieHeader(options?.req);
    const raw = await serverFetch<any>(`/bookings/${bookingId}`, { req });
    if (!raw) return null;


    const priceNum = Number(raw.price || (raw.scenarioSnapshot?.price) || 0);
    const durationMinNum = Number(raw.durationMinutes || (raw.scenarioSnapshot?.durationMinutes) || 0);
    const cleanStatus = normalizeBookingStatus(raw.status);

    let scenarioSnapshot = raw.scenarioSnapshot;
    if (!scenarioSnapshot) {
      try {
        const companion = await companionService.getCompanionDetail(raw.companionId).catch(() => null);
        const scenario = companion?.scenarios?.find(
          (s) => Number(s.price) === priceNum && Number(s.durationMinutes) === durationMinNum
        );
        scenarioSnapshot = {
          title: scenario?.title || 'Kịch bản hẹn hò',
          price: priceNum,
          durationMinutes: durationMinNum,
        };
      } catch (err) {
        console.warn(`[bookingService.getBookingDetail] Lỗi dựng scenarioSnapshot cho booking ${bookingId}:`, err);
        scenarioSnapshot = {
          title: 'Kịch bản hẹn hò',
          price: priceNum,
          durationMinutes: durationMinNum,
        };
      }
    } else {
      scenarioSnapshot = {
        title: scenarioSnapshot.title || 'Kịch bản hẹn hò',
        price: Number(scenarioSnapshot.price || 0),
        durationMinutes: Number(scenarioSnapshot.durationMinutes || 0),
      };
    }

    return {
      bookingId: raw.bookingId || '',
      clientId: raw.clientId || '',
      companionId: raw.companionId || '',
      scenarioSnapshot,
      startTime: raw.startTime || raw.createdAt || '',
      endTime: raw.endTime || '',
      status: cleanStatus,
      chatRoomId: raw.chatRoomId || null,
      chatRoomStatus: raw.chatRoomStatus || 'INACTIVE',
      hasReviewed: !!raw.hasReviewed,
    };
  },

  async createBooking(body: CreateBookingBody, options?: ServiceRequestOptions): Promise<CreateBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const raw = await serverFetch<any>('/bookings', { req, method: 'POST', body });
    if (!raw) return raw;
    return {
      ...raw,
      status: normalizeBookingStatus(raw.status),
    };
  },

  async cancelBooking(
    bookingId: string,
    reason: CancellationReason,
    options?: ServiceRequestOptions,
  ): Promise<CancelBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const raw = await serverFetch<any>(`/bookings/${bookingId}/cancel`, {
      req,
      method: 'POST',
      body: { reason },
    });
    if (!raw) return raw;
    return {
      ...raw,
      status: normalizeBookingStatus(raw.status) as 'CANCELLED',
    };
  },

  async acceptBooking(bookingId: string, options?: ServiceRequestOptions): Promise<AcceptBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const raw = await serverFetch<any>(`/bookings/${bookingId}/accept`, { req, method: 'POST' });
    if (!raw) return raw;
    return {
      ...raw,
      status: normalizeBookingStatus(raw.status),
    };
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
    const raw = await serverFetch<any>(`/bookings/${bookingId}/complete`, {
      req,
      method: 'POST',
    });
    if (!raw) return raw;
    return {
      ...raw,
      status: normalizeBookingStatus(raw.status),
    };
  },

  async rejectBooking(
    bookingId: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<RejectBookingResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const raw = await serverFetch<any>(`/bookings/${bookingId}/reject`, {
      req,
      method: 'POST',
      body: { reason },
    });
    if (!raw) return raw;
    return {
      ...raw,
      status: normalizeBookingStatus(raw.status),
    };
  },
};
