import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/finance/vnpay-return — Return URL VNPay redirect browser về sau thanh toán.
 *
 * BE là nguồn sự thật cho ví: `/finance/vnpay-ipn` verify hash và credit wallet.
 * BFF route này chỉ là UI adapter khi VNPay/browser quay về FE domain: map status
 * để hiển thị result page, tuyệt đối không credit wallet và không coi success UI là
 * bằng chứng thanh toán.
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
