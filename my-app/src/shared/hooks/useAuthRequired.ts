'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';

interface UseAuthRequiredOptions {
  /** Tiêu đề hiển thị trong modal */
  title?: string;
  /** Mô tả ngữ cảnh trong modal */
  description?: string;
}

interface UseAuthRequiredReturn {
  /** State đóng/mở AuthRequiredModal */
  isModalOpen: boolean;
  /** Wrapper: nếu user đã login → gọi action, chưa login → mở modal */
  requireAuth: (action?: () => void) => void;
  /** Đóng modal */
  closeModal: () => void;
  /** Tiêu đề truyền vào modal */
  title: string;
  /** Mô tả truyền vào modal */
  description: string;
}

/**
 * useAuthRequired — Hook kiểm tra auth trước khi thực thi action.
 *
 * Pattern:
 * ```tsx
 * const { requireAuth, isModalOpen, closeModal } = useAuthRequired({
 *   title: 'Để đặt hẹn',
 *   description: 'Bạn cần đăng nhập để đặt lịch hẹn với companion.',
 * });
 *
 * // Gắn vào nút:
 * <button onClick={() => requireAuth(() => router.push('/booking'))}>
 *   Đặt hẹn
 * </button>
 *
 * // Render modal bên dưới:
 * <AuthRequiredModal isOpen={isModalOpen} onClose={closeModal} />
 * ```
 */
export function useAuthRequired({
  title = 'Đăng nhập để tiếp tục',
  description = 'Bạn cần đăng nhập để sử dụng tính năng này.',
}: UseAuthRequiredOptions = {}): UseAuthRequiredReturn {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (user) {
        action?.();
      } else {
        setIsModalOpen(true);
      }
    },
    [user],
  );

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return { isModalOpen, requireAuth, closeModal, title, description };
}
