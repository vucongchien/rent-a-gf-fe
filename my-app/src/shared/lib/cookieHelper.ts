import { cookies } from 'next/headers'

type RequestLike = { headers: { get(name: string): string | null } }

/**
 * Trả về object dạng `{ headers: { get } }` để feed vào `serverFetch` qua
 * option `req`. Forward toàn bộ cookie hiện tại sang BE.
 *
 * - Route Handler / API: truyền NextRequest vào để dùng nguyên header gốc.
 * - Server Component / Server Action: bỏ trống, helper tự đọc `cookies()`.
 *
 * Hỗ trợ unify cách 5+ service trước đây cùng copy-paste cùng 1 helper.
 */
export async function getRequestCookieHeader(req?: RequestLike): Promise<RequestLike | undefined> {
  if (req) return req
  try {
    const cookieStore = await cookies()
    return {
      headers: {
        get: (name: string) => (name.toLowerCase() === 'cookie' ? cookieStore.toString() : null),
      },
    }
  } catch {
    return undefined
  }
}
