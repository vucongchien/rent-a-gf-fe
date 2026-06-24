/**
 * adminUpgradeRequestService — Admin moderation cho yêu cầu nâng cấp Client → Companion.
 *
 * SSOT (docs/api_draft.md §2.1):
 *   - GET  /admin/upgrade-requests              → list (paginated)
 *   - POST /admin/upgrade-requests/{id}/approve → kích hoạt role COMPANION
 *   - POST /admin/upgrade-requests/{id}/reject  → body `{ reason }`
 *
 * KHÔNG `'use cache'` — admin data nhạy cảm + thay đổi nhanh.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import type {
  AdminUpgradeRequest,
  AdminUpgradeRequestActionResult,
  AdminUpgradeRequestListParams,
  AdminUpgradeRequestListResponse,
  ServiceRequestOptions,
} from '@/shared/types';

const MOCK_REQUESTS: AdminUpgradeRequest[] = [
  {
    id: 'req_up_001',
    userId: 'u-client-1',
    status: 'UPGRADE_STATUS_PENDING',
    reason: 'Tôi muốn trở thành Companion để chia sẻ thời gian với khách hàng.',
    rejectReason: '',
    reviewedBy: '',
    reviewedAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req_up_002',
    userId: 'u-client-2',
    status: 'UPGRADE_STATUS_PENDING',
    reason: 'Tôi đã có kinh nghiệm làm host/hostess tại các sự kiện.',
    rejectReason: '',
    reviewedBy: '',
    reviewedAt: null,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export const adminUpgradeRequestService = {
  async listUpgradeRequests(
    params: AdminUpgradeRequestListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminUpgradeRequestListResponse> {
    if (isMockMode()) {
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 10));
      const total = MOCK_REQUESTS.length;
      const data = MOCK_REQUESTS.slice((page - 1) * pageSize, page * pageSize);
      return { data, total, page, pageSize };
    }

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
    if (isMockMode()) {
      const found = MOCK_REQUESTS.find(r => r.id === id);
      if (!found) throw new Error('Không tìm thấy yêu cầu nâng cấp');
      if (found.status !== 'UPGRADE_STATUS_PENDING') {
        throw new Error(`Yêu cầu đang ở trạng thái ${found.status}, không thể approve`);
      }
      found.status = 'UPGRADE_STATUS_APPROVED';
      found.reviewedAt = new Date().toISOString();
      found.reviewedBy = 'u-admin-1';
      return {
        message: 'Upgrade request approved. User role updated to COMPANION.',
      };
    }
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
    if (isMockMode()) {
      const found = MOCK_REQUESTS.find(r => r.id === id);
      if (!found) throw new Error('Không tìm thấy yêu cầu nâng cấp');
      if (found.status !== 'UPGRADE_STATUS_PENDING') {
        throw new Error(`Yêu cầu đang ở trạng thái ${found.status}, không thể reject`);
      }
      found.status = 'UPGRADE_STATUS_REJECTED';
      found.rejectReason = reason;
      found.reviewedAt = new Date().toISOString();
      found.reviewedBy = 'u-admin-1';
      return { message: 'Upgrade request rejected successfully.' };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AdminUpgradeRequestActionResult>(
      `/admin/upgrade-requests/${id}/reject`,
      { req, method: 'POST', body: { reason } },
    );
  },
};

export type AdminUpgradeRequestService = typeof adminUpgradeRequestService;
