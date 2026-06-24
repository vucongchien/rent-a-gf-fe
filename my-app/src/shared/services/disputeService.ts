/**
 * disputeService — Client-side khiếu nại (Dispute) API.
 *
 * SSOT (docs/api_draft.md §2.6):
 *   - POST /disputes        → tạo khiếu nại
 *   - GET  /disputes/{id}   → chi tiết khiếu nại
 *
 * KHÔNG `'use cache'` — dispute là user-specific data.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import type {
  CreateDisputeBody,
  CreateDisputeResponse,
  Dispute,
  DisputeSaga,
  ServiceRequestOptions,
} from '@/shared/types';

export const disputeService = {
  /**
   * Tạo khiếu nại mới. SSOT: POST /disputes.
   * Service KHÔNG nuốt lỗi — Server Action map sang state.
   */
  async createDispute(
    body: CreateDisputeBody,
    options?: ServiceRequestOptions,
  ): Promise<CreateDisputeResponse> {
    if (isMockMode()) {
      return { disputeId: `dis_${Date.now()}` };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CreateDisputeResponse>('/disputes', {
      req,
      method: 'POST',
      body,
    });
  },

  /**
   * Lấy chi tiết một dispute. SSOT: GET /disputes/{disputeId}.
   * Trả `null` chỉ khi mock không tìm thấy (semantics "not found").
   */
  async getDispute(
    disputeId: string,
    options?: ServiceRequestOptions,
  ): Promise<Dispute | null> {
    if (isMockMode()) {
      // Mock fixture chưa có dispute store — trả stub có id khớp.
      return {
        disputeId,
        bookingId: 'bk-mock',
        reporterId: 'u-client-1',
        accusedId: 'comp-1',
        reason: 'NO_SHOW',
        status: 'OPEN',
        adminId: null,
        resolution: null,
        notes: null,
        version: 1,
        evidences: [],
      };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<Dispute>(`/disputes/${disputeId}`, { req });
  },

  /**
   * Lấy trạng thái SAGA phân xử dòng tiền (REFUND / PAYOUT) của một dispute.
   * SSOT §2.6: GET /disputes/{id}/saga → DisputeSaga | null (chưa start = null).
   * Dùng cho Admin theo dõi trạng thái xử lý bất đồng bộ.
   */
  async getDisputeSaga(
    disputeId: string,
    options?: ServiceRequestOptions,
  ): Promise<DisputeSaga | null> {
    if (isMockMode()) {
      return null;
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<DisputeSaga | null>(`/disputes/${disputeId}/saga`, { req });
  },
};

export type DisputeService = typeof disputeService;
