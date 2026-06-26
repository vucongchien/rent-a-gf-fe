import { NextRequest, connection } from 'next/server';
import { createProxyNotificationStream } from './createProxyNotificationStream';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
};

/**
 * GET /api/notifications/stream
 * Điểm kết nối SSE chính của Client. Proxy thẳng sang BE.
 */
export async function GET(req: NextRequest) {
  await connection();

  if (!process.env.API_URL && !process.env.NOTIFICATION_API_URL) {
    return new Response('API_URL chưa được cấu hình', { status: 500 });
  }

  const stream = await createProxyNotificationStream(req, req.signal);

  if (!stream) {
    return new Response('Không thể kết nối đến luồng thông báo của backend', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(stream, { headers: SSE_HEADERS });
}
