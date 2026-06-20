/**
 * auth.ts — Types cho Auth domain.
 */

export type UserRole = 'CLIENT' | 'COMPANION' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'LOCKED'

export interface User {
  userId: string
  email: string
  displayName: string
  avatarUrl: string
  role: UserRole
}

export interface UserAccount {
  userId: string
  email: string
  role: UserRole
  status: UserStatus
  violationCount: number
}

export interface UpgradeRequest {
  requestId: string
  userId: string
  email: string
  biography: string
  availableCities: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}
