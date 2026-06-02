import { http, HttpResponse, delay } from 'msw'
import { mockWallet } from '../fixtures/data'

export const walletHandlers = [
  // GET /api/wallet
  http.get('/api/wallet', async () => {
    await delay(500)
    return HttpResponse.json({ data: mockWallet })
  }),

  // POST /api/wallet/topup/initiate
  http.post('/api/wallet/topup/initiate', async ({ request }) => {
    await delay(800)
    const body = await request.json() as { amountInCoin: number }
    if (!body.amountInCoin || body.amountInCoin < 100) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Số tiền tối thiểu là 100 Kano-Coin' } },
        { status: 400 }
      )
    }
    const txId = `tx-topup-${Date.now()}`
    return HttpResponse.json({
      data: {
        transactionId: txId,
        paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock=true&txId=${txId}`,
      },
    })
  }),

  // GET /api/wallet/topup/:txId/status
  http.get('/api/wallet/topup/:txId/status', async () => {
    await delay(500)
    // Mock: luôn trả success sau 1 lần poll
    return HttpResponse.json({
      data: { status: 'success', creditedCoin: 500 },
    })
  }),
]
