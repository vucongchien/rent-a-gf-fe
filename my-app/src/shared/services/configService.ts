import { edgeConfigClient } from '@/shared/infra/vercel/edgeConfigClient';
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/shared/lib/cacheTags';

export const ConfigService = {
  /**
   * Đọc cấu hình từ key.
   *
   * Public data → `'use cache'` + tag `APP_CONFIG`. Cache life `hours` vì
   * config thay đổi rất ít. Sau `set()`, tag bị revalidate ngay.
   */
  async get<T>(key: string): Promise<T | undefined> {
    'use cache';
    cacheLife('hours');
    cacheTag(CACHE_TAGS.APP_CONFIG);
    return edgeConfigClient.get<T>(key);
  },

  /**
   * Ghi/Cập nhật cấu hình cho key. Invalidate cache ngay sau khi thành công.
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    const ok = await edgeConfigClient.set<T>(key, value);
    if (ok) revalidateTag(CACHE_TAGS.APP_CONFIG, { expire: 0 });
    return ok;
  }
};
