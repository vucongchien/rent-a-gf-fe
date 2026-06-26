import { NextRequest, NextResponse } from 'next/server';
import {
  accessTokenCookieOptions,
  AUTH_COOKIE_NAME,
  refreshTokenCookieOptions,
  REFRESH_COOKIE_NAME,
} from '@/shared/lib/authCookies';
import { parseCookieValue } from '@/shared/lib/authSession';
import { refreshTokensFromCookie } from '@/shared/lib/tokenRefresh';

/**
 * POST /api/auth/refresh — Refresh access token (rotation).
 *
 * Đọc refresh_token cookie HttpOnly, gọi BE /auth/refresh, set lại cookie
 * access_token + refresh_token mới (giống /api/auth/callback). Trả `{ success: true }`
 * cho client (token KHÔNG echo về JS — vẫn HttpOnly).
 *
 * Không dùng `serverFetch()` ở đây: access_token cũ có thể đã hết hạn, nếu
 * gắn Bearer vào refresh request thì BE có thể reject trước khi đọc refreshToken.
 */
export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const refreshToken = parseCookieValue(cookieHeader, REFRESH_COOKIE_NAME) ?? '';
  const tokens = await refreshTokensFromCookie(refreshToken);

  if (!tokens) {
    const res = NextResponse.json(
      { code: 'REFRESH_FAILED', message: 'Không thể làm mới phiên đăng nhập.' },
      { status: 401 },
    );
    res.cookies.delete(AUTH_COOKIE_NAME);
    res.cookies.delete(REFRESH_COOKIE_NAME);
    return res;
  }

  const accessMaxAge = Math.max(tokens.expiresIn ?? 3600, 60);
  const res = NextResponse.json({ success: true });

  res.cookies.set(AUTH_COOKIE_NAME, tokens.accessToken, accessTokenCookieOptions(accessMaxAge));
  res.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieOptions());

  return res;
}
