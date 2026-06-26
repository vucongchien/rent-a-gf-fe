import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { serverFetch } from '@/shared/lib/apiClient';
import { CACHE_TAGS } from '@/shared/lib/cacheTags';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { normalizeCityCode } from '@/shared/constants/cities';
import type {
  Companion,
  CompanionDetail,
  CompanionProfileMe,
  CompanionReview,
  CompanionsResponse,
  ServiceRequestOptions,
  CreateScenarioBody,
  UpdateScenarioBody,
} from '@/shared/types';

type BackendCompanionListItem = Partial<Companion> & {
  city?: string | null;
  startingPrice?: number | null;
  avatarUrl?: string | null;
};

type BackendCompanionsResponse = {
  data?: BackendCompanionListItem[];
  companions?: BackendCompanionListItem[];
  total?: number;
  page?: number;
  pageSize?: number;
};

type BackendCompanionScenario = {
  id?: string;
  scenarioId?: string;
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  durationMinutes?: number;
  publicPlace?: string;
  status?: string;
};

type BackendCompanionDetail = Omit<Partial<CompanionDetail>, 'scenarios'> & {
  bio?: string | null;
  avatarUrl?: string | null;
  voiceIntroUrl?: string | null;
  scenarios?: BackendCompanionScenario[];
  status?: string;
};

function normalizeCompanion(item: BackendCompanionListItem): Companion {
  const availableCities = Array.isArray(item.availableCities)
    ? item.availableCities
    : item.city
      ? [item.city]
      : [];

  return {
    companionId: item.companionId ?? '',
    displayName: item.displayName ?? '',
    avatarUrl: item.avatarUrl ?? '',
    averageRating: item.averageRating ?? 0,
    totalReviews: item.totalReviews ?? 0,
    availableCities,
    minPrice: item.minPrice ?? item.startingPrice ?? 0,
    voiceIntroUrl: item.voiceIntroUrl ?? null,
    ...(item.metadata ? { metadata: item.metadata } : {}),
  };
}

function normalizeScenario(item: BackendCompanionScenario): CompanionDetail['scenarios'][number] {
  return {
    scenarioId: item.scenarioId ?? item.id ?? '',
    title: item.title ?? '',
    description: item.description ?? '',
    price: item.price ?? 0,
    durationMinutes: item.durationMinutes ?? item.duration ?? 0,
    publicPlace: item.publicPlace ?? '',
    ...(item.status ? { status: item.status } : {}),
  };
}

function normalizeCompanionDetail(raw: BackendCompanionDetail): CompanionDetail {
  return {
    companionId: raw.companionId ?? '',
    displayName: raw.displayName ?? '',
    biography: raw.biography ?? raw.bio ?? '',
    avatarUrl: raw.avatarUrl ?? '',
    albumUrls: raw.albumUrls ?? [],
    voiceIntroUrl: raw.voiceIntroUrl ?? null,
    availableCities: raw.availableCities ?? [],
    averageRating: raw.averageRating ?? 0,
    totalReviews: raw.totalReviews ?? 0,
    ...(raw.status ? { status: raw.status } : {}),
    scenarios: (raw.scenarios ?? []).map(normalizeScenario),
    ...(raw.recentReviews ? { recentReviews: raw.recentReviews } : {}),
    ...(raw.metadata ? { metadata: raw.metadata } : {}),
  };
}

function normalizeCompanionsResponse(raw: BackendCompanionsResponse, fallbackPageSize: number): CompanionsResponse {
  const rawCompanions = raw.companions ?? raw.data ?? [];
  return {
    companions: rawCompanions.map(normalizeCompanion),
    total: raw.total ?? rawCompanions.length,
    page: raw.page ?? 1,
    pageSize: raw.pageSize ?? fallbackPageSize,
  };
}

async function getMyProfileImpl(options?: ServiceRequestOptions): Promise<CompanionProfileMe> {
  const req = await getRequestCookieHeader(options?.req);
  return serverFetch<CompanionProfileMe>('/profile/me', { method: 'GET', req });
}

/**
 * Per-render dedupe cho getMyProfile() — nhiều Server Component trong cùng
 * 1 request (layout + page + nav) gọi sẽ chỉ hit BE 1 lần. KHÔNG cross-request
 * cache (an toàn với user-specific data theo AGENTS.md).
 */
const getMyProfileCached = cache(getMyProfileImpl);

