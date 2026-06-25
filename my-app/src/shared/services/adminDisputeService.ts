/**
 * adminDisputeService — quản lý disputes.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import type {
  AdminDisputeDetail,
  AdminDisputeListParams,
  AdminDisputeListResponse,
  AdminDisputeOutcome,
  AdminDisputeResolveResult,
  ServiceRequestOptions,
} from '@/shared/types';

export const adminDisputeService = {
  async list(
    params: AdminDisputeListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeListResponse> {
    const sp = new URLSearchParams();
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminDisputeListResponse>('/disputes', {
      searchParams: sp,
      req: options?.req,
    });
  },

  async getById(
    disputeId: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeDetail | null> {
    try {
      return await serverFetch<AdminDisputeDetail>(`/disputes/${disputeId}`, {
        req: options?.req,
      });
    } catch (err) {
      console.error('[adminDisputeService] getById error:', err);
      return null;
    }
  },

  async resolve(
    disputeId: string,
    outcome: AdminDisputeOutcome,
    note: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeResolveResult> {
    if (!note || note.trim().length < 5) {
      throw new Error('Phải nhập ghi chú giải quyết (≥ 5 ký tự)');
    }
    // SSOT body: `{ resolution, notes }` với resolution ∈ REFUND_CLIENT | PAYOUT_COMPANION | REJECT_DISPUTE.
    const resolution =
      outcome === 'REFUND' ? 'REFUND_CLIENT'
      : outcome === 'CHARGE' ? 'PAYOUT_COMPANION'
      : 'REJECT_DISPUTE';
    return serverFetch<AdminDisputeResolveResult>(
      `/disputes/${disputeId}/resolve`,
      {
        method: 'POST',
        body: { resolution, notes: note },
        req: options?.req,
      },
    );
  },
};
