/**
 * adminTransactionService — đọc/lọc transactions cho admin.
 *
 * Read-only ở MVP (không cho admin sửa transaction từ UI).
 */

import { serverFetch } from '@/shared/lib/apiClient';
import type {
  AdminTransactionListParams,
  AdminTransactionListResponse,
  AdminTransactionStatus,
  ServiceRequestOptions,
} from '@/shared/types';


export const adminTransactionService = {
  async list(
    params: AdminTransactionListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminTransactionListResponse> {

    const sp = new URLSearchParams();
    if (params.type) sp.set('type', params.type);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminTransactionListResponse>('/admin/transactions', {
      searchParams: sp,
      req: options?.req,
    });
  },
};
