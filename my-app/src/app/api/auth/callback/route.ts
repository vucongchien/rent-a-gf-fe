import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAppOrigin, getCallbackUrl } from '@/shared/lib/authHelper'
import {
  accessTokenCookieOptions,
  AUTH_COOKIE_NAME,
  refreshTokenCookieOptions,
  REFRESH_COOKIE_NAME,
} from '@/shared/lib/authCookies'

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

function escapeForScript(value: string): string {
  return value.replace(/[<>&'"`]/g, ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`)
}

/**
 * BROADCAST_CHANNEL_NAME phải khớp với giá trị trong useOAuthPopup.ts.
 * Dùng BroadcastChannel thay vì postMessage để bypass COOP của Google OAuth.
 * Google set header Cross-Origin-Opener-Policy: same-origin → window.opener = null.
 */
const BROADCAST_CHANNEL_NAME = 'rentagf_oauth'

function bridgeHtml(targetOrigin: string, message: BridgeMessage): string {
  const safeOrigin = escapeForScript(targetOrigin)
  const safePayload = JSON.stringify(message).replace(/</g, '\\u003c')
  const safeChannelName = escapeForScript(BROADCAST_CHANNEL_NAME)
  return `<!doctype html>
<html lang="vi">
  <head><meta charset="utf-8" /><title>Đang hoàn tất đăng nhập...</title></head>
  <body>
    <p style="font-family:sans-serif;text-align:center;margin-top:40px">Đang hoàn tất đăng nhập...</p>
    <script>
      (function () {
        var msg = ${safePayload};
        var origin = "${safeOrigin}";
        var sent = false;

        // PRIMARY: BroadcastChannel — không bị block bởi COOP của Google
        // Google OAuth set Cross-Origin-Opener-Policy: same-origin → window.opener = null
        // BroadcastChannel hoạt động xuyên tab/popup cùng origin, không cần opener
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            var bc = new BroadcastChannel("${safeChannelName}");
            bc.postMessage(msg);
            bc.close();
            sent = true;
            console.log('[BFF bridge] Gửi qua BroadcastChannel thành công');
          } catch (e) {
            console.warn('[BFF bridge] BroadcastChannel lỗi:', e);
          }
        }

        // FALLBACK: window.postMessage (chạy được ở local dev khi không có COOP)
        if (!sent) {
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(msg, origin);
              sent = true;
              console.log('[BFF bridge] Gửi qua postMessage thành công');
            }
          } catch (e) {
            console.warn('[BFF bridge] postMessage lỗi (COOP):', e);
          }
        }

        // Đóng popup hoặc redirect nếu không có opener
        if (sent) {
          try { window.close(); } catch (e) { /* ignore */ }
          // Nếu window.close() không đóng được (vd: không phải popup)
          setTimeout(function() {
            if (!window.closed) {
              window.location.href = msg.status === "success" ? "/" : "/login?error=" + encodeURIComponent(msg.code || "oauth_failed");
            }
          }, 500);
        } else {
          // Không gửi được gì → redirect full-page
          if (msg.status === "success") {
            window.location.href = "/";
          } else {
            window.location.href = "/login?error=" + encodeURIComponent(msg.code || "oauth_failed");
          }
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
  const targetOrigin = getAppOrigin(req)
  const callbackUrl = getCallbackUrl(req)
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
    beUrl.searchParams.set('redirect_uri', callbackUrl)
    beUrl.searchParams.set('redirectUri', callbackUrl)

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
    const accessMaxAge = Math.max(tokens.expiresIn ?? 3600, 60)

    cookieStore.set(AUTH_COOKIE_NAME, tokens.accessToken, accessTokenCookieOptions(accessMaxAge))
    cookieStore.set(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieOptions())
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
