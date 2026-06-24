import React from 'react';
import Link from 'next/link';
import { GoogleIcon } from '../atoms/Icons';

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
          <GoogleIcon size={18} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
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
