import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/shared/services/authService';
import { toErrorPayload } from '@/shared/lib/apiClient';

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày

/**
 * POST /api/auth/refresh — Refresh access token (rotation).
 *
 * Đọc refresh_token cookie HttpOnly, gọi BE /auth/refresh, set lại cookie
 * access_token + refresh_token mới (giống /api/auth/callback). Trả `{ success: true }`
 * cho client (token KHÔNG echo về JS — vẫn HttpOnly).
 */
export async function POST(req: NextRequest) {
  try {
    const tokens = await authService.refresh({ req });
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      return NextResponse.json(
        { code: 'REFRESH_FAILED', message: 'BE không trả token hợp lệ' },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    const accessMaxAge = Math.max(tokens.expiresIn ?? 3600, 60);

    cookieStore.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: accessMaxAge,
    });
    cookieStore.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const payload = toErrorPayload(err);
    // 401 cho mọi refresh failure để client có thể trigger logout
    const status = payload.status === 401 || payload.status === 403 ? payload.status : 401;
    return NextResponse.json({ code: payload.code, message: payload.message }, { status });
  }
}
