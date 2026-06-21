'use server';

import webpush from 'web-push';
import { kvClient } from '@/shared/infra/vercel/kvClient';

interface PushSub {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// 1. Quản lý VAPID Keys thông minh (Dynamic local dev & Production env)
let keys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

// Nếu thiếu key và đang chạy local/mock -> Tự động sinh key hợp lệ để dev không bị crash
if (!keys.publicKey || !keys.privateKey) {
  const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;
  if (process.env.NODE_ENV === 'development' || isMock) {
    try {
      const generated = webpush.generateVAPIDKeys();
      keys = {
        publicKey: generated.publicKey,
        privateKey: generated.privateKey,
      };
      console.log('==================================================');
      console.log('   [PWA Info] Đã tự động sinh VAPID Keys chạy local:');
      console.log('   NEXT_PUBLIC_VAPID_PUBLIC_KEY =', generated.publicKey);
      console.log('   VAPID_PRIVATE_KEY =', generated.privateKey);
      console.log('==================================================');
    } catch (err) {
      console.error('[PWA Error] Không thể tự sinh VAPID keys:', err);
    }
  }
}

// Thiết lập cấu hình web-push
if (keys.publicKey && keys.privateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:support@rentgf.com',
      keys.publicKey,
      keys.privateKey
    );
  } catch (error) {
    console.error('[PWA Error] Cấu hình VAPID details thất bại. Vui lòng kiểm tra lại keys:', error);
  }
}

// 2. Server Actions công khai

/**
 * Lấy VAPID Public Key từ Server (Client gọi để đăng ký nhận Push)
 */
export async function getVapidPublicKey(): Promise<string> {
  return keys.publicKey;
}

/**
 * Đăng ký thiết bị nhận push notifications
 */
export async function subscribeUser(sub: PushSub) {
  try {
    const subs = await kvClient.getSubscriptions();
    const subStr = JSON.stringify(sub);
    
    // Tránh duplicate subscriptions
    const exists = subs.some(s => JSON.stringify(s) === subStr);
    if (!exists) {
      subs.push(sub);
      await kvClient.saveSubscriptions(subs);
      console.log('[PWA Info] Đã đăng ký subscription mới thành công. Tổng số thiết bị:', subs.length);
    }
    return { success: true };
  } catch (err) {
    console.error('[PWA Error] subscribeUser failed:', err);
    return { success: false, error: 'Internal Server Error' };
  }
}

/**
 * Hủy đăng ký thiết bị nhận push notifications
 */
export async function unsubscribeUser() {
  try {
    await kvClient.saveSubscriptions([]);
    console.log('[PWA Info] Đã xóa toàn bộ subscriptions.');
    return { success: true };
  } catch (err) {
    console.error('[PWA Error] unsubscribeUser failed:', err);
    return { success: false, error: 'Internal Server Error' };
  }
}

/**
 * Gửi đẩy thông báo đến toàn bộ các thiết bị đã đăng ký
 */
export async function sendNotification(message: string) {
  try {
    const subs = await kvClient.getSubscriptions();
    if (subs.length === 0) {
      console.warn('[PWA Warning] Không tìm thấy thiết bị đăng ký push nào.');
      return { success: false, error: 'No subscriptions registered.' };
    }

    if (!keys.publicKey || !keys.privateKey) {
      console.error('[PWA Error] VAPID Keys chưa được cấu hình. Không thể gửi push.');
      return { success: false, error: 'VAPID keys not configured.' };
    }

    console.log(`[PWA Info] Đang gửi thông báo push tới ${subs.length} thiết bị...`);
    
    let updatedSubs = [...subs];
    const sendPromises = subs.map((sub) => {
      console.log(`[PWA Info] Gửi tới endpoint: ${sub.endpoint.substring(0, 60)}...`);
      return webpush.sendNotification(
        sub as unknown as webpush.PushSubscription,
        JSON.stringify({
          title: 'Tin nhắn từ Companion 💬',
          body: message,
          icon: '/icons/icon-192x192.png',
        }),
        {
          timeout: 8000, // 8 giây timeout để tránh bị treo vĩnh viễn do nghẽn mạng cục bộ
        }
      ).then(() => {
        console.log(`[PWA Info] Gửi thành công tới: ${sub.endpoint.substring(0, 45)}...`);
      }).catch(err => {
        console.error(`[PWA Error] Gửi push thất bại tới ${sub.endpoint.substring(0, 45)}...:`, err.message || err);
        // Hủy các token đã hết hạn hoặc không hợp lệ khỏi DB để dọn dẹp bộ nhớ
        if (err.statusCode === 410 || err.statusCode === 404) {
          updatedSubs = updatedSubs.filter(s => JSON.stringify(s) !== JSON.stringify(sub));
        }
      });
    });

    await Promise.all(sendPromises);
    
    // Nếu có thiết bị bị hết hạn, lưu lại DB đã cập nhật
    if (updatedSubs.length !== subs.length) {
      await kvClient.saveSubscriptions(updatedSubs);
      console.log('[PWA Info] Đã dọn dẹp các subscriptions hết hạn.');
    }

    return { success: true };
  } catch (err) {
    console.error('[PWA Error] sendNotification failed:', err);
    return { success: false, error: 'Internal Server Error' };
  }
}
