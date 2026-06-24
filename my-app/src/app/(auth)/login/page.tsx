import LoginView from './LoginView'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>
}

/**
 * /login — Trang đăng nhập.
 *
 * Flow chuẩn: user click nút → useOAuthPopup mở popup → bridge postMessage.
 * Fallback: popup bị chặn → hook tự `window.location.href = /api/auth/google`,
 * bridge sẽ redirect về `/login?error=...` nếu callback lỗi (không có opener).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams
  return <LoginView initialError={error ?? null} />
}
