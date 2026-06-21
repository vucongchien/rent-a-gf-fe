'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseIcon } from './Icons';
import { CompassIcon } from './Icons';

/**
 * CompanionModeToggle — Nút chuyển đổi giữa Client Mode và Companion Workspace.
 *
 * - Tự phát hiện chế độ hiện tại dựa theo `pathname`.
 * - Companion Mode (`/dashboard/*`): Hiển thị CompassIcon → Link về `/explore`.
 * - Client Mode (tất cả route khác): Hiển thị BriefcaseIcon → Link sang `/dashboard`.
 *
 * Component này được thiết kế **cô lập hoàn toàn**:
 * - Không nhận props để thay đổi hành vi.
 * - Có thể đặt ở bất kỳ vị trí nào (NavList tab thứ 5, Actions bar, Header...).
 *
 * @example
 * // Dùng như một NavItem bên ngoài NavBar
 * <CompanionModeToggle className="w-8 h-8" />
 */
export interface CompanionModeToggleProps {
  /** Class CSS bổ sung cho icon (size, màu sắc khi active...) */
  className?: string;
  /** Kích thước icon (px). Mặc định: 20 */
  size?: number;
}

export const CompanionModeToggle: React.FC<CompanionModeToggleProps> = ({
  className = '',
  size = 20,
}) => {
  const pathname = usePathname();
  const isCompanionMode = pathname.startsWith('/dashboard');

  if (isCompanionMode) {
    return (
      <Link
        href="/explore"
        aria-label="Quay về trang Khám phá"
        title="Quay về trang Khám phá"
        className={className}
      >
        <CompassIcon size={size} />
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      aria-label="Vào Companion Workspace"
      title="Vào Companion Workspace"
      className={className}
    >
      <BriefcaseIcon size={size} />
    </Link>
  );
};

CompanionModeToggle.displayName = 'CompanionModeToggle';
