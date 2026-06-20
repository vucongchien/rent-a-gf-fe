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

  // POST /api/finance/topup
  http.post('/api/finance/topup', async ({ request }) => {
    await delay(1200)
    const body = await request.json() as { userId: string; amount: number }
    if (!body.amount || body.amount < 100) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Số tiền nạp tối thiểu là 100 Kano-Coin' },
        { status: 400 }
      )
    }

    mockWallet.availableBalance += body.amount
    
    const txId = `tx-topup-${Date.now()}`
    mockWallet.transactions.unshift({
      transactionId: txId,
      walletId: mockWallet.walletId,
      description: 'Nạp tiền VNPay',
      amount: body.amount,
      type: 'CREDIT' as const,
      status: 'SUCCESS' as const,
      createdAt: new Date().toISOString()
    })

    return HttpResponse.json({
      paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${body.amount * 1000 * 100}&vnp_TxnRef=${txId}`
    })
  }),

  // GET /api/finance/transactions (dùng cho Transaction Logs)
  http.get('/api/finance/transactions', async () => {
    await delay(500)
    return HttpResponse.json(mockWallet.transactions)
  }),
]

