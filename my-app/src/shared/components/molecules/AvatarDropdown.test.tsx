import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarDropdown } from './AvatarDropdown';
import { useAuth } from '@/shared/contexts/AuthContext';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

// Mock hook useAuth
vi.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AvatarDropdown', () => {
  const mockLogin = vi.fn().mockResolvedValue(undefined);
  const mockLogout = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in button when guest', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      refreshUser: vi.fn().mockResolvedValue(undefined),
      refreshSession: vi.fn().mockResolvedValue(undefined),
      handleUnauthorized: vi.fn().mockResolvedValue(undefined),
    });

    render(<AvatarDropdown />);

    const signInBtn = screen.getByText('Đăng nhập');
    expect(signInBtn).toBeInTheDocument();
    expect(signInBtn.getAttribute('id')).toBe('avatar-dropdown-signin-btn');
  });

  it('renders user avatar and logout only when logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        userId: 'u-client-1',
        displayName: 'Minh Khách',
        email: 'minh@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'CLIENT',
      },
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      refreshUser: vi.fn().mockResolvedValue(undefined),
      refreshSession: vi.fn().mockResolvedValue(undefined),
      handleUnauthorized: vi.fn().mockResolvedValue(undefined),
    });

    render(<AvatarDropdown />);

    // Click avatar to open dropdown
    const avatarBtn = screen.getByLabelText('Account menu');
    fireEvent.click(avatarBtn);

    // Should show user info
    expect(screen.getByText('Minh Khách')).toBeInTheDocument();
    expect(screen.getByText('CLIENT')).toBeInTheDocument();

    // Should not show dev role switch buttons
    expect(screen.queryByText('Đóng vai (Dev)')).not.toBeInTheDocument();
    expect(screen.queryByText('👧 Bạn gái (Linh)')).not.toBeInTheDocument();
    expect(screen.queryByText('🔑 Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('👤 Khách hàng (Minh)')).not.toBeInTheDocument();

    const logoutBtn = screen.getByText('Đăng xuất');
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
