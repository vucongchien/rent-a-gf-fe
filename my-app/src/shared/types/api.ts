/**
 * api.ts — Generic types và helpers dùng chung cho API.
 */

/** Cấu trúc chi tiết lỗi validation ở root level */
export interface ApiErrorDetail {
  field: string
  description: string
}

/** Error response body dạng gRPC-Gateway Default Model */
export interface ApiErrorResponse {
  code: number | string
  message: string
  details?: ApiErrorDetail[]
}

/** Metadata phân trang dạng offset-based */
export interface PaginatedMeta {
  total: number
  page: number
  pageSize: number
}

/** Options truyền vào service từ Server Components / Route Handlers */
export interface ServiceRequestOptions {
  req?: { headers: { get(name: string): string | null } }
}
