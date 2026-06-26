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

const BASE_URL = 'https://api.example.test/api/v1';

describe('companionService public list contract', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = BASE_URL;
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
        status: 'ACTIVE',
      }],
    });
  });
});

describe('companionService.getMyProfile — normalize bio', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = BASE_URL;
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    vi.restoreAllMocks();
  });

  it('maps Backend `bio` field to Frontend `biography` field', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        companionId: 'cmp_test_01',
        displayName: 'Chizuru',
        bio: 'Hãy để tôi đóng vai một người bạn gái hoàn hảo.',
        avatarUrl: 'https://example.com/avatar.png',
        albumUrls: [],
        voiceIntroUrl: null,
        availableCities: ['HCM'],
        status: 'APPROVED',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await companionService.getMyProfile();

    expect(result.biography).toBe('Hãy để tôi đóng vai một người bạn gái hoàn hảo.');
    expect(result.companionId).toBe('cmp_test_01');
    expect(result.displayName).toBe('Chizuru');
    expect(result.availableCities).toEqual(['HCM']);
    expect(result.status).toBe('APPROVED');
  });

  it('returns empty biography when both bio and biography are absent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        companionId: 'cmp_test_02',
        displayName: 'Kazuya',
        avatarUrl: null,
        albumUrls: [],
        voiceIntroUrl: null,
        availableCities: [],
        status: 'PENDING',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await companionService.getMyProfile();
    expect(result.biography).toBe('');
    expect(result.status).toBe('PENDING');
  });

  it('prefers biography over bio when both are present (backward compat)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        companionId: 'cmp_test_03',
        displayName: 'Mizuhara',
        biography: 'Biography field value',
        bio: 'Bio field value',
        avatarUrl: null,
        albumUrls: [],
        voiceIntroUrl: null,
        availableCities: ['Hanoi'],
        status: 'APPROVED',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await companionService.getMyProfile();
    // biography được ưu tiên theo logic raw.biography ?? raw.bio
    expect(result.biography).toBe('Biography field value');
  });
});

describe('companionService.updateMyProfile — PATCH + bio mapping', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = BASE_URL;
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    vi.restoreAllMocks();
  });

  it('calls PATCH /profile/me (not PUT)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await companionService.updateMyProfile({
      displayName: 'Chizuru',
      biography: 'Tiểu sử mới.',
      availableCities: ['HCM'],
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(options?.method).toBe('PATCH');
    expect(url).toContain('/profile/me');
  });

  it('maps `biography` -> `bio` in request body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await companionService.updateMyProfile({
      biography: 'Tiểu sử mới.',
      availableCities: ['HCM', 'Danang'],
    });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options?.body as string);

    // Body phải chứa `bio`, không chứa `biography`
    expect(body).toHaveProperty('bio', 'Tiểu sử mới.');
    expect(body).not.toHaveProperty('biography');
    expect(body.availableCities).toEqual(['HCM', 'Danang']);
  });

  it('only sends defined fields (partial update)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    // Chỉ gửi biography, không gửi displayName
    await companionService.updateMyProfile({ biography: 'Chỉ cập nhật bio.' });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options?.body as string);

    expect(body).toHaveProperty('bio', 'Chỉ cập nhật bio.');
    expect(body).not.toHaveProperty('displayName');
    expect(body).not.toHaveProperty('availableCities');
  });
});

describe('companionService.createMyScenario — publicPlace', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = BASE_URL;
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    vi.restoreAllMocks();
  });

  it('sends publicPlace in request body when creating scenario', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scenarioId: 'scn_new_01' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await companionService.createMyScenario({
      title: 'Hẹn hò xem phim',
      description: 'Cùng đi xem phim và đi dạo trò chuyện...',
      price: 300,
      durationMinutes: 120,
    });

    const [url, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options?.body as string);

    expect(options?.method).toBe('POST');
    expect(url).toContain('/profile/me/scenarios');
    expect(body).toHaveProperty('title', 'Hẹn hò xem phim');
    expect(body).toHaveProperty('price', 300);
    expect(body).toHaveProperty('durationMinutes', 120);
  });
});
