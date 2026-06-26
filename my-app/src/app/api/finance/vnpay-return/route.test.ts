import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/finance/vnpay-return', () => {
  it('map VNPay success query sang result page', async () => {
    const req = new NextRequest(
      'http://localhost/api/finance/vnpay-return?vnp_TxnRef=order-1&vnp_ResponseCode=00&vnp_Amount=10000000',
    )

    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost/wallet/topup/result?status=success&orderId=order-1&amount=100&code=00',
    )
  })

  it('map VNPay cancel query sang result page', async () => {
    const req = new NextRequest(
      'http://localhost/api/finance/vnpay-return?vnp_TxnRef=order-2&vnp_ResponseCode=24&vnp_Amount=5000000',
    )

    const res = await GET(req)

    expect(res.headers.get('location')).toBe(
      'http://localhost/wallet/topup/result?status=cancelled&orderId=order-2&amount=50&code=24',
    )
  })
})
