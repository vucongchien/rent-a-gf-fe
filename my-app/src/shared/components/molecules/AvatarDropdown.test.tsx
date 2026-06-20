import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarDropdown } from './AvatarDropdown';
import { useAuth } from '@/shared/contexts/AuthContext';

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
    });

    render(<AvatarDropdown />);

    const signInBtn = screen.getByText('Sign in');
    expect(signInBtn).toBeInTheDocument();

    fireEvent.click(signInBtn);
    expect(mockLogin).toHaveBeenCalledWith('client');
  });

  it('renders user avatar and switch options when logged in as CLIENT', () => {
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
    });

    render(<AvatarDropdown />);

    // Click avatar to open dropdown
    const avatarBtn = screen.getByLabelText('Account menu');
    fireEvent.click(avatarBtn);

    // Should show user info
    expect(screen.getByText('Minh Khách')).toBeInTheDocument();
    expect(screen.getByText('CLIENT')).toBeInTheDocument();

    // Should show other role switch buttons
    const compBtn = screen.getByText('👧 Bạn gái (Linh)');
    const adminBtn = screen.getByText('🔑 Admin');

    expect(compBtn).toBeInTheDocument();
    expect(adminBtn).toBeInTheDocument();
    expect(screen.queryByText('👤 Khách hàng (Minh)')).not.toBeInTheDocument();

    // Click to switch role
    fireEvent.click(compBtn);
    expect(mockLogin).toHaveBeenCalledWith('companion');
  });

  it('renders correct switch options when logged in as COMPANION', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        userId: 'u-comp-1',
        displayName: 'Nguyễn Thị Linh',
        email: 'linh@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'COMPANION',
      },
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
    });

    render(<AvatarDropdown />);

    const avatarBtn = screen.getByLabelText('Account menu');
    fireEvent.click(avatarBtn);

    const clientBtn = screen.getByText('👤 Khách hàng (Minh)');
    const adminBtn = screen.getByText('🔑 Admin');

    expect(clientBtn).toBeInTheDocument();
    expect(adminBtn).toBeInTheDocument();
    expect(screen.queryByText('👧 Đóng vai Bạn gái')).not.toBeInTheDocument();

    fireEvent.click(clientBtn);
    expect(mockLogin).toHaveBeenCalledWith('client');
  });
});
