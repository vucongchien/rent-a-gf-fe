import { ApiError } from './apiError'
import { AUTH_COOKIE_NAME } from './authCookies'
import { getUserFromRequest, parseCookieValue } from './authSession'
import type { ApiErrorDetail, ServiceRequestOptions } from '@/shared/types'

export interface NotificationFetchOptions extends ServiceRequestOptions {
  searchParams?: URLSearchParams
  method?: 'GET' | 'PATCH'
}

function getNotificationApiUrl() {
  const explicitUrl = process.env.NOTIFICATION_API_URL
  if (explicitUrl) return explicitUrl.replace(/\/$/, '')

  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    throw ApiError.serviceUnavailable('API_URL chưa được cấu hình cho Notification Service')
  }

  const url = new URL(apiUrl)
  url.pathname = url.pathname.replace(/\/api\/v1\/?$/, '/v1')
  return url.toString().replace(/\/$/, '')
}

export function buildNotificationUrl(path: string, searchParams?: URLSearchParams) {
  const url = new URL(`${getNotificationApiUrl()}${path}`)
  searchParams?.forEach((value, key) => url.searchParams.set(key, value))
  return url
}

export function buildNotificationHeaders(req?: ServiceRequestOptions['req']) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const cookieHeader = req?.headers.get('cookie') ?? ''
  const accessToken = parseCookieValue(cookieHeader, AUTH_COOKIE_NAME)
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const userId = req?.headers.get('user-id') ?? (req ? getUserFromRequest(req)?.userId : null)
  if (userId) headers['user-id'] = userId

  return headers
}

export async function notificationFetch<T = unknown>(
  path: string,
  options: NotificationFetchOptions = {},
): Promise<T> {
  const { req, searchParams, method = 'GET' } = options
  const res = await fetch(buildNotificationUrl(path, searchParams), {
    method,
    headers: buildNotificationHeaders(req),
    cache: 'no-store',
  })

  if (!res.ok) {
    let code: string | number = `HTTP_${res.status}`
    let message = `Notification Service trả về ${res.status} cho ${method} ${path}`
    let details: ApiErrorDetail[] = []
    let raw: unknown = null
    try {
      raw = await res.json()
      const errBody = raw as { code?: string | number; message?: string; details?: ApiErrorDetail[] }
      if (errBody?.code !== undefined) code = errBody.code
      if (errBody?.message) message = errBody.message
      if (errBody?.details) details = errBody.details
    } catch {
      // ignore non-JSON errors
    }
    throw new ApiError(res.status, code, message, details, raw)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
