export interface TopupResultSearchParams {
  status?: string;
  orderId?: string;
  amount?: string;
  code?: string;
  vnp_Amount?: string;
  vnp_ResponseCode?: string;
  vnp_TxnRef?: string;
}

export function parseTopupResult(params: TopupResultSearchParams) {
  const responseCode = params.code ?? params.vnp_ResponseCode ?? '';
  const status: 'success' | 'cancelled' | 'failed' =
    params.status === 'success' || params.vnp_ResponseCode === '00'
      ? 'success'
      : params.status === 'cancelled' || params.vnp_ResponseCode === '24'
        ? 'cancelled'
        : 'failed';
  const amount = params.amount
    ? Number(params.amount)
    : params.vnp_Amount
      ? Math.round(Number(params.vnp_Amount) / 100 / 1000)
      : 0;

  return {
    status,
    orderId: params.orderId ?? params.vnp_TxnRef ?? '',
    amount: Number.isFinite(amount) ? amount : 0,
    code: responseCode,
  };
}
