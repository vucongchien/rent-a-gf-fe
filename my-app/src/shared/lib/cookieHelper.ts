import { cookies, headers } from 'next/headers'

type RequestLike = { headers: { get(name: string): string | null } }

/**
 * Trả về object dạng `{ headers: { get } }` để feed vào `serverFetch` qua
 * option `req`. Forward toàn bộ cookie hiện tại sang BE.
 *
 * - Route Handler / API: truyền NextRequest vào để dùng nguyên header gốc.
 * - Server Component / Server Action: bỏ trống, helper tự đọc `cookies()` và
 *   request headers do middleware inject (`user-id`, `user-role`, `user-email`).
 *
 * Hỗ trợ unify cách 5+ service trước đây cùng copy-paste cùng 1 helper.
 */
export async function getRequestCookieHeader(req?: RequestLike): Promise<RequestLike | undefined> {
  if (req) return req
  try {
    const cookieStore = await cookies()
    const headerStore = await headers()
    const cookieHeader = headerStore.get('cookie') ?? cookieStore.toString()
    return {
      headers: {
        get: (name: string) => (
          name.toLowerCase() === 'cookie'
            ? cookieHeader
            : headerStore.get(name)
        ),
      },
    }
  } catch {
    return undefined
  }
}
