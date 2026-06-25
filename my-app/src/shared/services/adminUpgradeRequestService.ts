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
  AdminUpgradeRequest,
  AdminUpgradeRequestActionResult,
  AdminUpgradeRequestListParams,
  AdminUpgradeRequestListResponse,
  AdminUpgradeRequestStatus,
  ServiceRequestOptions,
} from '@/shared/types';

type ApiUpgradeStatus =
  | AdminUpgradeRequestStatus
  | 'UPGRADE_STATUS_PENDING'
  | 'UPGRADE_STATUS_APPROVED'
  | 'UPGRADE_STATUS_REJECTED'
  | 'UPGRADE_STATUS_UNSPECIFIED';

interface ApiUpgradeRequestItem extends Omit<AdminUpgradeRequest, 'status' | 'reviewedAt'> {
  status: ApiUpgradeStatus;
  reviewedAt?: string | null;
}

interface ApiUpgradeRequestListResponse {
  data?: ApiUpgradeRequestItem[];
  total?: number | string;
  page?: number;
  pageSize?: number;
}

export const adminUpgradeRequestService = {
  async listUpgradeRequests(
    params: AdminUpgradeRequestListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminUpgradeRequestListResponse> {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));

    const req = await getRequestCookieHeader(options?.req);
    const raw = await serverFetch<ApiUpgradeRequestListResponse>('/admin/upgrade-requests', {
      req,
      searchParams: sp,
    });
    return normalizeListResponse(raw, params);
  },

  async approveUpgradeRequest(
    id: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminUpgradeRequestActionResult> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AdminUpgradeRequestActionResult>(
      `/admin/upgrade-requests/${id}/approve`,
      { req, method: 'POST', body: {} },
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

function normalizeListResponse(
  raw: ApiUpgradeRequestListResponse,
  params: AdminUpgradeRequestListParams,
): AdminUpgradeRequestListResponse {
  return {
    data: (raw.data ?? []).map(normalizeItem),
    total: Number(raw.total ?? 0),
    page: raw.page ?? params.page ?? 1,
    pageSize: raw.pageSize ?? params.pageSize ?? 10,
  };
}

function normalizeItem(item: ApiUpgradeRequestItem): AdminUpgradeRequest {
  return {
    ...item,
    status: normalizeStatus(item.status),
    rejectReason: item.rejectReason ?? '',
    reviewedBy: item.reviewedBy ?? '',
    reviewedAt: item.reviewedAt ?? null,
  };
}

function normalizeStatus(status: ApiUpgradeStatus): AdminUpgradeRequestStatus {
  if (status === 'UPGRADE_STATUS_APPROVED') return 'APPROVED';
  if (status === 'UPGRADE_STATUS_REJECTED') return 'REJECTED';
  return status === 'APPROVED' || status === 'REJECTED' ? status : 'PENDING';
}
