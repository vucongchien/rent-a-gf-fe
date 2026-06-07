/**
 * wallet.ts — Types cho Wallet domain.
 */

export type TransactionType = 'credit' | 'debit'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface WalletTransaction {
  id: string
  label: string
  amountInCoin: number
  type: TransactionType
  status: TransactionStatus
  createdAt: string
}

export interface Wallet {
  balance: number
  frozenBalance: number
  transactions: WalletTransaction[]
}

/** Kết quả topup */
export interface TopupResult {
  success: boolean
  transactionId: string
  newBalance: number
}

/** Polling status của topup */
export interface TopupStatus {
  status: 'pending' | 'success' | 'failed'
  creditedCoin: number
}
