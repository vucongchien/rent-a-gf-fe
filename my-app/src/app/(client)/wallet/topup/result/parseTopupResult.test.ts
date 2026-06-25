import { describe, expect, it } from 'vitest'
import { parseTopupResult } from './parseTopupResult'

describe('parseTopupResult', () => {
  it('map VNPay success params thành success result', () => {
    expect(parseTopupResult({
      vnp_ResponseCode: '00',
      vnp_Amount: '50000000',
      vnp_TxnRef: 'txn-1',
    })).toEqual({
      status: 'success',
      orderId: 'txn-1',
      amount: 500,
      code: '00',
    })
  })

  it('map VNPay user cancel params thành cancelled result', () => {
    expect(parseTopupResult({
      vnp_ResponseCode: '24',
      vnp_Amount: '10000000',
      vnp_TxnRef: 'txn-2',
    })).toEqual({
      status: 'cancelled',
      orderId: 'txn-2',
      amount: 100,
      code: '24',
    })
  })

  it('giữ app query params đã normalize', () => {
    expect(parseTopupResult({
      status: 'success',
      amount: '200',
      orderId: 'order-1',
      code: '00',
    })).toEqual({
      status: 'success',
      orderId: 'order-1',
      amount: 200,
      code: '00',
    })
  })
})
