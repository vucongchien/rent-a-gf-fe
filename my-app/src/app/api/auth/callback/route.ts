import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Validate redirect path: chỉ chấp nhận path nội bộ để tránh open redirect vulnerability.
 */
function sanitizeRedirect(redirect: string | null): string {
  if (!redirect) return '/explore'
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/explore'
}

/**
 * GET /api/auth/callback — Tiếp nhận token hệ thống từ Backend sau OAuth.
 * 
 * - Trích xuất token từ query param.
 * - Set HttpOnly cookie 'access_token'.
 * - Chuyển hướng trình duyệt về trang redirect (hoặc /explore nếu không có).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const redirectTo = sanitizeRedirect(searchParams.get('redirect'))

  if (!token) {
    return NextResponse.json(
      { error: 'Thiếu token xác thực trong request callback từ Backend' },
      { status: 400 }
    )
  }

  try {
    const cookieStore = await cookies()
    cookieStore.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 ngày
    })
  } catch (error) {
    console.error('[BFF callback] Không thể ghi cookie access_token:', error)
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi thiết lập session' },
      { status: 500 }
    )
  }

  // Redirect trình duyệt về trang user muốn vào trước khi đăng nhập
  const destination = new URL(redirectTo, req.url)
  return NextResponse.redirect(destination)
}
