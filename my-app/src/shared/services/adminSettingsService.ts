/**
 * adminSettingsService — quản lý feature flags.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AdminFeatureFlag,
  AdminFeatureFlagListResponse,
  ServiceRequestOptions,
} from '@/shared/types';

export const adminSettingsService = {
  async listFlags(options?: ServiceRequestOptions): Promise<AdminFeatureFlagListResponse> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AdminFeatureFlagListResponse>('/admin/settings/flags', {
      req,
    });
  },

  async toggleFlag(
    key: string,
    enabled: boolean,
    options?: ServiceRequestOptions,
  ): Promise<AdminFeatureFlag> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<AdminFeatureFlag>(`/admin/settings/flags/${key}`, {
      method: 'PATCH',
      body: { enabled },
      req,
    });
  },
};
