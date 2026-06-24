import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/google — Init endpoint cho popup OAuth flow.
 *
 * SSOT §2.1: BE `GET /auth/google/init` trả JSON `{ authUrl }`. BFF gọi
 * server-to-server lấy authUrl rồi 302 popup sang IdP. FE không sinh
 * state / PKCE / lưu gì.
 */
export async function GET(req: NextRequest) {

  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'API_URL chưa được cấu hình ở BFF' },
      { status: 500 },
    )
  }

  const backendInitUrl = `${apiUrl.replace(/\/$/, '')}/api/v1/auth/google/init`
  try {
    const beRes = await fetch(backendInitUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
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

    // Ghi đè redirect_uri trỏ về BFF Frontend thay vì Backend thật
    try {
      const targetOrigin = req.nextUrl.origin
      const frontendRedirectUri = `${targetOrigin}/api/auth/callback`
      const url = new URL(data.authUrl)
      url.searchParams.set('redirect_uri', frontendRedirectUri)
      return NextResponse.redirect(url.toString())
    } catch (parseErr) {
      console.error('[BFF init] Lỗi parse authUrl từ BE:', parseErr)
      return NextResponse.redirect(data.authUrl)
    }
  } catch (err) {
    console.error('[BFF init] Lỗi gọi BE init:', err)
    return NextResponse.json(
      { error: 'Không kết nối được BE init' },
      { status: 502 },
    )
  }
}
