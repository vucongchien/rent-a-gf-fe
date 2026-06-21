'use server';

import { ConfigService } from '@/shared/services/configService';

/**
 * Đọc giá trị config từ server
 */
export async function getAppConfig<T>(key: string): Promise<T | undefined> {
  try {
    const val = await ConfigService.get<T>(key);
    return val;
  } catch (err) {
    console.error(`[config-actions] Lỗi get key "${key}":`, err);
    return undefined;
  }
}

/**
 * Ghi/Cập nhật giá trị config từ server
 */
export async function setAppConfig<T>(key: string, value: T): Promise<boolean> {
  try {
    const success = await ConfigService.set<T>(key, value);
    return success;
  } catch (err) {
    console.error(`[config-actions] Lỗi set key "${key}":`, err);
    return false;
  }
}
