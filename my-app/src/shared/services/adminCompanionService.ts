/**
 * adminCompanionService — moderation API cho admin console.
 *
 * KHÔNG dùng "use cache" — admin data nhạy cảm + thay đổi nhanh.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AdminCompanionDetail,
  AdminCompanionListParams,
  AdminCompanionListResponse,
  AdminModerationActionResult,
  ServiceRequestOptions,
} from '@/shared/types';

export const adminCompanionService = {
  async list(
    params: AdminCompanionListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminCompanionListResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const sp = new URLSearchParams();
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminCompanionListResponse>('/admin/companions', {
      searchParams: sp,
      req,
    });
  },

  async getById(
    companionId: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminCompanionDetail | null> {
    try {
      const req = await getRequestCookieHeader(options?.req);
      return await serverFetch<AdminCompanionDetail>(
        `/admin/companions/${companionId}`,
        { req },
      );
    } catch (err) {
      console.error('[adminCompanionService] getById error:', err);
      return null;
    }
  },

  async approve(
    companionId: string,
    reason: string | undefined,
    options?: ServiceRequestOptions,
  ): Promise<AdminModerationActionResult> {
    return mutateMoc('APPROVE', companionId, reason, options);
  },

  async reject(
    companionId: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminModerationActionResult> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Phải nhập lý do từ chối (≥ 3 ký tự)');
    }
    return mutateMoc('REJECT', companionId, reason, options);
  },

  async suspend(
    companionId: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminModerationActionResult> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Phải nhập lý do suspend (≥ 3 ký tự)');
    }
    return mutateMoc('SUSPEND', companionId, reason, options);
  },
};

async function mutateMoc(
  action: 'APPROVE' | 'REJECT' | 'SUSPEND',
  companionId: string,
  reason: string | undefined,
  options?: ServiceRequestOptions,
): Promise<AdminModerationActionResult> {
  const req = await getRequestCookieHeader(options?.req);
  const path = `/admin/companions/${companionId}/${action.toLowerCase()}`;
  return serverFetch<AdminModerationActionResult>(path, {
    method: 'POST',
    body: reason ? { reason } : undefined,
    req,
  });
}
