import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUserId } from '../userContext';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

import { headers } from 'next/headers';

describe('getCurrentUserId', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('trả về userId từ header user-id do middleware inject', async () => {
    vi.mocked(headers).mockResolvedValueOnce({
      get: (name: string) => (name === 'user-id' ? 'u-123' : null),
    } as never);

    expect(await getCurrentUserId()).toBe('u-123');
  });

  it('null khi header user-id thiếu', async () => {
    vi.mocked(headers).mockResolvedValueOnce({
      get: () => null,
    } as never);

    expect(await getCurrentUserId()).toBeNull();
  });

  it('null khi gọi ngoài request scope (headers throw)', async () => {
    vi.mocked(headers).mockRejectedValueOnce(new Error('outside request'));
    expect(await getCurrentUserId()).toBeNull();
  });
});
