'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GoogleLoginButton from '@/shared/components/atoms/GoogleLoginButton'
import { useAuth } from '@/shared/contexts/AuthContext'

interface LoginViewProps {
  initialError: string | null
}

const ERROR_LABELS: Record<string, string> = {
  oauth_failed: 'Đăng nhập thất bại, thử lại nhé.',
  MISSING_CODE: 'IdP không trả về authorization code.',
  EXCHANGE_FAILED: 'Không hoàn tất được trao đổi token với máy chủ.',
  SESSION_WRITE_FAILED: 'Không thiết lập được session.',
}

export default function LoginView({ initialError }: LoginViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(
    initialError ? ERROR_LABELS[initialError] ?? initialError : null,
  )

  // Đã login → bounce về /explore
  useEffect(() => {
    if (user) router.replace('/explore')
  }, [user, router])

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-white border border-neutral-900 rounded-3xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="px-6 pt-8 pb-6">
          <h1 className="font-sans font-bold text-[22px] text-neutral-900 mb-2 text-center">
            Chào mừng quay lại
          </h1>
          <p className="font-sans text-[13px] text-neutral-500 leading-relaxed text-center mb-6">
            Đăng nhập để đặt hẹn và quản lý ví Kano-Coin của bạn.
          </p>

          <GoogleLoginButton
            onSuccess={() => router.replace('/explore')}
            onError={(msg) => setError(msg)}
          />

          {error && (
            <p
              role="alert"
              className="mt-4 text-center font-sans text-[12px] text-red-600 leading-relaxed"
            >
              {error}
            </p>
          )}

          <p className="mt-4 text-center font-sans text-[11px] text-neutral-400 leading-relaxed">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <a href="/terms" className="text-chizuru-600 hover:underline">Điều khoản</a>{' '}
            và{' '}
            <a href="/privacy" className="text-chizuru-600 hover:underline">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>
    </main>
  )
}
