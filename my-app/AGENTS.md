<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Next.js 15/16 Caching Rules
- **Dữ liệu công cộng (Public)**: Được phép sử dụng `"use cache"`, `cacheLife()` và `cacheTag()` ở cấp hàm (ví dụ: danh sách/chi tiết bạn đồng hành).
- **Dữ liệu cá nhân hóa (User-specific)**: CẤM TUYỆT ĐỐI sử dụng `"use cache"` vì đây là global cache (chia sẻ trên toàn bộ người dùng), dùng sai sẽ gây rò rỉ dữ liệu. Phải sử dụng dynamic fetch trực tiếp hoặc React `cache()` (per-request scope).

