import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent = () => {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <span data-testid="user-role">{user ? user.role : 'guest'}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_URL = 'http://mock-backend.com';
  });

  it('loads the user on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'test-user', role: 'client', displayName: 'Test User' }),
    });
    global.fetch = fetchMock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After fetch
    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('client');
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me');
  });

  it('allows logging out', async () => {
    const user = userEvent.setup();

    let fetchCount = 0;
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/auth/me') {
        fetchCount++;
        if (fetchCount === 1) {
          return {
            ok: true,
            json: async () => ({ id: 'test-user', role: 'client', displayName: 'Test User' }),
          };
        } else {
          return {
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' }),
          };
        }
      }
      if (url === '/api/auth/logout') {
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      }
      return { ok: false, status: 404 };
    });
    global.fetch = fetchMock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('client');
    });

    const logoutBtn = screen.getByText('Logout');
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('guest');
    });

    expect(fetchMock).toHaveBeenCalledWith('http://mock-backend.com/api/v1/auth/logout', expect.any(Object));
  });
});
