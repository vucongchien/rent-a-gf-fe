import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarDropdown } from './AvatarDropdown';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useOAuthPopup } from '@/shared/hooks/useOAuthPopup';

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

// Mock hook useOAuthPopup
vi.mock('@/shared/hooks/useOAuthPopup', () => ({
  useOAuthPopup: vi.fn(),
}));

describe('AvatarDropdown', () => {
  const mockLogout = vi.fn().mockResolvedValue(undefined);
  const mockOpenOAuthPopup = vi.fn();
  const mockRefreshUser = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOAuthPopup).mockReturnValue({
      login: mockOpenOAuthPopup,
      isLoading: false,
    });
  });

  it('renders sign in button when guest', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      logout: mockLogout,
      refreshUser: mockRefreshUser,
    });

    render(<AvatarDropdown />);

    const signInBtn = screen.getByText('Đăng nhập');
    expect(signInBtn).toBeInTheDocument();
    expect(signInBtn.getAttribute('id')).toBe('avatar-dropdown-signin-btn');

    fireEvent.click(signInBtn);
    expect(mockOpenOAuthPopup).toHaveBeenCalled();
  });

  it('renders user avatar and dropdown menu when logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        userId: 'u-client-1',
        displayName: 'Minh Khách',
        email: 'minh@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'CLIENT',
      },
      isLoading: false,
      logout: mockLogout,
      refreshUser: mockRefreshUser,
    });

    render(<AvatarDropdown />);

    // Click avatar to open dropdown
    const avatarBtn = screen.getByLabelText('Account menu');
    fireEvent.click(avatarBtn);

    // Should show user info
    expect(screen.getByText('Minh Khách')).toBeInTheDocument();
    expect(screen.getByText('CLIENT')).toBeInTheDocument();

    const logoutBtn = screen.getByText('Đăng xuất');
    expect(logoutBtn).toBeInTheDocument();

    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/explore');
    });
  });
});
