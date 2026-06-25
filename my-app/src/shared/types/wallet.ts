/**
 * wallet.ts — Types cho Wallet domain.
 */

export interface Wallet {
  walletId: string
  userId: string
  availableBalance: number
  frozenBalance: number
}

export interface TopupRequestBody {
  amount: number
}

export interface TopupResponse {
  paymentUrl: string
}

export interface VnPayIpnResponse {
  RspCode: string
  Message: string
}

export interface WalletTransaction {
  transactionId: string
  walletId: string
  amount: number
  type: 'CREDIT' | 'DEBIT'
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  createdAt: string
  description?: string
}
