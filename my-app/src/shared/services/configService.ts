import { edgeConfigClient } from '@/shared/infra/vercel/edgeConfigClient';

export const ConfigService = {
  /**
   * Đọc cấu hình từ key
   */
  async get<T>(key: string): Promise<T | undefined> {
    return edgeConfigClient.get<T>(key);
  },

  /**
   * Ghi/Cập nhật cấu hình cho key
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    return edgeConfigClient.set<T>(key, value);
  }
};
