import { createClient } from 'redis';

interface PushSub {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Khai báo biến global để lưu trữ in-memory subscriptions tránh bị mất khi hot reload ở local dev
const globalForSubscriptions = global as unknown as {
  memorySubscriptions?: PushSub[];
  redisClient?: ReturnType<typeof createClient>;
};

if (!globalForSubscriptions.memorySubscriptions) {
  globalForSubscriptions.memorySubscriptions = [];
}

/**
 * Khởi tạo và kết nối Redis Client (Singleton)
 */
async function getRedisClient() {
  if (!process.env.REDIS_URL) return null;
  if (globalForSubscriptions.redisClient) return globalForSubscriptions.redisClient;

  try {
    const client: ReturnType<typeof createClient> = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        keepAlive: true,
      }
    });

    client.on('error', (err) => {
      console.error('[Redis Client Error]', err);
    });

    await client.connect();
    console.log('[Redis] Kết nối thành công tới Redis Database.');
    globalForSubscriptions.redisClient = client;
    return client;
  } catch (err) {
    console.error('[Redis Connection Error] Không thể kết nối tới Redis:', err);
    return null;
  }
}

export const kvClient = {
  /**
   * Đọc danh sách subscriptions
   */
  async getSubscriptions(): Promise<PushSub[]> {
    // 1. Thử kết nối qua REDIS_URL (Thư viện Node-Redis)
    const redis = await getRedisClient();
    if (redis) {
      try {
        const data = await redis.get('pwa_subscriptions');
        if (data) {
          return JSON.parse(data) as PushSub[];
        }
        return [];
      } catch (err) {
        console.error('[kvClient] Lỗi đọc subscriptions từ Redis Client:', err);
      }
    }

    // 2. Fallback qua Vercel KV REST API
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const url = `${process.env.KV_REST_API_URL}/get/pwa_subscriptions`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.result) {
            return JSON.parse(data.result) as PushSub[];
          }
        }
        return [];
      } catch (err) {
        console.error('[kvClient] Lỗi đọc subscriptions từ Vercel KV REST API:', err);
      }
    }

    // 3. Fallback cuối cùng: In-Memory
    console.warn('[kvClient] Không có cấu hình Redis/KV DB. Sử dụng bộ nhớ tạm (in-memory) để đọc subscriptions.');
    return globalForSubscriptions.memorySubscriptions || [];
  },

  /**
   * Lưu danh sách subscriptions
   */
  async saveSubscriptions(subs: PushSub[]): Promise<boolean> {
    // 1. Thử ghi qua REDIS_URL (Thư viện Node-Redis)
    const redis = await getRedisClient();
    if (redis) {
      try {
        await redis.set('pwa_subscriptions', JSON.stringify(subs));
        return true;
      } catch (err) {
        console.error('[kvClient] Lỗi lưu subscriptions qua Redis Client:', err);
      }
    }

    // 2. Fallback qua Vercel KV REST API
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const url = `${process.env.KV_REST_API_URL}/set/pwa_subscriptions`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(subs)), // KV set REST API yêu cầu chuỗi
        });
        return res.ok;
      } catch (err) {
        console.error('[kvClient] Lỗi lưu subscriptions lên Vercel KV REST API:', err);
      }
    }

    // 3. Fallback cuối cùng: In-Memory
    console.warn('[kvClient] Không có cấu hình Redis/KV DB. Sử dụng bộ nhớ tạm (in-memory) để lưu subscriptions.');
    globalForSubscriptions.memorySubscriptions = subs;
    return true;
  }
};

