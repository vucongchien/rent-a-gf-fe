<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Next.js 15/16 Caching Rules
- **Dữ liệu công cộng (Public)**: Được phép sử dụng `"use cache"`, `cacheLife()` và `cacheTag()` ở cấp hàm (ví dụ: danh sách/chi tiết bạn đồng hành).
- **Dữ liệu cá nhân hóa (User-specific)**: CẤM TUYỆT ĐỐI sử dụng `"use cache"` vì đây là global cache (chia sẻ trên toàn bộ người dùng), dùng sai sẽ gây rò rỉ dữ liệu. Phải sử dụng dynamic fetch trực tiếp hoặc React `cache()` (per-request scope).

## Service Layer & Data Fetching Pattern

Repo là **FE + BFF** (Next App Router). BE thật là microservice do team khác lo. Service ở `src/shared/services/` là lớp duy nhất gọi BE thật qua `serverFetch` (`src/shared/lib/apiClient.ts`).

### Ai gọi service như thế nào?

| Caller | Cách gọi | Lý do |
|---|---|---|
| **Server Component** (page, layout không có `'use client'`) | `import { service } from '@/shared/services/...'` → `await service.method()` | 0 hop HTTP, data inline vào HTML stream, hợp PPR |
| **Server Action** (`'use server'` file) | Tương tự SC — import service trực tiếp | Cùng process, an toàn forward cookie |
| **Client Component** (`'use client'`) — mutation | Import Server Action từ `app/actions/*` rồi gọi | Server Action chạy server-side, có thể `revalidateTag`, `redirect` |
| **Client Component** — SSE / long polling / webhook / MSW mock | `fetch('/api/...')` qua Route Handler | Browser bắt buộc qua HTTP. Route handler là vỏ mỏng wrap service |

❌ **KHÔNG được**: Server Component gọi `fetch('/api/...')` của chính app. Thừa 1 hop HTTP, mất cache directive ở service.

### Khi nào tạo Route Handler

Chỉ khi có caller browser-side thực sự:
- SSE stream (`/api/notifications/stream`)
- Polling từ client (`useChat` poll messages, `WalletContext` poll balance)
- VNPay / payment callback URL
- MSW mock interception (debug page, dev offline)

Mutation từ form / button click → **dùng Server Action**, không tạo route handler.

### Error handling convention

Service **throw `ApiError`** (đã có cấu trúc `status`, `code`, `message`). Caller quyết UI:

- **Route Handler**: `try/catch` → `toErrorPayload(err)` (sẵn ở `apiClient.ts`) → `NextResponse.json(payload, { status })`.
- **Server Action**: `try/catch` → map sang state `{ status: 'error', message }` cho `useActionState`.
- **Server Component**: bọc `<Suspense fallback>` hoặc dùng `error.tsx` boundary; hoặc `try/catch` tại page nếu cần fallback inline.

Service **KHÔNG được** nuốt lỗi bằng `return []` / `return null` (trừ trường hợp ngữ nghĩa rõ: `authService.getMe` trả `null` = "chưa login").

### Cache strategy theo loại data

| Loại | Method | Directive | Tag | Life |
|---|---|---|---|---|
| Public list (companions) | `getCompanions` | `'use cache'` | `companionsList(scope)` builder | `minutes` |
| Public detail | `getCompanionDetail` | `'use cache'` | `companion(id)` | `minutes` |
| Public config | `configService.get` | `'use cache'` | `APP_CONFIG` | `hours` |
| User-specific (per-render dedupe) | `authService.getMe`, `companionService.getMyProfile` | React `cache()` từ `'react'` | — | per-request scope |
| User-specific fresh (wallet, bookings, chat, notifications) | — | dynamic fetch | — | — |

**Sau mutation**: gọi `revalidateTag(TAG, { expire: 0 })` ở Server Action / Route Handler. Tag là **builder per-entity** (`CACHE_TAGS.companion(id)`), KHÔNG dùng global string cho user-specific (leak risk).

### userId source

Middleware (`my-app/middleware.ts`) decode JWT từ cookie `access_token`, inject header `user-id` vào request. Service / Action / Route Handler đọc qua `getCurrentUserId()` ở `src/shared/lib/userContext.ts`.

Lưu ý: **không** gọi `getCurrentUserId()` (hay `headers()`, `cookies()`) bên trong hàm có `'use cache'` — dynamic API bị cấm. Lấy userId ở caller, truyền xuống làm arg.

### Idempotency

Mutation tài chính (topup) phải forward header `x-idempotency-key` từ client xuống BE. Pattern: route handler đọc header → truyền vào service qua `options.idempotencyKey` → service set `extraHeaders` cho `serverFetch`. Echo lại header trong response để client confirm. Reference: `app/api/finance/topup/route.ts`, `app/api/bookings/route.ts`.
