import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface BackendCallbackResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface BridgeMessage {
  type: 'oauth'
  status: 'success' | 'error'
  code?: string
  message?: string
}

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 // 30 ngày

function escapeForScript(value: string): string {
  return value.replace(/[<>&'"`]/g, ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`)
}

function bridgeHtml(targetOrigin: string, message: BridgeMessage): string {
  const safeOrigin = escapeForScript(targetOrigin)
  const safePayload = JSON.stringify(message).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="vi">
  <head><meta charset="utf-8" /><title>Đang hoàn tất đăng nhập...</title></head>
  <body class="font-sans">
    <p>Đang hoàn tất đăng nhập...</p>
    <script>
      (function () {
        var msg = ${safePayload};
        var origin = "${safeOrigin}";
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(msg, origin);
            window.close();
            return;
          }
        } catch (e) { /* opener cross-origin: bỏ qua, fallback redirect */ }
        // Fallback: popup bị chặn hoặc user mở full-page
        if (msg.status === "success") {
          window.location.href = "/";
        } else {
          window.location.href = "/login?error=" + encodeURIComponent(msg.code || "oauth_failed");
        }
      })();
    </script>
  </body>
</html>`
}

function htmlResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * GET /api/auth/callback — Redirect URI đăng ký với IdP.
 *
 * Luồng:
 *   1. Nhận code + state từ IdP (query param).
 *   2. Gọi BE /auth/google/callback?code&state (server-to-server).
 *   3. BE trả { accessToken, refreshToken, expiresIn }.
 *   4. Set cookie HttpOnly Secure SameSite=Lax (access_token, refresh_token).
 *   5. Trả HTML bridge page postMessage về window.opener.
 *
 * BFF KHÔNG sinh state/PKCE, KHÔNG đổi code với IdP. Tất cả BE lo.
 */
export async function GET(req: NextRequest) {
  const targetOrigin = req.nextUrl.origin
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return htmlResponse(
      bridgeHtml(targetOrigin, {
        type: 'oauth',
        status: 'error',
        code: 'MISSING_CODE',
        message: 'IdP không trả về authorization code.',
      }),
      400,
    )
  }

  let tokens: BackendCallbackResponse
  try {
    const apiUrl = process.env.API_URL
    if (!apiUrl) throw new Error('API_URL chưa cấu hình')
    const beUrl = new URL(`${apiUrl.replace(/\/$/, '')}/auth/google/callback`)
    beUrl.searchParams.set('code', code)
    if (state) beUrl.searchParams.set('state', state)

    const res = await fetch(beUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`BE callback ${res.status}: ${detail.slice(0, 200)}`)
    }
    tokens = (await res.json()) as BackendCallbackResponse
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      throw new Error('BE callback thiếu accessToken/refreshToken')
    }
  } catch (err) {
    console.error('[BFF callback] Lỗi đổi code lấy token:', err)
    return htmlResponse(
      bridgeHtml(targetOrigin, {
        type: 'oauth',
        status: 'error',
        code: 'EXCHANGE_FAILED',
        message: (err as Error)?.message ?? 'Không thể hoàn tất đăng nhập.',
      }),
      502,
    )
  }

  try {
    const cookieStore = await cookies()
    const isProd = process.env.NODE_ENV === 'production'
    const accessMaxAge = Math.max(tokens.expiresIn ?? 3600, 60)

    cookieStore.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: accessMaxAge,
    })
    cookieStore.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })
  } catch (err) {
    console.error('[BFF callback] Không ghi được cookie session:', err)
    return htmlResponse(
      bridgeHtml(targetOrigin, {
        type: 'oauth',
        status: 'error',
        code: 'SESSION_WRITE_FAILED',
        message: 'Không thiết lập được session.',
      }),
      500,
    )
  }

  return htmlResponse(
    bridgeHtml(targetOrigin, { type: 'oauth', status: 'success' }),
    200,
  )
}
