/**
 * ApiError — lỗi có nguồn gốc từ backend (HTTP error response).
 * Dùng để phân biệt với lỗi mạng (network down) hay lỗi runtime.
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status code */
    public readonly status: number,
    /** Error code từ backend hoặc BFF */
    public readonly code: string,
    message: string,
    /** Raw response body nếu cần debug */
    public readonly raw?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static notFound(message = 'Không tìm thấy') {
    return new ApiError(404, 'NOT_FOUND', message)
  }

  static unauthorized(message = 'Chưa đăng nhập') {
    return new ApiError(401, 'UNAUTHENTICATED', message)
  }

  static internal(message = 'Lỗi hệ thống') {
    return new ApiError(500, 'INTERNAL_ERROR', message)
  }

  static serviceUnavailable(message = 'Backend không khả dụng') {
    return new ApiError(503, 'SERVICE_UNAVAILABLE', message)
  }
}

/** Kiểm tra nhanh không cần instanceof */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
