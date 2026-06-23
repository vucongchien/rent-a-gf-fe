import { sendComment, sendEvent } from './sseUtils';

/**
 * Khởi tạo Mock SSE Stream gửi tin nhắn giả lập
 */
export function createMockNotificationStream(reqSignal: AbortSignal): ReadableStream {
  let intervalId: NodeJS.Timeout | undefined;
  let timeoutId: NodeJS.Timeout | undefined;

  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return new ReadableStream({
    start(controller) {
      // Gửi comment chào mừng
      sendComment(controller, 'connected');

      // 1. Gửi heartbeat định kỳ mỗi 15 giây để giữ kết nối không bị ngắt
      intervalId = setInterval(() => {
        try {
          sendComment(controller, 'keep-alive');
        } catch {
          // Stream có thể đã bị đóng
          cleanup();
        }
      }, 15000);

      // 2. Giả lập gửi 1 thông báo mới sau 10 giây để kiểm thử giao diện realtime
      timeoutId = setTimeout(() => {
        try {
          const mockNewNotification = {
            id: `nt-realtime-${Date.now()}`,
            type: 'BOOKING_REQUESTED',
            category: 'TRANSACTIONAL',
            title: 'Yêu cầu hẹn hò mới!',
            body: 'Bạn vừa nhận được một yêu cầu đặt lịch từ đối tác Kazuya.',
            bookingId: 'bk-3',
            createdAt: new Date().toISOString(),
            senderName: 'Kazuya Kinoshita',
            senderAvatar: 'https://i.pinimg.com/736x/d4/98/da/d498dabc6f61e109499b2b46d9e77bdb.jpg',
            actionUrl: '/bookings/bk-3'
          };

          sendEvent(controller, 'notification', mockNewNotification);
        } catch {
          // Stream đã bị đóng
        }
      }, 10000);

      // Dọn dẹp tài nguyên khi kết nối bị ngắt từ phía client
      reqSignal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
    cancel() {
      // Gọi khi client ngắt kết nối (Next.js/Node.js stream cancel callback)
      cleanup();
    }
  });
}
