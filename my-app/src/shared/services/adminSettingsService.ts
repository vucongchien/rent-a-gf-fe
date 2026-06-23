/**
 * adminSettingsService — quản lý feature flags.
 *
 * Scope MVP: chỉ feature flags (KHÔNG có fees config).
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { currentMockUser } from '@/mocks/fixtures/data';
import {
  adminFeatureFlags,
  appendAuditEntry,
  setFeatureFlag,
} from '@/mocks/fixtures/admin';
import type {
  AdminFeatureFlag,
  AdminFeatureFlagListResponse,
  ServiceRequestOptions,
} from '@/shared/types';

const isMock = () =>
  process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

export const adminSettingsService = {
  async listFlags(options?: ServiceRequestOptions): Promise<AdminFeatureFlagListResponse> {
    if (isMock()) return { flags: [...adminFeatureFlags] };
    return serverFetch<AdminFeatureFlagListResponse>('/admin/settings/flags', {
      req: options?.req,
    });
  },

  async toggleFlag(
    key: string,
    enabled: boolean,
    options?: ServiceRequestOptions,
  ): Promise<AdminFeatureFlag> {
    if (isMock()) {
      const actor = currentMockUser!;
      const updated = setFeatureFlag(key, enabled, actor?.displayName ?? 'Admin');
      if (!updated) throw new Error(`Không tìm thấy flag "${key}"`);
      appendAuditEntry({
        actorId: actor?.userId ?? 'u-admin-1',
        actorName: actor?.displayName ?? 'Admin',
        action: 'TOGGLE_FLAG',
        targetType: 'FLAG',
        targetId: key,
        reason: enabled ? 'enabled' : 'disabled',
      });
      return updated;
    }
    return serverFetch<AdminFeatureFlag>(`/admin/settings/flags/${key}`, {
      method: 'PATCH',
      body: { enabled },
      req: options?.req,
    });
  },
};
