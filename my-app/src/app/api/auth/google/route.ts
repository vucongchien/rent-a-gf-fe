import { NextRequest, NextResponse, connection } from 'next/server'

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

  // Tự động phát hiện origin thực tế của frontend (hỗ trợ reverse proxy/Vercel)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const origin = host ? `${protocol}://${host}` : req.nextUrl.origin;
  const callbackUrl = `${origin}/api/auth/callback`;

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
    return NextResponse.redirect(data.authUrl)
  } catch (err) {
    console.error('[BFF init] Lỗi gọi BE init:', err)
    return NextResponse.json(
      { error: 'Không kết nối được BE init' },
      { status: 502 },
    )
  }
}
