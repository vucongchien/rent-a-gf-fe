import type { NextRequest } from 'next/server';
import {
  buildNotificationHeaders,
  buildNotificationUrl,
} from '@/shared/lib/notificationApiClient';

/**
 * Gọi API backend thực và lấy ReadableStream proxy về cho Client.
 */
export async function createProxyNotificationStream(
  req: NextRequest,
  reqSignal: AbortSignal
): Promise<ReadableStream | null> {
  try {
    const headers: HeadersInit = {
      ...buildNotificationHeaders(req),
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    const backendRes = await fetch(buildNotificationUrl('/notifications/stream'), {
      headers,
      signal: reqSignal,
    });

    if (!backendRes.ok) {
      console.error(`[SSE Proxy] Kết nối backend thất bại: status ${backendRes.status}`);
      return null;
    }

    return backendRes.body;
  } catch (err: any) {
    if (err.name === 'AbortError' || err.message?.includes('aborted') || reqSignal.aborted) {
      console.log('[SSE Proxy] Kết nối bị ngắt do Client abort (reload hoặc chuyển trang)');
    } else {
      console.error('[SSE Proxy Error] Lỗi kết nối:', err);
    }
    return null;
  }
}
