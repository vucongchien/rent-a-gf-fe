import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

import { companionService } from '../companionService';

describe('companionService public list contract', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1';
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    vi.restoreAllMocks();
  });

  it('normalizes BE data[] list into UI companion shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        data: [{
          companionId: 'b4d8b90f-cdc4-4244-98d5-ac090cecf7c2',
          displayName: 'kitty',
          avatarUrl: null,
          averageRating: 4.9,
          city: 'HCM',
          startingPrice: 0,
        }],
        total: 1,
        page: 1,
        pageSize: 6,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await companionService.getCompanions({ pageSize: 6 });

    expect(result).toEqual({
      companions: [{
        companionId: 'b4d8b90f-cdc4-4244-98d5-ac090cecf7c2',
        displayName: 'kitty',
        avatarUrl: '',
        averageRating: 4.9,
        totalReviews: 0,
        availableCities: ['HCM'],
        minPrice: 0,
        voiceIntroUrl: null,
      }],
      total: 1,
      page: 1,
      pageSize: 6,
    });
  });

  it('normalizes city filter before calling BE companions list', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        data: [],
        total: 0,
        page: 1,
        pageSize: 6,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await companionService.getCompanions({ pageSize: 6, city: 'Đà Nẵng' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/companions?pageSize=6&city=Danang',
      expect.any(Object),
    );
  });

  it('normalizes BE detail contract into magazine view shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        companionId: 'cmp_chizuru_123',
        displayName: 'Chizuru Ichinose',
        bio: 'Hãy để tôi đóng vai một người bạn gái hoàn hảo trong buổi hẹn hò của bạn.',
        avatarUrl: 'https://storage.rent-a-gf.com/avatars/chizuru.png',
        albumUrls: ['https://storage.rent-a-gf.com/albums/chizuru_1.png'],
        voiceIntroUrl: 'https://storage.rent-a-gf.com/voice/chizuru.mp3',
        availableCities: ['HCM', 'Danang'],
        averageRating: 4.9,
        totalReviews: 150,
        status: 'APPROVED',
        scenarios: [{
          id: 'scn_cinema_01',
          title: 'Hẹn hò xem phim lãng mạn',
          description: 'Cùng đi xem phim, chia sẻ bắp rang bơ...',
          price: 300,
          duration: 120,
          status: 'ACTIVE',
        }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await companionService.getCompanionDetail('cmp_chizuru_123');

    expect(result).toEqual({
      companionId: 'cmp_chizuru_123',
      displayName: 'Chizuru Ichinose',
      biography: 'Hãy để tôi đóng vai một người bạn gái hoàn hảo trong buổi hẹn hò của bạn.',
      avatarUrl: 'https://storage.rent-a-gf.com/avatars/chizuru.png',
      albumUrls: ['https://storage.rent-a-gf.com/albums/chizuru_1.png'],
      voiceIntroUrl: 'https://storage.rent-a-gf.com/voice/chizuru.mp3',
      availableCities: ['HCM', 'Danang'],
      averageRating: 4.9,
      totalReviews: 150,
      status: 'APPROVED',
      scenarios: [{
        scenarioId: 'scn_cinema_01',
        title: 'Hẹn hò xem phim lãng mạn',
        description: 'Cùng đi xem phim, chia sẻ bắp rang bơ...',
        price: 300,
        durationMinutes: 120,
        publicPlace: '',
        status: 'ACTIVE',
      }],
    });
  });
});
