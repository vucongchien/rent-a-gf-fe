import { NextRequest, NextResponse } from 'next/server'
import { isMockMode } from '@/shared/lib/env'

function generateMockJwt(userId: string, role: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ userId, sub: userId, role }))
  return `${header}.${payload}.mock_signature`
}

/**
 * GET /api/auth/google — Init endpoint cho popup OAuth flow.
 *
 * SSOT §2.1: BE `GET /auth/google/init` trả JSON `{ authUrl }`. BFF gọi
 * server-to-server lấy authUrl rồi 302 popup sang IdP. FE không sinh
 * state / PKCE / lưu gì.
 *
 * Mock mode: nhảy thẳng sang /api/auth/callback giả lập IdP đã trả code+state.
 */
export async function GET(req: NextRequest) {
  if (isMockMode()) {
    const mockToken = generateMockJwt('usr-client', 'CLIENT')
    const callbackUrl = new URL('/api/auth/callback', req.url)
    callbackUrl.searchParams.set('code', `mock_code_${mockToken}`)
    callbackUrl.searchParams.set('state', 'mock_state')
    return NextResponse.redirect(callbackUrl)
  }

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
    return NextResponse.redirect(data.authUrl)
  } catch (err) {
    console.error('[BFF init] Lỗi gọi BE init:', err)
    return NextResponse.json(
      { error: 'Không kết nối được BE init' },
      { status: 502 },
    )
  }
}
