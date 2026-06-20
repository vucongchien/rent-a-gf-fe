import { serverFetch } from '@/shared/lib/apiClient';
import { companions as mockCompanions } from '@/mocks/fixtures/data';
import type { Companion, CompanionDetail, CompanionProfileMe, CompanionsResponse, ServiceRequestOptions, CreateScenarioBody, UpdateScenarioBody } from '@/shared/types';
import { cacheLife, cacheTag } from 'next/cache';

export const companionService = {
  /**
   * Lấy danh sách bạn đồng hành.
   */
  async getCompanions(params?: { page?: number; pageSize?: number; city?: string }): Promise<CompanionsResponse> {
    'use cache';
    cacheLife('seconds');
    cacheTag('companions-list');

    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      let items = [...mockCompanions];
      if (params?.city && params.city !== 'all') {
        items = items.filter(c => c.availableCities.includes(params.city!));
      }
      
      const total = items.length;
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 9;
      const slicedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        companions: slicedItems,
        total,
        page,
        pageSize,
      };
    }

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params?.city && params.city !== 'all') searchParams.set('city', params.city);

    try {
      const raw = await serverFetch<CompanionsResponse>('/companions', {
        searchParams,
      });

      return raw;
    } catch (err) {
      console.error('[companionService] Lỗi fetch danh sách companions:', err);
      return {
        companions: [],
        total: 0,
        page: 1,
        pageSize: 9,
      };
    }
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

    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const items = mockCompanions;
      const featured = items.length > 0 ? items[0] : null;
      return {
        featuredCompanion: featured,
        totalCount: items.length,
      };
    }

    try {
      const searchParams = new URLSearchParams();
      searchParams.set('pageSize', '1');

      const raw = await serverFetch<CompanionsResponse>('/companions', {
        searchParams,
      });

      const firstItem = raw.companions[0] || null;

      return {
        featuredCompanion: firstItem,
        totalCount: raw.total || 0,
      };
    } catch (err) {
      console.error('[companionService] Lỗi fetch featured companion:', err);
      return {
        featuredCompanion: null,
        totalCount: 0,
      };
    }
  },

  /**
   * Lấy chi tiết thông tin bạn đồng hành theo ID.
   */
  async getCompanionDetail(companionId: string): Promise<CompanionDetail | null> {
    'use cache';
    cacheLife('minutes');
    cacheTag(`companion-${companionId}`);

    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const items = mockCompanions;
      const found = items.find(c => c.companionId === companionId);
      if (!found) return null;
      
      const detail: CompanionDetail = {
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
      
      return detail;
    }

    try {
      const raw = await serverFetch<CompanionDetail>(`/companions/${companionId}`);
      return raw;
    } catch (err) {
      console.error(`[companionService] Lỗi fetch companion detail cho ${companionId}:`, err);
      return null;
    }
  },

  /** Companion Management API */
  async applyCompanion(options?: ServiceRequestOptions) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { status: 'PENDING' };
    return serverFetch('/upgrade-requests', { method: 'POST', req: options?.req });
  },
  
  async getMyProfile(options?: ServiceRequestOptions): Promise<CompanionProfileMe> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) {
      const found = mockCompanions[0];
      return {
        companionId: found.companionId,
        displayName: found.displayName,
        biography: found.biography,
        avatarUrl: found.avatarUrl,
        albumUrls: found.albumUrls,
        voiceIntroUrl: found.voiceIntroUrl,
        availableCities: found.availableCities,
        status: 'APPROVED'
      };
    }
    return serverFetch<CompanionProfileMe>('/profile/me', { method: 'GET', req: options?.req });
  },
  
  async updateMyProfile(body: Partial<CompanionProfileMe>, options?: ServiceRequestOptions) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return body; 
    return serverFetch('/profile/me', { method: 'PUT', body, req: options?.req });
  },
  
  async createMyScenario(body: CreateScenarioBody, options?: ServiceRequestOptions) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { scenarioId: `sc-new-${Date.now()}`, ...body };
    return serverFetch('/profile/me/scenarios', { method: 'POST', body, req: options?.req });
  },
  
  async updateMyScenario(scenarioId: string, body: UpdateScenarioBody, options?: ServiceRequestOptions) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return body;
    return serverFetch(`/profile/me/scenarios/${scenarioId}`, { method: 'PUT', body, req: options?.req });
  },
  
  async deleteMyScenario(scenarioId: string, options?: ServiceRequestOptions) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { success: true };
    return serverFetch(`/profile/me/scenarios/${scenarioId}`, { method: 'DELETE', req: options?.req });
  }
};
export type CompanionService = typeof companionService;

