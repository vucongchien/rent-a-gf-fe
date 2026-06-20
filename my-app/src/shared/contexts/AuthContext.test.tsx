import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Setup mock server
const server = setupServer(
  http.get('/api/auth/me', () => {
    return HttpResponse.json({ id: 'test-user', role: 'client', displayName: 'Test User' });
  }),
  http.post('/api/auth/mock-switch', async ({ request }) => {
    const { role } = await request.json() as { role: string };
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json({ id: `test-${role}`, role, displayName: `Test ${role}` });
      })
    );
    return HttpResponse.json({ role });
  }),
  http.post('/api/auth/logout', () => {
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
      })
    );
    return HttpResponse.json({ success: true });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TestComponent = () => {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <span data-testid="user-role">{user ? user.role : 'guest'}</span>
      <button onClick={() => login('companion')}>Login as Companion</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('loads the user on mount', async () => {
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
  });

  it('allows switching to a different role', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('client');
    });

    const loginBtn = screen.getByText('Login as Companion');
    await user.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('companion');
    });
  });

  it('allows logging out', async () => {
    const user = userEvent.setup();
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
  });
});
