import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/finance/vnpay-return — Return URL VNPay redirect browser về sau thanh toán.
 *
 * SSOT §2.4: BE verify hash & update wallet qua IPN (server-to-server).
 * BFF chỉ parse query params VNPay rồi redirect tới trang kết quả với status mapped.
 * KHÔNG verify hash (BE đã verify).
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

  const qs = new URLSearchParams({
    status,
    orderId,
    amount: String(amountCoin),
    code: responseCode,
  });
  return NextResponse.redirect(new URL(`/wallet/topup/result?${qs.toString()}`, req.url));
}
