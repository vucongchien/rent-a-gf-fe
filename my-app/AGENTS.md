<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Next.js 15/16 Caching Rules
- **Dữ liệu công cộng (Public)**: Được phép sử dụng `"use cache"`, `cacheLife()` và `cacheTag()` ở cấp hàm (ví dụ: danh sách/chi tiết bạn đồng hành).
- **Dữ liệu cá nhân hóa (User-specific)**: VẪN dùng `"use cache"` được — nhưng **BẮT BUỘC** kèm `cacheTag()` chứa identifier riêng của user/entity để mỗi user có cache slot riêng và có thể invalidate chính xác bằng `revalidateTag()` sau mutation. Không tag = cache global = rò rỉ dữ liệu.

  ```ts
  // services/userService.ts
  import { unstable_cacheTag as cacheTag } from 'next/cache';

  export async function getUserById(userId: string) {
    'use cache';
    cacheTag(`user-${userId}`);
    return db.user.findUnique({ where: { id: userId } });
  }

  // Sau mutation:
  // revalidateTag(`user-${userId}`);
  ```

  Quy ước tag: `<entity>-<id>` cho per-entity, `<entity>-list-<scopeKey>` cho list. Scope key phải bao gồm mọi tham số phân biệt (filter, page, viewer role nếu có khác biệt hiển thị).

