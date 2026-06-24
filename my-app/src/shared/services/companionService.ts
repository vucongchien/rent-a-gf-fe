import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { serverFetch } from '@/shared/lib/apiClient';
import { CACHE_TAGS } from '@/shared/lib/cacheTags';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
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

function listScopeKey(params?: { page?: number; city?: string }): string {
  const page = params?.page ?? 1;
  const city = params?.city && params.city !== 'all' ? params.city : 'all';
  return `p${page}-${city}`;
}

async function getMyProfileImpl(): Promise<CompanionProfileMe> {
  const req = await getRequestCookieHeader();
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
    cacheTag(CACHE_TAGS.companionsList(listScopeKey(params)));

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params?.city && params.city !== 'all') searchParams.set('city', params.city);

    // SSOT trả `{ companions, total, page, pageSize }`.
    const raw = await serverFetch<{
      companions: Companion[];
      total: number;
      page: number;
      pageSize: number;
    }>('/companions', { searchParams });
    return {
      companions: raw.companions ?? [],
      total: raw.total ?? 0,
      page: raw.page ?? 1,
      pageSize: raw.pageSize ?? (params?.pageSize ?? 9),
    };
  },

  /**
   * Lấy thông tin Bạn đồng hành nổi bật (Featured Companion) và Tổng số lượng.
   */
  async getFeaturedCompanion(): Promise<{
    featuredCompanion: Companion | null;
    totalCount: number;
  }> {
    'use cache';
    cacheLife('minutes');
    cacheTag('companions-featured');

    const searchParams = new URLSearchParams();
    searchParams.set('pageSize', '1');

    // SSOT: `/companions` trả `{ companions, total, page, pageSize }`.
    const raw = await serverFetch<{
      companions: Companion[];
      total: number;
      page: number;
      pageSize: number;
    }>('/companions', { searchParams });
    return {
      featuredCompanion: raw.companions?.[0] || null,
      totalCount: raw.total || 0,
    };
  },

  /**
   * Lấy chi tiết bạn đồng hành theo ID (public, có cache).
   */
  async getCompanionDetail(companionId: string): Promise<CompanionDetail | null> {
    'use cache';
    cacheLife('minutes');
    cacheTag(CACHE_TAGS.companion(companionId));

    return serverFetch<CompanionDetail>(`/companions/${companionId}`);
  },

  /**
   * Lấy danh sách review của một Companion (public).
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
      // Route-handler path: req khác mỗi request → bypass dedupe.
      return getMyProfileImpl();
    }
    return getMyProfileCached();
  },

  async updateMyProfile(body: Partial<CompanionProfileMe>, options?: ServiceRequestOptions) {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch('/profile/me', { method: 'PUT', body, req });
  },

  async createMyScenario(body: CreateScenarioBody, options?: ServiceRequestOptions) {
    const req = await getRequestCookieHeader(options?.req);
    // SSOT chỉ nhận { title, description, price, durationMinutes }.
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
