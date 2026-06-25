/**
 * disputeService — Client-side khiếu nại (Dispute) API.
 *
 * SSOT (docs/openapi.yaml):
 *   - POST /disputes        → tạo khiếu nại
 *   - GET  /disputes/{id}   → chi tiết khiếu nại
 *   - GET  /disputes/{id}/saga → trạng thái SAGA
 *
 * KHÔNG `'use cache'` — dispute là user-specific data.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  CreateDisputeBody,
  CreateDisputeResponse,
  Dispute,
  DisputeSaga,
  ServiceRequestOptions,
} from '@/shared/types';

export const disputeService = {
  async createDispute(
    body: CreateDisputeBody,
    options?: ServiceRequestOptions,
  ): Promise<CreateDisputeResponse> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<CreateDisputeResponse>('/disputes', {
      req,
      method: 'POST',
      body,
    });
  },

  async getDispute(
    disputeId: string,
    options?: ServiceRequestOptions,
  ): Promise<Dispute | null> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<Dispute>(`/disputes/${disputeId}`, { req });
  },

  async getDisputeSaga(
    disputeId: string,
    options?: ServiceRequestOptions,
  ): Promise<DisputeSaga | null> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<DisputeSaga | null>(`/disputes/${disputeId}/saga`, { req });
  },
};

export type DisputeService = typeof disputeService;
