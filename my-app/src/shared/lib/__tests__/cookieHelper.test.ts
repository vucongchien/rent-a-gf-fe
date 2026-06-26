import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRequestCookieHeader } from '../cookieHelper';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

import { cookies, headers } from 'next/headers';

describe('getRequestCookieHeader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('trả về nguyên req nếu được truyền', async () => {
    const req = { headers: { get: vi.fn().mockReturnValue('cookie-value') } };
    const out = await getRequestCookieHeader(req);
    expect(out).toBe(req);
  });

  it('fallback sang next/headers cookies() khi không truyền req', async () => {
    const fakeCookieStore = { toString: () => 'access_token=abc; foo=bar' };
    vi.mocked(cookies).mockResolvedValueOnce(fakeCookieStore as never);
    vi.mocked(headers).mockResolvedValueOnce({
      get: (name: string) => (name === 'user-role' ? 'ADMIN' : null),
    } as never);

    const out = await getRequestCookieHeader();
    expect(out).toBeDefined();
    expect(out!.headers.get('cookie')).toBe('access_token=abc; foo=bar');
    expect(out!.headers.get('Cookie')).toBe('access_token=abc; foo=bar'); // case-insensitive
    expect(out!.headers.get('user-role')).toBe('ADMIN');
    expect(out!.headers.get('authorization')).toBeNull();
  });

  it('trả về undefined nếu cookies() throw (ngoài request scope)', async () => {
    vi.mocked(cookies).mockRejectedValueOnce(new Error('outside request'));
    const out = await getRequestCookieHeader();
    expect(out).toBeUndefined();
  });
});
