# BFF Layer — Backend for Frontend

**Hệ thống:** Rent-a-Girlfriend Platform  
**Vị trí:** `apps/web` — `src/app/api/*`  
**Cập nhật:** 2026-06-07

---

## Tổng quan

BFF (Backend for Frontend) là tầng trung gian nằm giữa browser client và backend microservices.

```
Browser
  └─ fetch("/api/*")
        └─ Next.js Route Handler (BFF)
              ├─ Extract JWT từ HttpOnly Cookie
              ├─ Transform response (backend shape → frontend shape)
              ├─ Normalize error format
              └─ API Gateway → Backend Microservices
```

### Tại sao cần BFF thay vì gọi thẳng backend?

| Vấn đề | Không có BFF | Có BFF |
|---|---|---|
| Backend thay đổi field name | Client code phải sửa | Chỉ Route Handler sửa |
| CORS | Backend phải config | Không cần (same-origin) |
| Lộ URL backend | URL expose ở browser | URL chỉ tồn tại ở server |
| Auth token | JWT lộ ở JS scope | JWT chỉ trong HttpOnly Cookie |
| Aggregate calls | Client gọi nhiều request | BFF gộp thành 1 |

---

## Auth Flow

```
Browser → request kèm HttpOnly Cookie (JWT session từ Google OAuth)
BFF (apiClient.ts) → đọc cookie tên AUTH_COOKIE_NAME (env)
                    → thêm Authorization: Bearer <JWT>
Backend API Gateway → xác thực JWT, inject User-Id, User-Role header
```

**Env var:**
```env
AUTH_COOKIE_NAME=access_token   # Tên cookie chứa JWT (mặc định: access_token)
API_URL=http://localhost:8080    # URL backend. Không set = MSW tự intercept
```

---

## Toggle Mock / Real

Không cần `MOCK_ENABLED` env:

```
API_URL có set?
  ├─ YES → Route Handler chạy, forward sang backend thực
  └─ NO  → Route Handler throw 503, MSW intercept trước ở browser
```

**Dev offline:** Không set `API_URL`, MSW browser worker tự handle `/api/*`.  
**Staging/Prod:** Set `API_URL` vào environment của server.

---

## File Structure

```
src/
├── shared/
│   ├── lib/
│   │   ├── apiClient.ts     — serverFetch() + toErrorPayload()
│   │   ├── apiError.ts      — ApiError class
│   │   └── cacheTags.ts     — CACHE_TAGS constants
│   └── types/
│       ├── index.ts         — barrel export
│       ├── api.ts           — ApiResponse, PaginatedResponse
│       ├── auth.ts          — User, UserRole
│       ├── booking.ts       — Booking, BookingStatus
│       ├── chat.ts          — ChatRoom, ChatMessage
│       ├── companion.ts     — Companion, CompanionDetail
│       ├── notification.ts  — Notification
│       └── wallet.ts        — Wallet, TopupResult
└── app/api/
    ├── auth/
    │   ├── me/route.ts           no-cache
    │   └── logout/route.ts       no-cache
    ├── companions/
    │   ├── route.ts              revalidate: 60s | tags: companions, companions-list
    │   └── [companionId]/route.ts revalidate: 300s | tags: companions, companion-{id}
    ├── bookings/
    │   ├── route.ts              no-cache (GET + POST)
    │   └── [bookingId]/
    │       ├── route.ts          no-cache
    │       ├── cancel/route.ts   no-cache
    │       ├── accept/route.ts   no-cache
    │       └── reject/route.ts   no-cache
    ├── wallet/
    │   ├── route.ts              no-cache
    │   └── topup/
    │       ├── initiate/route.ts no-cache
    │       └── [txId]/status/route.ts no-cache
    ├── chat/rooms/
    │   ├── route.ts              no-cache
    │   └── [roomId]/messages/route.ts no-cache (GET + POST)
    └── notifications/
        ├── route.ts              revalidate: 30s | tags: notifications
        ├── [notifId]/read/route.ts no-cache + revalidateTag
        └── read-all/route.ts    no-cache + revalidateTag
```

---

## Cache Tags

Tất cả tags được định nghĩa tập trung tại `src/shared/lib/cacheTags.ts`:

```typescript
CACHE_TAGS.COMPANIONS          // invalidate toàn bộ companion cache
CACHE_TAGS.COMPANIONS_LIST     // chỉ list, giữ nguyên detail
CACHE_TAGS.companion('id')     // 1 companion cụ thể
CACHE_TAGS.NOTIFICATIONS       // toàn bộ notification cache
```

### On-demand revalidation

```typescript
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/shared/lib/cacheTags'

// Khi companion profile update:
revalidateTag(CACHE_TAGS.companion('comp-123'), { expire: 0 })
revalidateTag(CACHE_TAGS.COMPANIONS_LIST, { expire: 0 })

// Khi có notification mới (từ SSE event):
revalidateTag(CACHE_TAGS.NOTIFICATIONS, { expire: 0 })
```

---

## Types — Single Source of Truth

**Quy tắc:** Tất cả types phải được import từ `@/shared/types`, không định nghĩa local trong feature.

```typescript
// ❌ Sai — định nghĩa local
interface Companion { id: string; ... }

// ✅ Đúng — dùng shared types
import type { Companion } from '@/shared/types'
```

Types được owned bởi **frontend team** (BFF contract). Backend có thể thay đổi schema nhưng chỉ cần update Route Handler transform, không ảnh hưởng client.

---

## BFF Transforms

Một số endpoint cần transform vì backend schema khác client types:

| Endpoint | Transform |
|---|---|
| `GET /companions` | Thêm `metadata: []` nếu backend không trả |
| `POST /bookings` | `bookingId` → `id` trong response |
| `POST /wallet/topup/initiate` | Backend trả `paymentUrl` (VNPay), không phải `newBalance` |

> [!WARNING]
> **Wallet topup flow**: Real backend trả về `paymentUrl` để redirect user sang VNPay.
> Client hiện tại (`WalletContext.topup()`) cần được cập nhật khi kết nối backend thực
> để xử lý redirect thay vì expect `newBalance` trực tiếp.

---

## Error Format

BFF normalize mọi lỗi về shape chuẩn:

```typescript
// Client nhận:
{ status: number; code: string; message: string }

// Ví dụ:
{ status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy' }
{ status: 503, code: 'SERVICE_UNAVAILABLE', message: '[BFF] Không thể kết nối backend...' }
```

Backend error format (`{ error: { code, message, field } }`) được parse trong `apiClient.ts` trước khi throw `ApiError`.

---

## Thêm Route Handler Mới

Pattern chuẩn:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { serverFetch, toErrorPayload } from '@/shared/lib/apiClient'
import type { ApiResponse, MyType } from '@/shared/types'

export const dynamic = 'force-dynamic' // hoặc: export const revalidate = 60

export async function GET(req: NextRequest) {
  try {
    const data = await serverFetch<ApiResponse<MyType>>('/my-endpoint', {
      req,
      searchParams: req.nextUrl.searchParams,
      // next: { revalidate: 60, tags: [CACHE_TAGS.MY_TAG] }
    })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
```
