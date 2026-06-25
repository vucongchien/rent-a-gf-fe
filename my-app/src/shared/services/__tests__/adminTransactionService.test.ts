import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('@/shared/lib/tokenRefresh', () => ({
  refreshTokensFromCookie: vi.fn(),
}));

import { cookies, headers } from 'next/headers';
import { adminTransactionService } from '../adminTransactionService';

describe('adminTransactionService', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1';
    vi.mocked(cookies).mockResolvedValue({
      toString: () => 'access_token=admin-token; refresh_token=refresh-token',
    } as never);
    vi.mocked(headers).mockResolvedValue({
      get: () => null,
    } as never);
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    vi.restoreAllMocks();
  });

  it('list() gửi request, map đúng transaction type và tính toán counts, totals', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              transactionId: 'tx-admin-1',
              userId: 'user-client',
              amount: 500,
              type: 'TOPUP',
              status: 'SUCCESS',
              referenceId: 'ref-admin-1',
              createdAt: '2026-06-25T13:00:00Z',
            },
            {
              transactionId: 'tx-admin-2',
              userId: 'user-companion',
              amount: 200,
              type: 'BOOKING_RESERVATION',
              status: 'SUCCESS',
              referenceId: 'ref-admin-2',
              createdAt: '2026-06-25T14:00:00Z',
            },
            {
              transactionId: 'tx-admin-3',
              userId: 'user-client',
              amount: 100,
              type: 'REFUND',
              status: 'FAILED',
              referenceId: 'ref-admin-3',
              createdAt: '2026-06-25T15:00:00Z',
            },
          ],
          total: 3,
          page: 1,
          pageSize: 15,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const result = await adminTransactionService.list({ page: 1, pageSize: 15 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/admin/transactions?page=1&pageSize=15',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      })
    );

    expect(result.rows).toHaveLength(3);
    // Giao dịch nạp tiền: isCredit=true => amount = 500
    expect(result.rows[0].amount).toBe(500);
    expect(result.rows[0].type).toBe('TOPUP');

    // Giao dịch cọc: isCredit=false => amount = -200
    expect(result.rows[1].amount).toBe(-200);
    expect(result.rows[1].type).toBe('BOOKING');

    // Counts: 2 SUCCESS, 0 PENDING, 1 FAILED
    expect(result.counts).toEqual({
      PENDING: 0,
      SUCCESS: 2,
      FAILED: 1,
    });

    // Totals chỉ tính SUCCESS: credit = 500 (TOPUP), debit = 200 (BOOKING), netFlow = 300
    expect(result.totals).toEqual({
      grossCredit: 500,
      grossDebit: 200,
      netFlow: 300,
    });
  });
});
