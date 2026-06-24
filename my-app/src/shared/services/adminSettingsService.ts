/**
 * adminSettingsService — quản lý feature flags.
 *
 * Scope MVP: chỉ feature flags (KHÔNG có fees config).
 */

import { serverFetch } from '@/shared/lib/apiClient';
import type {
  AdminFeatureFlag,
  AdminFeatureFlagListResponse,
  ServiceRequestOptions,
} from '@/shared/types';


export const adminSettingsService = {
  async listFlags(options?: ServiceRequestOptions): Promise<AdminFeatureFlagListResponse> {
    return serverFetch<AdminFeatureFlagListResponse>('/admin/settings/flags', {
      req: options?.req,
    });
  },

  async toggleFlag(
    key: string,
    enabled: boolean,
    options?: ServiceRequestOptions,
  ): Promise<AdminFeatureFlag> {
    return serverFetch<AdminFeatureFlag>(`/admin/settings/flags/${key}`, {
      method: 'PATCH',
      body: { enabled },
      req: options?.req,
    });
  },
};
