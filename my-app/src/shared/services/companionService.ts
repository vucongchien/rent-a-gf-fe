import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { serverFetch } from '@/shared/lib/apiClient';
import { CACHE_TAGS } from '@/shared/lib/cacheTags';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { companions as mockCompanions } from '@/mocks/fixtures/data';
import type {
  Companion,
  CompanionDetail,
  CompanionProfileMe,
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
  if (isMockMode()) {
    const found = mockCompanions[0];
    return {
      companionId: found.companionId,
      displayName: found.displayName,
      biography: found.biography,
      avatarUrl: found.avatarUrl,
      albumUrls: found.albumUrls,
      voiceIntroUrl: found.voiceIntroUrl,
      availableCities: found.availableCities,
      status: 'APPROVED',
    };
  }
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

    if (isMockMode()) {
      let items = [...mockCompanions];
      if (params?.city && params.city !== 'all') {
        items = items.filter(c => c.availableCities.includes(params.city!));
      }

      const total = items.length;
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 9;
      const slicedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return { companions: slicedItems, total, page, pageSize };
    }

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params?.city && params.city !== 'all') searchParams.set('city', params.city);

    return serverFetch<CompanionsResponse>('/companions', { searchParams });
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

    if (isMockMode()) {
      const items = mockCompanions;
      const featured = items.length > 0 ? items[0] : null;
      return { featuredCompanion: featured, totalCount: items.length };
    }

    const searchParams = new URLSearchParams();
    searchParams.set('pageSize', '1');

    const raw = await serverFetch<CompanionsResponse>('/companions', { searchParams });
    return {
      featuredCompanion: raw.companions[0] || null,
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

    if (isMockMode()) {
      const found = mockCompanions.find(c => c.companionId === companionId);
      if (!found) return null;
      return {
        companionId: found.companionId,
        displayName: found.displayName,
        biography: found.biography || 'Đây là bio mặc định cho mock.',
        avatarUrl: found.avatarUrl,
        albumUrls: found.albumUrls || [],
        voiceIntroUrl: found.voiceIntroUrl,
        availableCities: found.availableCities || [],
        averageRating: found.averageRating,
        totalReviews: found.totalReviews,
        scenarios: found.scenarios || [],
      };
    }

    return serverFetch<CompanionDetail>(`/companions/${companionId}`);
  },

  /** Companion Management API */
  async applyCompanion(options?: ServiceRequestOptions) {
    if (isMockMode()) return { status: 'PENDING' };
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch('/upgrade-requests', { method: 'POST', req });
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
    if (isMockMode()) return body;
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch('/profile/me', { method: 'PUT', body, req });
  },

  async createMyScenario(body: CreateScenarioBody, options?: ServiceRequestOptions) {
    if (isMockMode()) return { scenarioId: `sc-new-${Date.now()}`, ...body };
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch('/profile/me/scenarios', { method: 'POST', body, req });
  },

  async updateMyScenario(scenarioId: string, body: UpdateScenarioBody, options?: ServiceRequestOptions) {
    if (isMockMode()) return body;
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch(`/profile/me/scenarios/${scenarioId}`, { method: 'PUT', body, req });
  },

  async deleteMyScenario(scenarioId: string, options?: ServiceRequestOptions) {
    if (isMockMode()) return { success: true };
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch(`/profile/me/scenarios/${scenarioId}`, { method: 'DELETE', req });
  },
};

export type CompanionService = typeof companionService;
