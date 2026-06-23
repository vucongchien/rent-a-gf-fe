import { NextRequest, NextResponse } from 'next/server'
import { isMockMode } from '@/shared/lib/env'

// Helper tạo mock JWT token để middleware giải mã bình thường khi offline/mock mode
function generateMockJwt(userId: string, role: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(JSON.stringify({ userId, sub: userId, role }))
  const signature = "mock_signature"
  return `${header}.${payload}.${signature}`
}

/**
 * Validate redirect path: chỉ chấp nhận đường dẫn nội bộ để tránh open redirect.
 */
function sanitizeRedirect(redirect: string | null): string {
  if (!redirect) return '/explore'
  // Phải bắt đầu bằng / và không chứa // (tránh //evil.com)
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/explore'
}

/**
 * GET /api/auth/google — Khởi chạy Google OAuth Flow.
 * 
 * - Mock Mode: Sinh mock JWT và redirect thẳng tới BFF callback.
 * - Real Mode: Chuyển hướng trình duyệt sang endpoint init của Backend.
 * - Tham số `redirect`: đường dẫn quay lại sau đăng nhập.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const redirect = sanitizeRedirect(searchParams.get('redirect'))

  if (isMockMode()) {
    const mockToken = generateMockJwt("usr-client", "CLIENT")
    const callbackUrl = new URL('/api/auth/callback', req.url)
    callbackUrl.searchParams.set('token', mockToken)
    // Forward redirect param để callback biết quay về đâu
    callbackUrl.searchParams.set('redirect', redirect)
    return NextResponse.redirect(callbackUrl)
  }

  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'API_URL chưa được cấu hình ở BFF' },
      { status: 500 }
    )
  }

  // Forward redirect param sang backend như state param
  const backendInitUrl = new URL(`${apiUrl.replace(/\/$/, '')}/api/v1/auth/google/init`)
  backendInitUrl.searchParams.set('state', redirect)
  return NextResponse.redirect(backendInitUrl.toString())
}
