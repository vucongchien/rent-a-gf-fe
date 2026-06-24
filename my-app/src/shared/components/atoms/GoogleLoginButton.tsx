'use client'

import React from 'react'
import { Button } from '@/shared/components/atoms/Button'
import { SpinnerIcon, GoogleIcon } from '@/shared/components/atoms/Icons'
import { useOAuthPopup } from '@/shared/hooks/useOAuthPopup'
import { useAuth } from '@/shared/contexts/AuthContext'

interface GoogleLoginButtonProps {
  /** Callback chạy sau khi login thành công (sau khi refresh user) */
  onSuccess?: () => void
  /** Callback nhận thông báo lỗi để hiển thị toast */
  onError?: (message: string) => void
}

/**
 * GoogleLoginButton — Nút đăng nhập OAuth qua Google.
 * Style Neo-brutalist: viền đậm, shadow offset, hover shift up.
 */
export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps = {}) {
  const { refreshUser } = useAuth()
  const { login, isLoading } = useOAuthPopup({
    onSuccess: async () => {
      await refreshUser()
      onSuccess?.()
    },
    onError: (err) => {
      const msg = err.message ?? 'Đăng nhập thất bại, thử lại nhé.'
      if (onError) onError(msg)
      else console.error('[GoogleLoginButton] OAuth error:', err)
    },
  })

  const handleLogin = () => {
    login()
  }

  return (
    <Button
      variant="unstyled"
      onClick={handleLogin}
      disabled={isLoading}
      type="button"
      id="google-login-btn"
      className="group w-full flex items-center justify-center gap-3 h-[52px] rounded-[14px] border-[1.5px] bg-white font-semibold text-[15px] cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
      style={{
        borderColor: 'var(--color-login-ink)',
        color: 'var(--color-login-ink)',
        boxShadow: '0 4px 0 var(--color-login-ink)',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          const el = e.currentTarget
          el.style.transform = 'translateY(2px)'
          el.style.boxShadow = '0 2px 0 var(--color-login-ink)'
          el.style.backgroundColor = 'var(--color-cream)'
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = '0 4px 0 var(--color-login-ink)'
        el.style.backgroundColor = ''
      }}
      onMouseDown={(e) => {
        if (!isLoading) {
          const el = e.currentTarget
          el.style.transform = 'translateY(4px)'
          el.style.boxShadow = 'none'
        }
      }}
      onMouseUp={(e) => {
        if (!isLoading) {
          const el = e.currentTarget
          el.style.transform = 'translateY(2px)'
          el.style.boxShadow = '0 2px 0 var(--color-login-ink)'
        }
      }}
    >
      {isLoading ? (
        <SpinnerIcon
          size={20}
          className="text-login-ink-soft"
          style={{ color: 'var(--color-login-ink-soft)' }}
        />
      ) : (
        <GoogleIcon
          size={20}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      )}

      <span className="font-semibold tracking-wide text-sm">
        {isLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
      </span>
    </Button>
  )
}
