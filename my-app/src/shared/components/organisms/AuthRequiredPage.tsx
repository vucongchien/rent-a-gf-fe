import React from 'react';
import Link from 'next/link';

interface AuthRequiredPageProps {
  /**
   * Path để redirect về sau khi đăng nhập.
   * Thường là pathname của trang hiện tại.
   */
  redirectPath: string;
  /** Tiêu đề màn hình, mô tả tại sao cần đăng nhập */
  title?: string;
  /** Mô tả bổ sung */
  description?: string;
}

/**
 * AuthRequiredPage — Server Component hiển thị màn hình yêu cầu đăng nhập.
 *
 * Dùng cho các page-level guard khi server fetch user → null.
 * Link trỏ thẳng tới /api/auth/google (không qua trang /login trung gian).
 */
export function AuthRequiredPage({
  redirectPath,
  title = 'Đăng nhập để tiếp tục',
  description = 'Bạn cần đăng nhập để xem nội dung này.',
}: AuthRequiredPageProps) {
  const oauthHref = `/api/auth/google?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">
        {/* Illustration */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-chizuru-200/40 blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_12px_28px_-6px_rgba(251,105,153,0.45),inset_0_1px_0_#fff] flex items-center justify-center">
            <span className="text-3xl select-none">🌸</span>
          </div>
        </div>

        {/* Text */}
        <h2 className="font-sans font-bold text-xl text-neutral-900 mb-2">
          {title}
        </h2>
        <p className="font-sans text-sm text-neutral-500 leading-relaxed mb-7 max-w-[280px]">
          {description}
        </p>

        {/* CTA — link thẳng tới OAuth, không qua trang /login trung gian */}
        <Link
          href={oauthHref}
          id={`auth-required-login-btn-${redirectPath.replace(/\//g, '-')}`}
          className="group w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border-[1.5px] border-neutral-900 bg-white font-sans font-semibold text-[14px] text-neutral-900 transition-all duration-150 shadow-[0_3px_0_theme(colors.neutral.900)] hover:bg-neutral-50 hover:translate-y-[1px] hover:shadow-[0_2px_0_theme(colors.neutral.900)] active:translate-y-[3px] active:shadow-none"
        >
          {/* Google Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--color-google-blue)" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--color-google-green)" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="var(--color-google-yellow)" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--color-google-red)" />
          </svg>
          Đăng nhập với Google
        </Link>

        <Link
          href="/explore"
          className="mt-3 font-sans text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors underline-offset-2 hover:underline"
        >
          Tiếp tục khám phá không cần đăng nhập
        </Link>
      </div>
    </div>
  );
}
