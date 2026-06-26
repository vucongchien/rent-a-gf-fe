const CACHE_NAME = 'rentgf-offline-cache-v1';
const OFFLINE_URL = '/offline';

// Cờ bật bởi page khi NEXT_PUBLIC_PWA_ENABLED=true. SW không đọc được env.
let pwaEnabled = false;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PWA_ENABLE') {
    pwaEnabled = true;
  }
});

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
  if (!pwaEnabled) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

self.addEventListener('push', function (event) {
  let title = 'Tin nhắn từ Companion 💬';
  let options = {
    body: 'Bạn có một thông báo mới.',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2',
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      // Chỉ nhận icon nếu nó là URL tuyệt đối (tránh 404 file local)
      if (data.icon && (data.icon.startsWith('http://') || data.icon.startsWith('https://'))) {
        options.icon = data.icon;
      }
    } catch {
      // Fallback nếu data không phải là JSON
      options.body = event.data.text();
    }
  }

  // Đảm bảo luôn gọi showNotification để Chrome không hiển thị thông báo đè "This site has been updated in the bg"
  event.waitUntil(
    self.registration.showNotification(title, options).catch((err) => {
      console.error('[Service Worker] Lỗi hiển thị thông báo:', err);
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
