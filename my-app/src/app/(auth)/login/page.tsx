import { redirect } from 'next/navigation'

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>
}

/**
 * /login — Không còn hiển thị UI, redirect thẳng vào OAuth flow.
 * Giữ route để các link cũ hoặc bookmark không bị 404.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo } = await searchParams

  // Sanitize: chỉ chấp nhận path nội bộ để tránh open redirect
  const safeRedirect = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
    ? redirectTo
    : '/explore'

  // Redirect thẳng vào OAuth, bypass trang login UI
  redirect(`/api/auth/google?redirect=${encodeURIComponent(safeRedirect)}`)
}
