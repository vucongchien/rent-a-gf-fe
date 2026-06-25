/**
 * adminUpgradeRequestService — Admin moderation cho yêu cầu nâng cấp Client → Companion.
 *
 * SSOT (docs/openapi.yaml):
 *   - GET  /admin/upgrade-requests              → list (paginated)
 *   - POST /admin/upgrade-requests/{id}/approve → kích hoạt role COMPANION
 *   - POST /admin/upgrade-requests/{id}/reject  → body `{ reason }`
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AdminUpgradeRequestActionResult,
  AdminUpgradeRequestListParams,
  AdminUpgradeRequestListResponse,
  ServiceRequestOptions,
} from '@/shared/types';

export const adminUpgradeRequestService = {
  async listUpgradeRequests(
    params: AdminUpgradeRequestListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminUpgradeRequestListResponse> {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));

    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AdminUpgradeRequestListResponse>('/admin/upgrade-requests', {
      req,
      searchParams: sp,
    });
  },

  async approveUpgradeRequest(
    id: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminUpgradeRequestActionResult> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AdminUpgradeRequestActionResult>(
      `/admin/upgrade-requests/${id}/approve`,
      { req, method: 'POST' },
    );
  },

  async rejectUpgradeRequest(
    id: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminUpgradeRequestActionResult> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Phải nhập lý do từ chối (≥ 3 ký tự)');
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AdminUpgradeRequestActionResult>(
      `/admin/upgrade-requests/${id}/reject`,
      { req, method: 'POST', body: { reason } },
    );
  },
};

export type AdminUpgradeRequestService = typeof adminUpgradeRequestService;
