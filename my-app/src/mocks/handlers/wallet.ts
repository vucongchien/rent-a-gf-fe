import { http, HttpResponse, delay } from 'msw'
import { mockWallet } from '../fixtures/data'

export const walletHandlers = [
  // GET /api/finance/wallet
  http.get('/api/finance/wallet', async () => {
    await delay(500)
    return HttpResponse.json({
      walletId: mockWallet.walletId,
      userId: mockWallet.userId,
      availableBalance: mockWallet.availableBalance,
      frozenBalance: mockWallet.frozenBalance,
    })
  }),

  // POST /api/finance/topup — Phase 1.A: trả paymentUrl trỏ về mock checkout,
  // KHÔNG credit ngay. Wallet chỉ được credit khi user xác nhận ở
  // /api/finance/vnpay-return (mô phỏng flow VNPay thật).
  http.post('/api/finance/topup', async ({ request }) => {
    await delay(1200)
    const body = await request.json() as { userId: string; amount: number }
    if (!body.amount || body.amount < 100) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Số tiền nạp tối thiểu là 100 Kano-Coin' },
        { status: 400 }
      )
    }

    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const qs = new URLSearchParams({ orderId, amount: String(body.amount) })
    return HttpResponse.json({
      paymentUrl: `/mock/vnpay/checkout?${qs.toString()}`,
    })
  }),

  // GET /api/finance/transactions (dùng cho Transaction Logs)
  http.get('/api/finance/transactions', async () => {
    await delay(500)
    return HttpResponse.json(mockWallet.transactions)
  }),
]

