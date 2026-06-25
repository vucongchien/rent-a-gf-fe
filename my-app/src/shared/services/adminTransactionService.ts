/**
 * adminTransactionService — đọc/lọc transactions cho admin.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AdminTransactionListParams,
  AdminTransactionListResponse,
  ServiceRequestOptions,
} from '@/shared/types';

export const adminTransactionService = {
  async list(
    params: AdminTransactionListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminTransactionListResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const sp = new URLSearchParams();
    if (params.type) sp.set('type', params.type);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminTransactionListResponse>('/admin/transactions', {
      searchParams: sp,
      req,
    });
  },
};
