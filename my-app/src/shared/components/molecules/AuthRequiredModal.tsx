'use client';

import React, { useEffect, useRef } from 'react';
import { CloseButton } from '../atoms/CloseButton';
import { Button } from '../atoms/Button';
import { HeartIcon, SpinnerIcon, GoogleIcon } from '../atoms/Icons';

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
          <Button
            variant="unstyled"
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            id="auth-modal-google-login-btn"
            className="group w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border-[1.5px] border-neutral-900 bg-white font-sans font-semibold text-[14px] text-neutral-900 cursor-pointer transition-all duration-150 shadow-[0_3px_0_theme(colors.neutral.900)] active:translate-y-[2px] active:shadow-[0_1px_0_theme(colors.neutral.900)] hover:bg-neutral-50 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <SpinnerIcon size={16} className="text-neutral-500" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              <>
                <GoogleIcon size={18} className="transition-transform duration-300 group-hover:scale-110 shrink-0" />
                <span>Tiếp tục với Google</span>
              </>
            )}
          </Button>

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
