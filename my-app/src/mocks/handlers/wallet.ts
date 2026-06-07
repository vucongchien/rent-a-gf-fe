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
    await delay(1200) // tạo khoảng trễ giả lập xử lý ngân hàng mượt mà
    const body = await request.json() as { amountInCoin: number }
    if (!body.amountInCoin || body.amountInCoin < 100) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Số tiền tối thiểu là 100 Kano-Coin' } },
        { status: 400 }
      )
    }
    
    // Cộng tiền trực tiếp vào database mock client-side
    mockWallet.balance += body.amountInCoin
    
    const txId = `tx-topup-${Date.now()}`
    mockWallet.transactions.unshift({
      id: txId,
      label: 'Nạp tiền Kano-Coin',
      amountInCoin: body.amountInCoin,
      type: 'credit',
      status: 'completed',
      createdAt: new Date().toISOString()
    })

    return HttpResponse.json({
      data: {
        success: true,
        transactionId: txId,
        newBalance: mockWallet.balance,
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
