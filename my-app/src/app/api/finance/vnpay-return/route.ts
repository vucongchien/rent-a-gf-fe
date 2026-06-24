import { NextRequest, NextResponse } from 'next/server';
import { isMockMode } from '@/shared/lib/env';
import { mockWallet, mockPendingTopups } from '@/mocks/fixtures/data';

/**
 * GET /api/finance/vnpay-return — Return URL VNPay redirect browser về sau thanh toán.
 *
 * SSOT §2.4: BE thật verify hash & update wallet qua IPN (server-to-server).
 * BFF chỉ:
 *   - Parse query params VNPay
 *   - Redirect tới trang kết quả với status mapped
 *   - KHÔNG verify hash (BE đã verify)
 *
 * Mock mode (Phase 1.A): vì không có IPN flow, BFF kiêm luôn việc update
 * mockWallet khi response code = 00.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const orderId = sp.get('vnp_TxnRef') ?? '';
  const responseCode = sp.get('vnp_ResponseCode') ?? '';
  const amountRaw = sp.get('vnp_Amount') ?? '0';
  const amountVnd = Number(amountRaw) / 100;
  const amountCoin = Math.round(amountVnd / 1000);

  // Map VNPay response code → app status.
  // 00 = success, 24 = user cancel, others = fail.
  let status: 'success' | 'cancelled' | 'failed' = 'failed';
  if (responseCode === '00') status = 'success';
  else if (responseCode === '24') status = 'cancelled';

  if (isMockMode() && status === 'success') {
    // Credit wallet vì mock không có IPN flow.
    const pending = mockPendingTopups.get(orderId);
    const credited = pending?.amount ?? amountCoin;
    mockWallet.availableBalance += credited;
    mockWallet.transactions.unshift({
      transactionId: `tx-topup-${orderId}`,
      walletId: mockWallet.walletId,
      description: 'Nạp tiền VNPay (mock)',
      amount: credited,
      type: 'CREDIT',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });
    mockPendingTopups.delete(orderId);
  } else if (isMockMode()) {
    // Pending vẫn xoá để không leak memory.
    mockPendingTopups.delete(orderId);
  }

  const qs = new URLSearchParams({
    status,
    orderId,
    amount: String(amountCoin),
    code: responseCode,
  });
  return NextResponse.redirect(new URL(`/wallet/topup/result?${qs.toString()}`, req.url));
}
