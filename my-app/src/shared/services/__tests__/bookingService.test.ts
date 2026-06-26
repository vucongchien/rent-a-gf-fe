import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('@/shared/lib/tokenRefresh', () => ({
  refreshTokensFromCookie: vi.fn(),
}));

vi.mock('../companionService', () => ({
  companionService: {
    getCompanionDetail: vi.fn(),
  },
}));

import { cookies, headers } from 'next/headers';
import { companionService } from '../companionService';
import { bookingService } from '../bookingService';

/**
 * bookingService.test.ts
 *
 * Test suite cho `getBookings`:
 * - Logic đơn giản: luôn dùng companionId để fetch companion name.
 * - Không còn tách role (CLIENT vs COMPANION), không còn gọi /profiles/{clientId}.
 */
describe('bookingService.getBookings', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1';
    vi.mocked(cookies).mockResolvedValue({
      toString: () => 'access_token=jwt-token',
    } as never);
    vi.mocked(headers).mockResolvedValue({
      get: () => null,
    } as never);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    vi.restoreAllMocks();
  });

  it('luôn gọi companionService.getCompanionDetail với companionId bất kể role', async () => {
    // Mock companion detail trả về tên rõ ràng
    vi.mocked(companionService.getCompanionDetail).mockResolvedValue({
      companionId: 'comp-001',
      displayName: 'Mochi Yamamoto',
      avatarUrl: 'https://avatar.test/mochi.png',
      scenarios: [
        {
          scenarioId: 'sc-1',
          title: 'Cà phê buổi sáng',
          description: '',
          price: 100,
          durationMinutes: 60,
          publicPlace: 'The Coffee House',
        },
      ],
      biography: '',
      albumUrls: [],
      voiceIntroUrl: null,
      availableCities: [],
      averageRating: 4.8,
      totalReviews: 12,
    });

    // Mock fetch trả về bookings API
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          bookings: [
            {
              bookingId: 'bk-001',
              clientId: 'client-abc',
              companionId: 'comp-001',
              price: '100',
              durationMinutes: '60',
              status: 'BOOKING_STATUS_ACCEPTED',
              startTime: '2026-06-26T10:00:00Z',
              endTime: '2026-06-26T11:00:00Z',
            },
          ],
          nextPageToken: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await bookingService.getBookings();

    // Kết quả đúng
    expect(result.bookings).toHaveLength(1);
    expect(result.bookings[0].bookingId).toBe('bk-001');

    // partnerName lấy từ companion displayName
    expect(result.bookings[0].partnerName).toBe('Mochi Yamamoto');
    expect(result.bookings[0].partnerAvatar).toBe('https://avatar.test/mochi.png');

    // scenarioTitle khớp đúng với price+duration
    expect(result.bookings[0].scenarioTitle).toBe('Cà phê buổi sáng');

    // companionService.getCompanionDetail được gọi với đúng companionId
    expect(companionService.getCompanionDetail).toHaveBeenCalledWith('comp-001');
    expect(companionService.getCompanionDetail).toHaveBeenCalledTimes(1);
  });

  it('không gọi trùng lặp nếu nhiều booking có cùng companionId', async () => {
    vi.mocked(companionService.getCompanionDetail).mockResolvedValue({
      companionId: 'comp-001',
      displayName: 'Mochi Yamamoto',
      avatarUrl: '',
      scenarios: [],
      biography: '',
      albumUrls: [],
      voiceIntroUrl: null,
      availableCities: [],
      averageRating: 0,
      totalReviews: 0,
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          bookings: [
            {
              bookingId: 'bk-001',
              clientId: 'client-aaa',
              companionId: 'comp-001',
              price: '100',
              durationMinutes: '60',
              status: 'BOOKING_STATUS_PENDING',
              startTime: '2026-06-26T10:00:00Z',
            },
            {
              bookingId: 'bk-002',
              clientId: 'client-bbb',
              companionId: 'comp-001', // Same companionId
              price: '200',
              durationMinutes: '90',
              status: 'BOOKING_STATUS_COMPLETED',
              startTime: '2026-06-25T14:00:00Z',
            },
          ],
          nextPageToken: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await bookingService.getBookings();

    expect(result.bookings).toHaveLength(2);
    // Cả 2 booking đều hiển thị tên companion đúng
    expect(result.bookings[0].partnerName).toBe('Mochi Yamamoto');
    expect(result.bookings[1].partnerName).toBe('Mochi Yamamoto');

    // Chỉ gọi 1 lần dù có 2 bookings cùng companionId (dedup bằng Set)
    expect(companionService.getCompanionDetail).toHaveBeenCalledTimes(1);
  });

  it('fallback tên nếu companion API fail', async () => {
    // Companion detail fail
    vi.mocked(companionService.getCompanionDetail).mockRejectedValue(
      new Error('Companion not found')
    );

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          bookings: [
            {
              bookingId: 'bk-001',
              clientId: 'client-xyz',
              companionId: 'comp-999',
              price: '150',
              durationMinutes: '120',
              status: 'BOOKING_STATUS_PENDING',
              startTime: '2026-06-26T09:00:00Z',
            },
          ],
          nextPageToken: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await bookingService.getBookings();

    expect(result.bookings).toHaveLength(1);
    // Fallback với 6 ký tự đầu của companionId
    expect(result.bookings[0].partnerName).toBe('Bạn đồng hành #comp-9');
    expect(result.bookings[0].partnerAvatar).toBe('');
  });

  it('trả về danh sách rỗng nếu API trả bookings không hợp lệ', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ message: 'error' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await bookingService.getBookings();

    expect(result.bookings).toHaveLength(0);
    expect(result.nextPageToken).toBeNull();
    expect(companionService.getCompanionDetail).not.toHaveBeenCalled();
  });
});
