import { serverFetch } from '@/shared/lib/apiClient';
import { companions as mockCompanions } from '@/mocks/fixtures/data';
import type { Companion, CompanionDetail, ApiResponse } from '@/shared/types';
import { cacheLife, cacheTag } from 'next/cache';

export const companionService = {
  /**
   * Lấy danh sách bạn đồng hành (hỗ trợ limit, city).
   * Dùng chung ở Server Components và Route Handlers.
   */
  async getCompanions(params?: { limit?: number; city?: string }): Promise<{
    items: Companion[];
    total: number;
    hasNextPage: boolean;
  }> {
    'use cache';
    cacheLife('seconds'); // Cache ngắn hạn (mặc định cho danh sách realtime)
    cacheTag('companions-list');

    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      let items = [...mockCompanions];
      if (params?.city && params.city !== 'all') {
        items = items.filter(c => c.city === params.city);
      }
      
      const total = items.length;
      const limit = params?.limit || 9;
      const slicedItems = items.slice(0, limit);
      const hasNextPage = total > limit;

      return {
        items: slicedItems,
        total,
        hasNextPage,
      };
    }

    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.city && params.city !== 'all') searchParams.set('city', params.city);

    try {
      const raw = await serverFetch<{
        data: {
          items: Omit<Companion, 'metadata'>[];
          meta: { total: number; hasNextPage: boolean };
        }
      }>('/companions', {
        searchParams,
      });

      const items: Companion[] = raw.data.items.map(c => ({
        ...c,
        metadata: (c as Partial<Companion>).metadata ?? [],
      }));

      return {
        items,
        total: raw.data.meta.total,
        hasNextPage: raw.data.meta.hasNextPage,
      };
    } catch (err) {
      console.error('[companionService] Lỗi fetch danh sách companions:', err);
      return {
        items: [],
        total: 0,
        hasNextPage: false,
      };
    }
  },

  /**
   * Lấy thông tin Bạn đồng hành nổi bật (Featured Companion) và Tổng số lượng.
   * Cached static shell.
   */
  async getFeaturedCompanion(): Promise<{
    featuredCompanion: Companion | null;
    totalCount: number;
  }> {
    'use cache';
    cacheLife('minutes'); // Cache dài hạn cho Featured Companion
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
      searchParams.set('limit', '1');

      const raw = await serverFetch<{
        data: {
          items: Omit<Companion, 'metadata'>[];
          meta: { total: number };
        }
      }>('/companions', {
        searchParams,
      });

      const firstItem = raw.data.items[0];
      const featuredCompanion: Companion | null = firstItem
        ? {
            ...firstItem,
            metadata: (firstItem as Partial<Companion>).metadata ?? [],
          }
        : null;

      return {
        featuredCompanion,
        totalCount: raw.data.meta.total || 0,
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
  async getCompanionDetail(companionId: string): Promise<ApiResponse<CompanionDetail> | null> {
    'use cache';
    cacheLife('minutes'); // Cache 5 phút cho trang chi tiết
    cacheTag(`companion-${companionId}`);

    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const items = mockCompanions;
      const found = items.find(c => c.id === companionId) as CompanionDetail | undefined;
      if (!found) return null;
      
      const detail: CompanionDetail = {
        ...found,
        bio: found.bio || 'Đây là bio mặc định cho mock.',
        scenarios: found.scenarios || [],
        // BFF normalize: avatarUrl luôn là ảnh đầu của album
        // → consistent với CompanionCard ở trang grid
        albumUrls: found.avatarUrl
          ? [found.avatarUrl, ...(found.albumUrls ?? []).filter(u => u !== found.avatarUrl)]
          : (found.albumUrls ?? []),
      };
      
      return {
        data: detail,
      };
    }

    try {
      const raw = await serverFetch<ApiResponse<CompanionDetail>>(`/companions/${companionId}`);
      return raw;
    } catch (err) {
      console.error(`[companionService] Lỗi fetch companion detail cho ${companionId}:`, err);
      return null;
    }
  },

  /** Companion Management API */
  async applyCompanion(options?: any) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { data: { status: 'pending' } };
    return serverFetch('/companions/apply', { method: 'POST', req: options?.req });
  },
  
  async getMyProfile(options?: any) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { data: mockCompanions[0] };
    return serverFetch('/companions/me', { method: 'GET', req: options?.req });
  },
  
  async updateMyProfile(body: any, options?: any) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { data: body }; 
    return serverFetch('/companions/me', { method: 'PUT', body, req: options?.req });
  },
  
  async createMyScenario(body: any, options?: any) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { data: { id: `sc-new-${Date.now()}`, ...body } };
    return serverFetch('/companions/me/scenarios', { method: 'POST', body, req: options?.req });
  },
  
  async updateMyScenario(scenarioId: string, body: any, options?: any) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { data: body };
    return serverFetch(`/companions/me/scenarios/${scenarioId}`, { method: 'PUT', body, req: options?.req });
  },
  
  async deleteMyScenario(scenarioId: string, options?: any) {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
    if (isMock) return { data: { success: true } };
    return serverFetch(`/companions/me/scenarios/${scenarioId}`, { method: 'DELETE', req: options?.req });
  }
};
export type CompanionService = typeof companionService;
