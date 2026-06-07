/**
 * api.ts — Generic response wrappers dùng chung cho toàn bộ BFF layer.
 *
 * BFF Route Handlers dùng các type này để type-check response trả về client.
 * Client dùng để type-check kết quả fetch('/api/*').
 */

/** Response đơn giản, có 1 item */
export interface ApiResponse<T> {
  data: T
}

/** Response dạng danh sách có phân trang cursor-based */
export interface CursorPaginatedResponse<T> {
  data: {
    items: T[]
    meta: {
      total: number
      limit: number
      cursor: string | null
      nextCursor: string | null
      hasNextPage: boolean
    }
  }
}

/** Response dạng danh sách có phân trang offset-based (page/limit) */
export interface PagePaginatedResponse<T> {
  data: {
    items: T[]
    meta: {
      page: number
      limit: number
      total: number
      hasNextPage: boolean
    }
  }
}

/** Error response chuẩn từ BFF */
export interface ApiErrorResponse {
  status: number
  code: string
  message: string
}
