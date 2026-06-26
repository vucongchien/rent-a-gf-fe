import { NextRequest, NextResponse, connection } from 'next/server'
import { getCallbackUrl, getAppOrigin } from '@/shared/lib/authHelper'

/**
 * GET /api/auth/google — Init endpoint cho popup OAuth flow.
 *
 * SSOT §2.1: BE `GET /auth/google/init` trả JSON `{ authUrl }`. BFF gọi
 * server-to-server lấy authUrl rồi 302 popup sang IdP. FE không sinh
 * state / PKCE / lưu gì.
 */
export async function GET(req: NextRequest) {
  await connection()

  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'API_URL chưa được cấu hình ở BFF' },
      { status: 500 },
    )
  }

  const origin = getAppOrigin(req)
  const callbackUrl = getCallbackUrl(req)

  // Gắn redirect_uri vào query parameter (hỗ trợ cả redirect_uri và redirectUri)
  const backendInitUrl = new URL(`${apiUrl.replace(/\/$/, '')}/auth/google/init`);
  backendInitUrl.searchParams.set('redirect_uri', callbackUrl);
  backendInitUrl.searchParams.set('redirectUri', callbackUrl);

  try {
    const beRes = await fetch(backendInitUrl.toString(), {
      method: 'GET',
      headers: { 
        Accept: 'application/json',
        Origin: origin,
        Referer: origin
      },
      cache: 'no-store',
    })
    if (!beRes.ok) {
      const detail = await beRes.text().catch(() => '')
      console.error(`[BFF init] BE init ${beRes.status}: ${detail.slice(0, 200)}`)
      return NextResponse.json(
        { error: 'Không lấy được URL đăng nhập từ BE' },
        { status: 502 },
      )
    }
    const data = (await beRes.json()) as { authUrl?: string }
    if (!data?.authUrl) {
      return NextResponse.json(
        { error: 'BE init thiếu trường authUrl' },
        { status: 502 },
      )
    }

    // BFF tự override redirect_uri trong authUrl mà BE trả về.
    // Lý do: BE có thể hardcode redirect_uri (vd: localhost) trong config của nó.
    // BFF là người duy nhất biết origin thực tế (prod, staging, localhost...).
    // → Parse authUrl, ghi đè redirect_uri = callbackUrl đúng, rồi mới redirect.
    let finalAuthUrl: string
    try {
      const parsedAuthUrl = new URL(data.authUrl)
      const originalRedirectUri = parsedAuthUrl.searchParams.get('redirect_uri')
      parsedAuthUrl.searchParams.set('redirect_uri', callbackUrl)
      finalAuthUrl = parsedAuthUrl.toString()
      console.log('[BFF init] authUrl origin redirect_uri:', originalRedirectUri)
      console.log('[BFF init] authUrl overridden redirect_uri:', callbackUrl)
    } catch {
      // Nếu parse URL thất bại (authUrl không hợp lệ), dùng nguyên bản
      console.warn('[BFF init] Không parse được authUrl, dùng nguyên bản:', data.authUrl)
      finalAuthUrl = data.authUrl
    }

    return NextResponse.redirect(finalAuthUrl)
  } catch (err) {
    console.error('[BFF init] Lỗi gọi BE init:', err)
    return NextResponse.json(
      { error: 'Không kết nối được BE init' },
      { status: 502 },
    )
  }
}
