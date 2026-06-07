/**
 * auth.ts — Types cho Auth domain.
 */

export type UserRole = 'client' | 'companion' | 'admin'

export type CompanionApplicationStatus =
  | 'idle'
  | 'pending'
  | 'approved'
  | 'rejected'

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  role: UserRole
  companionApplicationStatus: CompanionApplicationStatus
}
