import { headers } from 'next/headers'

/**
 * Trả về userId của request hiện tại, đọc từ header `user-id` do middleware
 * (`my-app/middleware.ts`) inject sau khi decode JWT trong cookie HttpOnly.
 *
 * Dùng trong:
 * - Server Component (page/layout)
 * - Server Action
 * - Route Handler
 *
 * KHÔNG được gọi trong hàm có directive `'use cache'` (vì `headers()` là dynamic API).
 * Phải gọi ở caller, rồi truyền userId xuống cached function làm arg (nếu cần).
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const h = await headers()
    return h.get('user-id')
  } catch {
    return null
  }
}
