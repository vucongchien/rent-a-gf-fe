import { NextRequest } from 'next/server';

/**
 * Lấy origin chuẩn của ứng dụng.
 * Ưu tiên các biến môi trường NEXT_PUBLIC_SITE_URL hoặc SITE_URL.
 * Nếu không có, tự động tính từ headers với cơ chế chuẩn hoá an toàn (support reverse proxy).
 */
export function getAppOrigin(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  // Chỉ sử dụng biến môi trường cấu hình sẵn nếu không phải localhost (để dev local không bị đè bởi Vercel env)
  if (!isLocalhost) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    if (siteUrl) {
      return siteUrl.replace(/\/$/, '');
    }
  }

  const defaultProto = isLocalhost ? 'http' : 'https';
  const protocol = req.headers.get('x-forwarded-proto') || defaultProto;

  // Chuẩn hoá protocol (loại bỏ chuỗi chứa nhiều protocol như "http,https" do proxy gửi)
  const cleanProtocol = protocol.split(',')[0].trim();

  return host ? `${cleanProtocol}://${host}` : req.nextUrl.origin;
}

/**
 * Lấy callback URL dùng để đăng ký với Google OAuth.
 */
export function getCallbackUrl(req: NextRequest): string {
  return `${getAppOrigin(req)}/api/auth/callback`;
}
