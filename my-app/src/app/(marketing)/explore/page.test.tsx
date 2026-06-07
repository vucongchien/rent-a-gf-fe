import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import ExplorePage from './page';
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { SidebarProvider } from '@/shared/contexts/SidebarContext';
import { WalletProvider } from '@/shared/contexts/WalletContext';

// Mock matchMedia for View Transitions if not supported in JSDOM
if (typeof document !== 'undefined') {
  // @ts-expect-error: mocking standard browser API
  document.startViewTransition = vi.fn((cb) => { cb(); return { ready: Promise.resolve(), finished: Promise.resolve() }});
}

// Mock next/navigation
vi.mock('next/navigation', () => {
  const params = new URLSearchParams();
  return {
    useRouter: () => ({
      replace: vi.fn(),
    }),
    useSearchParams: () => params,
    usePathname: () => '/explore',
  };
});

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe('ExplorePage Integration', () => {
  it('loads companions and displays them on mount', async () => {
    render(
      <SidebarProvider>
        <AuthProvider>
          <WalletProvider>
            <ExplorePage />
          </WalletProvider>
        </AuthProvider>
      </SidebarProvider>
    );

    // Dữ liệu mock ban đầu phải hiển thị danh sách trang đầu tiên (limit 6)
    await waitFor(() => {
      const grid = screen.getByTestId('companion-grid');
      expect(within(grid).getByText('Nguyễn Thị Linh')).toBeInTheDocument();
      expect(within(grid).getByText('Trần Hà My')).toBeInTheDocument();
      expect(within(grid).getByText('Phạm Bảo Châu')).toBeInTheDocument();
    });
  });

  it('filters list when clicking city filter chips', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <AuthProvider>
          <WalletProvider>
            <ExplorePage />
          </WalletProvider>
        </AuthProvider>
      </SidebarProvider>
    );

    await waitFor(() => {
      const grid = screen.getByTestId('companion-grid');
      expect(within(grid).getByText('Nguyễn Thị Linh')).toBeInTheDocument();
      expect(within(grid).getByText('Trần Hà My')).toBeInTheDocument(); // HN
    });

    // Lọc theo TP.HCM
    const hcmChip = screen.getByRole('button', { name: 'TP.HCM' });
    await user.click(hcmChip);

    await waitFor(() => {
      const grid = screen.getByTestId('companion-grid');
      // Nguyễn Thị Linh ở TP.HCM -> vẫn hiển thị
      expect(within(grid).getByText('Nguyễn Thị Linh')).toBeInTheDocument();
      // Trần Hà My ở Hà Nội -> biến mất
      expect(within(grid).queryByText('Trần Hà My')).not.toBeInTheDocument();
    });
  });

  it('loads more companions when load more button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <AuthProvider>
          <WalletProvider>
            <ExplorePage />
          </WalletProvider>
        </AuthProvider>
      </SidebarProvider>
    );

    await waitFor(() => {
      const grid = screen.getByTestId('companion-grid');
      expect(within(grid).getByText('Nguyễn Thị Linh')).toBeInTheDocument();
    });

    // Ban đầu không có comp-8 (Nguyễn Hoàng Yến) ở trang 1 vì limit = 6
    const grid = screen.getByTestId('companion-grid');
    expect(within(grid).queryByText('Nguyễn Hoàng Yến')).not.toBeInTheDocument();

    const loadMoreBtn = screen.getByRole('button', { name: /tải thêm/i });
    await user.click(loadMoreBtn);

    await waitFor(() => {
      const updatedGrid = screen.getByTestId('companion-grid');
      // Sau khi click tải thêm, comp-8 (trang tiếp theo) xuất hiện
      expect(within(updatedGrid).getByText('Nguyễn Hoàng Yến')).toBeInTheDocument();
    });
  });
});
