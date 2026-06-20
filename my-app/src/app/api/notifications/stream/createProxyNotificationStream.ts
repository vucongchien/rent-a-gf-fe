import { cookies } from 'next/headers';

/**
 * Gọi API backend thực và lấy ReadableStream proxy về cho Client.
 */
export async function createProxyNotificationStream(
  apiUrl: string,
  reqSignal: AbortSignal
): Promise<ReadableStream | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME ?? 'access_token')?.value;

    const headers: HeadersInit = {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const backendRes = await fetch(`${apiUrl.replace(/\/$/, '')}/notifications/stream`, {
      headers,
      signal: reqSignal,
    });

    if (!backendRes.ok) {
      console.error(`[SSE Proxy] Kết nối backend thất bại: status ${backendRes.status}`);
      return null;
    }

    return backendRes.body;
  } catch (err) {
    console.error('[SSE Proxy Error] Lỗi kết nối:', err);
    return null;
  }
}