export const companionService = {
  /**
   * Lấy danh sách bạn đồng hành (public, có cache).
   * Tag granular theo page+city để invalidate 1 trang không nuke toàn bộ.
   */
  async getCompanions(params?: { page?: number; pageSize?: number; city?: string }): Promise<CompanionsResponse> {
    'use cache';
    cacheLife('minutes');
    cacheTag(CACHE_TAGS.COMPANIONS_LIST);
    const page = params?.page ?? 1;
    const city = params?.city && params.city !== 'all' ? normalizeCityCode(params.city) : 'all';
    cacheTag(CACHE_TAGS.companionsList(`p${page}-${city}`));

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (city !== 'all') searchParams.set('city', city);

    try {
      const raw = await serverFetch<BackendCompanionsResponse>('/companions', { searchParams });
      return normalizeCompanionsResponse(raw, params?.pageSize ?? 9);
    } catch (err) {
      console.error('[companionService.getCompanions] Lỗi fetch companions:', err);
      return {
        companions: [],
        total: 0,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 9,
      };
    }
  },

  async getFeaturedCompanion(): Promise<{
    featuredCompanion: Companion | null;
    totalCount: number;
  }> {
    'use cache';
    cacheLife('minutes');
    cacheTag('companions-featured');

    const searchParams = new URLSearchParams();
    searchParams.set('pageSize', '1');

    try {
      const raw = await serverFetch<BackendCompanionsResponse>('/companions', { searchParams });
      const { companions, total } = normalizeCompanionsResponse(raw, 1);
      return {
        featuredCompanion: companions[0] || null,
        totalCount: total,
      };
    } catch (err) {
      console.error('[companionService.getFeaturedCompanion] Lỗi fetch:', err);
      return {
        featuredCompanion: null,
        totalCount: 0,
      };
    }
  },

  async getCompanionDetail(companionId: string): Promise<CompanionDetail | null> {
    'use cache';
    cacheLife('minutes');
    cacheTag(CACHE_TAGS.companion(companionId));

    const raw = await serverFetch<BackendCompanionDetail>(`/companions/${companionId}`);
    return normalizeCompanionDetail(raw);
  },

  /**
   * SSOT: GET /interaction/reviews/companion/{companionId} → array `CompanionReview[]`.
   */
  async getCompanionReviews(companionId: string): Promise<CompanionReview[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag(CACHE_TAGS.companion(companionId));

    const raw = await serverFetch<CompanionReview[]>(
      `/interaction/reviews/companion/${companionId}`,
    );
    return Array.isArray(raw) ? raw : [];
  },

  /** Companion Management API — POST /upgrade-requests { reason } (SSOT). */
  async applyCompanion(body: { reason: string }, options?: ServiceRequestOptions) {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch('/upgrade-requests', { method: 'POST', body, req });
  },

  /**
   * Hồ sơ companion của user hiện tại — user-specific, KHÔNG `'use cache'`.
   * Dùng React `cache()` cho per-render dedupe trong cùng 1 request.
   */
  getMyProfile(options?: ServiceRequestOptions): Promise<CompanionProfileMe> {
    if (options?.req) {
      return getMyProfileImpl(options);
    }
    return getMyProfileCached();
  },

  async updateMyProfile(body: Partial<CompanionProfileMe>, options?: ServiceRequestOptions) {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch('/profile/me', { method: 'PUT', body, req });
  },

  async createMyScenario(body: CreateScenarioBody, options?: ServiceRequestOptions) {
    const req = await getRequestCookieHeader(options?.req);
    const { title, description, price, durationMinutes } = body;
    return serverFetch('/profile/me/scenarios', {
      method: 'POST',
      body: { title, description, price, durationMinutes },
      req,
    });
  },

  async updateMyScenario(scenarioId: string, body: UpdateScenarioBody, options?: ServiceRequestOptions) {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch(`/profile/me/scenarios/${scenarioId}`, { method: 'PUT', body, req });
  },

  async deleteMyScenario(scenarioId: string, options?: ServiceRequestOptions) {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch(`/profile/me/scenarios/${scenarioId}`, { method: 'DELETE', req });
  },

  async requestUploadUrl(
    body: { assetType: 'IMAGE' | 'VOICE'; sizeBytes: number; durationSeconds?: number; contentType?: string },
    options?: ServiceRequestOptions,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch('/profile/me/media/presigned-urls', { method: 'POST', body, req });
  },
};

export type CompanionService = typeof companionService;
