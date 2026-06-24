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
 * Trách nhiệm DUY NHẤT: redirect popup sang BE /auth/google/init.
 * BE sẽ tiếp tục redirect sang IdP. FE không sinh state / PKCE / lưu gì.
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
  return NextResponse.redirect(backendInitUrl)
}
