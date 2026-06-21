# ADR 0004: KIẾN TRÚC MOBILE PWA (PROGRESSIVE WEB APP) CHO NEXT.JS 16

*   **Trạng thái:** Đã duyệt (Approved)
*   **Tác giả:** Staff Engineer chuyên về Web Platform & Mobile Architecture
*   **Ngày:** 2026-06-20

---

## 1. BỐI CẢNH (CONTEXT)

Hệ thống Rent-a-Girlfriend hiện đang chạy môi trường production trên nền tảng Next.js 16 (React 19). Để tối ưu hóa trải nghiệm di động (Mobile-First), chúng tôi cần tích hợp Manifest, Service Worker và Web Push Notification.

Qua quá trình phỏng vấn và đối chiếu với tài liệu chính thức của Next.js tại [Guides: PWAs](https://nextjs.org/docs/app/guides/progressive-web-apps), chúng tôi quyết định thiết kế một hệ thống PWA thực tế, tối giản, tương thích tối đa với công nghệ hiện tại và không làm phình to nợ kỹ thuật.

---

## 2. QUYẾT ĐỊNH (DECISION)

Chúng tôi quyết định áp dụng giải pháp **Progressive Web App (PWA) lai tối giản**, tuân thủ 4 quyết định thiết kế cốt lõi sau:

### 2.1. Vanilla Service Worker & Server Actions (Tương thích 100% với Turbopack)
*   **Quyết định:** Sử dụng **Vanilla Service Worker (`public/sw.js`)** tự viết và đăng ký thủ công, kết hợp với **React 19 Server Actions** (`'use server'`).
*   **Lý do:** 
    *   Giúp mã nguồn Next.js 16 sạch sẽ, không bị phụ thuộc vào các Webpack plugins bên thứ ba (như `next-pwa` hay `Serwist`).
    *   Tương thích 100% với **Turbopack** (`next dev --turbo`), giữ nguyên tốc độ build nhanh chóng khi phát triển local.
    *   Tránh các lỗi Hydration mismatch phức tạp khi cấu hình lưu trữ đệm tự động.

### 2.2. Quản lý Push Subscription độc lập tại cơ sở dữ liệu của lớp BFF (Next.js)
*   **Quyết định:** Dữ liệu đăng ký nhận thông báo (Push Subscriptions) của người dùng sẽ được gửi từ Client lên Server Actions và lưu trữ trực tiếp vào cơ sở dữ liệu riêng của lớp BFF (Next.js).
*   **Lý do:** Tách biệt trách nhiệm (Separation of Concerns). Giúp lớp BFF tự quản lý việc đẩy thông báo mà không cần sửa đổi schema database hay logic của Backend chính.

### 2.3. Chiến lược ngoại tuyến đọc (Read-only Offline)
*   **Quyết định:** Khi mất mạng (Offline), PWA hoạt động ở chế độ **chỉ đọc (Read-only)**. Hệ thống sẽ vô hiệu hóa tất cả các tương tác viết (gửi tin nhắn, đặt lịch hẹn mới) và hiển thị banner thông báo mất kết nối mạng.
*   **Lý do:** Đơn giản hóa kiến trúc nghiệp vụ, loại bỏ hoàn toàn các bài toán phức tạp về conflict dữ liệu, trùng lịch hẹn (booking overlap) hay sai lệch thứ tự tin nhắn khi thực hiện offline sync.

### 2.4. Phát triển cục bộ HTTPS qua cờ `--experimental-https`
*   **Quyết định:** Sử dụng tính năng tích hợp của Next.js 16 để chạy HTTPS local thông qua câu lệnh `next dev --experimental-https`.
*   **Lý do:** Cung cấp Secure Context cần thiết cho trình duyệt kích hoạt Service Worker và kiểm thử Web Push trực tiếp trên thiết bị di động thật ở mạng local mà không cần qua tunnel bên thứ ba.

---

## 3. CÁC PHƯƠNG ÁN ĐÃ CÂN NHẮC (ALTERNATIVES)

### Phương án A: Tích hợp Serwist / next-pwa
*   *Ưu điểm:* Tự động hóa cache offline toàn bộ chunks và API.
*   *Nhược điểm:* Khóa chặt dự án vào Webpack bundler, không dùng được Turbopack dev server. Gây nguy cơ lỗi Hydration Mismatch nặng.

### Phương án B: Lưu Push Subscription trên Backend Microservices chính
*   *Ưu điểm:* Quản lý dữ liệu người dùng tập trung.
*   *Nhược điểm:* Yêu cầu cập nhật API Gateway và cơ sở dữ liệu Backend chính để tương thích với Web Push DTOs, kéo dài thời gian phát triển MVP.

---

## 4. HỆ QUẢ & TRADE-OFFS (CONSEQUENCES)

### Tích cực (Pros):
*   **Tương thích tối đa:** Không can thiệp vào quá trình build mặc định của Next.js 16.
*   **Mã nguồn sạch:** Tận dụng trực tiếp Server Actions giúp loại bỏ các API Route handlers trung gian.
*   **Bảo mật:** Cấu hình Security Headers cho `sw.js` trong cấu hình Next.js giúp loại bỏ nguy cơ Cache Poisoning.

### Tiêu cực / Điểm đánh đổi (Cons):
*   **Caching Offline Thủ công:** Nhà phát triển phải tự viết logic caching cơ bản (như offline fallback page) trong file `sw.js` thay vì có thư viện tự sinh. Tuy nhiên, đây là sự đánh đổi chấp nhận được để đảm bảo tính ổn định và hiệu năng dev server.

---

## 5. CÁC BƯỚC TRIỂN KHAI CHI TIẾT (IMPLEMENTATION STEPS)

### Bước 1: Khởi tạo Manifest (`src/app/manifest.ts`)
```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rent a Girlfriend Mobile',
    short_name: 'RentGF',
    description: 'Trải nghiệm tìm kiếm và trò chuyện cùng Companion',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
    ]
  };
}
```

### Bước 2: Thiết lập Service Worker thuần (`public/sw.js`)
Tạo Service Worker thuần trong thư mục `public` để lắng nghe sự kiện push:
```javascript
const CACHE_NAME = 'rentgf-offline-cache-v1';
const OFFLINE_URL = '/offline';

// Lắng nghe sự kiện install để cache trang offline dự phòng
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
  self.skipWaiting();
});

// Lắng nghe sự kiện fetch để trả về trang offline khi mất mạng
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://rent-a-gf.vercel.app'));
});
```

### Bước 3: Tạo Server Actions cho Web Push (`src/app/actions.ts`)
```typescript
'use server';

import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:support@rentgf.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Trong production, hãy lưu trữ vào Database của BFF (ví dụ: Postgres/Prisma)
let subscriptionsDb: any[] = []; 

export async function subscribeUser(sub: any) {
  subscriptionsDb.push(sub);
  return { success: true };
}

export async function unsubscribeUser() {
  subscriptionsDb = [];
  return { success: true };
}

export async function sendNotification(message: string) {
  if (subscriptionsDb.length === 0) {
    throw new Error('No subscription available');
  }

  const sendPromises = subscriptionsDb.map((sub) =>
    webpush.sendNotification(
      sub,
      JSON.stringify({
        title: 'Tin nhắn từ Companion 💬',
        body: message,
        icon: '/icons/icon-192x192.png',
      })
    ).catch(err => console.error('Error sending to sub:', err))
  );

  await Promise.all(sendPromises);
  return { success: true };
}
```

### Bước 4: Tạo Component Đăng ký Service Worker và Push (`src/shared/components/PushSubscriptionManager.tsx`)
```tsx
'use client';

import { useState, useEffect } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushSubscriptionManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error('Service worker registration failed:', err);
    }
  }

  async function handleSubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
    });
    setSubscription(sub);
    await subscribeUser(sub.toJSON());
  }

  async function handleUnsubscribe() {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
    }
  }

  async function handleSendTest() {
    if (message.trim()) {
      await sendNotification(message);
      setMessage('');
    }
  }

  if (!isSupported) {
    return <p className="text-sm text-gray-400">Trình duyệt hoặc thiết bị của bạn không hỗ trợ Web Push Notification.</p>;
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-4">
      <h3 className="font-semibold text-lg">Cấu hình Đẩy Thông Báo (Web Push)</h3>
      {subscription ? (
        <div className="space-y-2">
          <p className="text-green-400 text-sm">✓ Đã đăng ký nhận thông báo thành công.</p>
          <button onClick={handleUnsubscribe} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors">
            Hủy đăng ký thông báo
          </button>
          <div className="pt-4 border-t border-slate-800 flex gap-2">
            <input 
              type="text" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Nhập nội dung tin nhắn thử..."
              className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700 outline-none"
            />
            <button onClick={handleSendTest} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
              Gửi Thử
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-yellow-400 text-sm mb-2">⚠ Bạn chưa đăng ký nhận thông báo.</p>
          <button onClick={handleSubscribe} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors">
            Đăng ký nhận thông báo
          </button>
        </div>
      )}
    </div>
  );
}
```

### Bước 5: Đăng ký Service Worker ngầm tại Root Layout (`src/app/layout.tsx`)
Nhúng trực tiếp một inline script nhỏ để đăng ký Service Worker khi window loaded, đảm bảo không ảnh hưởng đến Hydration và Server Component:
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
```

### Bước 6: Cấu hình Headers cho `sw.js` tại `next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" }
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```
