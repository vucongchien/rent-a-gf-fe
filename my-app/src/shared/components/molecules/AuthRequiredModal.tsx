'use client';

import React, { useEffect, useRef } from 'react';
import { CloseButton } from '../atoms/CloseButton';
import { HeartIcon } from '../atoms/Icons';

interface AuthRequiredModalProps {
  /** Có đang mở không */
  isOpen: boolean;
  /** Callback đóng modal */
  onClose: () => void;
  /**
   * Tiêu đề tuỳ theo ngữ cảnh, ví dụ "Để nạp ví" / "Để đặt hẹn"
   * Mặc định: "Đăng nhập để tiếp tục"
   */
  title?: string;
  /** Mô tả ngữ cảnh, ví dụ "Bạn cần đăng nhập để sử dụng ví Kano-Coin." */
  description?: string;
}

/**
 * AuthRequiredModal — Modal mời user đăng nhập khi cố truy cập tính năng cần auth.
 *
 * Dùng native <dialog> element để đảm bảo a11y & ESC key hoạt động đúng.
 * Truyền `redirect` path vào OAuth flow để sau đăng nhập quay lại đúng trang.
 */
export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  title = 'Đăng nhập để tiếp tục',
  description = 'Bạn cần đăng nhập để sử dụng tính năng này.',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Điều khiển đóng/mở dialog native
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  // Đóng khi click backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handleLogin = () => {
    setIsLoading(true);
    // Đọc pathname từ window tại thời điểm click — tránh dùng usePathname() hook
    // để không block static prerendering của các trang public
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/explore';
    const redirectPath = encodeURIComponent(currentPath);
    window.location.href = `/api/auth/google?redirect=${redirectPath}`;
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="modern-dialog fixed inset-0 m-auto z-50 p-0 border-none bg-transparent outline-none focus:outline-none max-w-[400px] w-[calc(100%-32px)]"
    >
      <div className="bg-white border border-neutral-900 rounded-3xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden relative">
        {/* Header gradient decorativo */}
        <div className="relative h-[120px] bg-gradient-to-br from-chizuru-50 via-chizuru-100 to-chizuru-200 flex items-center justify-center">
          {/* Deco circles */}
          <div className="absolute top-3 left-4 w-16 h-16 rounded-full bg-chizuru-200/40 blur-xl" />
          <div className="absolute bottom-2 right-6 w-12 h-12 rounded-full bg-chizuru-300/30 blur-lg" />
          {/* Logo icon */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_8px_20px_-4px_rgba(251,105,153,0.5),inset_0_1px_0_#fff] flex items-center justify-center">
            <HeartIcon fill="#fff" size={28} className="text-white" />
          </div>

          {/* Nút đóng */}
          <CloseButton
            onClose={onClose}
            variant="outline"
            size={14}
            aria-label="Đóng"
            className="absolute top-3 right-3 z-10"
          />
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          <h2 className="font-sans font-bold text-[18px] text-neutral-900 mb-1.5 text-center">
            {title}
          </h2>
          <p className="font-sans text-[13px] text-neutral-500 leading-relaxed text-center mb-5">
            {description}
          </p>

          {/* Google Login Button — inline neo-brutalist */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            id="auth-modal-google-login-btn"
            className="group w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border-[1.5px] border-neutral-900 bg-white font-sans font-semibold text-[14px] text-neutral-900 cursor-pointer transition-all duration-150 shadow-[0_3px_0_theme(colors.neutral.900)] active:translate-y-[2px] active:shadow-[0_1px_0_theme(colors.neutral.900)] hover:bg-neutral-50 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Đang kết nối...</span>
              </>
            ) : (
              <>
                {/* Google Icon inline nhỏ gọn */}
                <svg width="18" height="18" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:scale-110 shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--color-google-blue)" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--color-google-green)" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="var(--color-google-yellow)" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--color-google-red)" />
                </svg>
                <span>Tiếp tục với Google</span>
              </>
            )}
          </button>

          {/* Footnote */}
          <p className="mt-3 text-center font-sans text-[11px] text-neutral-400 leading-relaxed">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <a href="/terms" className="text-chizuru-600 hover:underline">Điều khoản</a>{' '}
            và{' '}
            <a href="/privacy" className="text-chizuru-600 hover:underline">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>
    </dialog>
  );
};

AuthRequiredModal.displayName = 'AuthRequiredModal';
