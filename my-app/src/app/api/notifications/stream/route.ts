import { NextRequest } from 'next/server';
import { createMockNotificationStream } from './createMockNotificationStream';
import { createProxyNotificationStream } from './createProxyNotificationStream';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
};

/**
 * GET /api/notifications/stream
 * Điểm kết nối SSE chính của Client.
 */
export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL;
  const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !apiUrl;

  if (isMock) {
    const stream = createMockNotificationStream(req.signal);
    return new Response(stream, { headers: SSE_HEADERS });
  }

  // Real Mode: Proxy kết nối SSE sang Backend Gateway
  const stream = await createProxyNotificationStream(apiUrl, req.signal);

  if (!stream) {
    return new Response('Không thể kết nối đến luồng thông báo của backend', {
      status: 502,
    });
  }

  return new Response(stream, { headers: SSE_HEADERS });
}
