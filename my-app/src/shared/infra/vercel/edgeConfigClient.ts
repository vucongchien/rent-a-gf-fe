import { get } from '@vercel/edge-config';

function parseEdgeConfigId(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const match = url.match(/\/edge-config\.vercel\.com\/(ecfg_[a-zA-Z0-9]+)/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

export const edgeConfigClient = {
  /**
   * Đọc cấu hình từ Edge Config của Vercel
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await get<T>(key);
      return value;
    } catch (error) {
      console.error(`[edgeConfigClient] Lỗi đọc key "${key}":`, error);
      return undefined;
    }
  },

  /**
   * Ghi/Cập nhật cấu hình cho key thông qua REST API của Vercel
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    const configId = process.env.EDGE_CONFIG_ID || parseEdgeConfigId(process.env.EDGE_CONFIG);
    const writeToken = process.env.VERCEL_ACCESS_TOKEN || process.env.EDGE_CONFIG_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN;

    if (!configId || !writeToken) {
      console.error('[edgeConfigClient] Thiếu EDGE_CONFIG_ID hoặc VERCEL_ACCESS_TOKEN để ghi.');
      return false;
    }

    try {
      const url = `https://api.vercel.com/v1/edge-config/${configId}/items`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${writeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: key,
              value: value,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('[edgeConfigClient] API ghi thất bại:', res.status, errorData);
        return false;
      }

      console.log(`[edgeConfigClient] Cập nhật key "${key}" thành công.`);
      return true;
    } catch (error) {
      console.error(`[edgeConfigClient] Lỗi khi ghi key "${key}":`, error);
      return false;
    }
  }
};
