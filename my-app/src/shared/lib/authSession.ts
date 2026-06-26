import { AUTH_COOKIE_NAME } from './authCookies'
import type { User, UserRole } from '@/shared/types'

type RequestLike = { headers: { get(name: string): string | null } }

const USER_ROLES = new Set<UserRole>(['CLIENT', 'COMPANION', 'ADMIN'])

export function parseCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=')
    const json = typeof atob === 'function'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString('utf8')
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function pickString(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return null
}

export function userFromJwtPayload(payload: Record<string, unknown> | null): User | null {
  if (!payload) return null
  if (typeof payload.exp === 'number' && payload.exp <= Math.floor(Date.now() / 1000)) {
    return null
  }

  const userId = pickString(payload, ['userId', 'user_id', 'sub', 'id'])
  const role = pickString(payload, ['role', 'userRole'])
  if (!userId || !role || !USER_ROLES.has(role as UserRole)) return null

  const email = pickString(payload, ['email']) ?? ''
  const displayName = pickString(payload, ['displayName', 'display_name', 'name', 'preferred_username'])
    ?? email
    ?? 'User'
  const avatarUrl = pickString(payload, ['avatarUrl', 'avatar_url', 'picture']) ?? ''

  return {
    userId,
    email,
    displayName,
    avatarUrl,
    role: role as UserRole,
  }
}

export function getUserFromCookieHeader(cookieHeader: string | null | undefined): User | null {
  const token = parseCookieValue(cookieHeader, AUTH_COOKIE_NAME)
  return token ? userFromJwtPayload(decodeJwtPayload(token)) : null
}

export function getUserFromRequest(req: RequestLike): User | null {
  return getUserFromCookieHeader(req.headers.get('cookie'))
}
