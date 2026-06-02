# API Contract

**System:** Rent-a-Girlfriend Platform
**Scope:** `apps/web` BFF (`/api/*`) — FE không gọi thẳng microservices
**Auth:** Google OAuth → JWT lưu HttpOnly Cookie
**Last updated:** 2026-05-17

---

# 1. Philosophy

## BFF là giao điểm duy nhất

```text
Browser
  ↓  (HTTP + Cookie)
Next.js BFF  /api/*
  ↓  (JWT Header)
API Gateway
  ↓
Microservices
```

FE không bao giờ biết về service nội bộ. BFF nhận request, đính JWT, forward, transform response.

## Auth behavior

| Scenario | Behavior |
| --- | --- |
| Cookie hết hạn | BFF trả `401` → FE redirect `/login` |
| Không đủ quyền | BFF trả `403` → FE hiển thị `AccessDeniedError` |
| Endpoint public | Không cần cookie |
| Companion-only | Middleware guard kiểm tra `role === 'companion'` |

---

# 2. Standard Formats

## Mutation có tác động tài chính

```typescript
// Bắt buộc header:
'X-Idempotency-Key': string  // UUIDv4 sinh từ client
```

## Response — Success

```typescript
{
  data: T
  meta?: { page: number; limit: number; total: number; hasNextPage: boolean }
}
```

## Response — Error

```typescript
{
  error: {
    code: string       // "INSUFFICIENT_BALANCE" | "BOOKING_NOT_FOUND" | ...
    message: string    // human-readable, hiển thị toast
    field?: string     // nếu là validation error
  }
}
```

## Pagination

```typescript
// Cursor-based (realtime lists: chat, notifications)
?cursor=<lastId>&limit=20
→ { items: T[], nextCursor: string | null }

// Offset-based (explore, search)
?page=1&limit=20
→ { data: T[], meta: { page, limit, total, hasNextPage } }
```

---

# 3. Domain: Auth

## POST /api/auth/google
Bắt đầu OAuth flow → redirect Google → set HttpOnly Cookie → redirect app.

## POST /api/auth/logout
Clear cookie → redirect `/`.

## GET /api/auth/me

```typescript
{
  data: {
    id: string
    email: string
    displayName: string
    avatarUrl: string
    role: 'client' | 'companion' | 'admin'   // Mặc định là 'client' ngay sau khi đăng ký bằng Google OAuth
    companionApplicationStatus: 'idle' | 'pending' | 'approved' | 'rejected'  // Trạng thái đơn đăng ký làm Companion
  }
}
```

## POST /api/companion/apply
Gửi hồ sơ đăng ký nâng cấp tài khoản từ Client lên Companion. **Bắt buộc Idempotency Key.**

```typescript
// Body
{
  nickname: string
  city: string
  avatarUrl: string
  albumUrls: string[]
  voiceIntroUrl: string
  initialScenarios: {
    name: string
    description: string
    durationMinutes: number
    priceInCoin: number
    location: string
  }[]
}

// Response 201
{
  data: {
    companionApplicationStatus: 'pending'
  }
}
```

---

# 4. Domain: Discovery

## GET /api/companions

```typescript
// Query: ?city=&keyword=&minPrice=&maxPrice=&page=&limit=20
// Response
{
  data: {
    items: {
      id: string
      displayName: string
      avatarUrl: string
      city: string
      ratingAvg: number
      reviewCount: number
      featuredScenario: { name: string; priceInCoin: number }
      voiceIntroUrl: string | null
    }[]
    meta: { page; limit; total; hasNextPage }
  }
}
```

## GET /api/companions/[companionId]

```typescript
{
  data: {
    id: string
    displayName: string
    bio: string
    city: string
    avatarUrl: string
    albumUrls: string[]
    voiceIntroUrl: string | null
    ratingAvg: number
    reviewCount: number
    scenarios: { id; name; description; durationMinutes; priceInCoin; location }[]
    recentReviews: Review[]
  }
}
```

---

# 5. Domain: Booking

## POST /api/bookings

Tạo booking. **Bắt buộc Idempotency Key.**

```typescript
// Body
{ companionId: string; scenarioId: string; scheduledAt: string; note?: string }

// Response 201
{ data: { id: string; status: 'PENDING'; frozenCoin: number } }

// Error codes:
// INSUFFICIENT_BALANCE  → toast + link /wallet/topup
// COMPANION_UNAVAILABLE → toast error
// DUPLICATE_REQUEST     → trả booking cũ (200)
```

## GET /api/bookings

```typescript
// Query: ?status=pending|accepted|completed|cancelled|disputed&page=
// Response
{
  data: {
    items: {
      id: string
      companionId: string
      companionName: string
      companionAvatarUrl: string
      scenarioName: string
      scheduledAt: string
      endsAt: string
      status: BookingStatus
      priceInCoin: number
      chatRoomId: string | null
    }[]
    meta: { page; limit; total; hasNextPage }
  }
}
```

## GET /api/bookings/[bookingId]

Trả `BookingListItem` + `scenarioLocation`, `escrowStatus`, `review`, `timeline`.

## PATCH /api/bookings/[bookingId]/cancel

**Idempotency Key bắt buộc.**
```typescript
{ data: { status: 'CANCELLED'; refundedCoin: number } }
// Error: CANCEL_NOT_ALLOWED | LATE_CANCEL_FEE
```

## PATCH /api/bookings/[bookingId]/accept *(Companion only)*

```typescript
{ data: { status: 'ACCEPTED'; chatRoomId: string } }
```

## PATCH /api/bookings/[bookingId]/reject *(Companion only)*

```typescript
{ data: { status: 'REJECTED' } }
```

## POST /api/bookings/[bookingId]/report

```typescript
// Body: { reason: 'NO_SHOW' | 'INAPPROPRIATE_BEHAVIOR' | 'FRAUD' | 'OTHER'; description: string }
{ data: { status: 'DISPUTED'; escrowFrozen: true } }
```

---

# 6. Domain: Review

## POST /api/bookings/[bookingId]/review

```typescript
// Body: { rating: 1-5; comment: string }
// Response 201: { data: { id; rating; comment } }
// Error: REVIEW_ALREADY_EXISTS | BOOKING_NOT_COMPLETED
```

---

# 7. Domain: Wallet

## GET /api/wallet

```typescript
{
  data: {
    balance: number
    frozenBalance: number
    transactions: {
      id; label; amountInCoin; type: 'debit' | 'credit'; status; createdAt
    }[]
  }
}
```

## POST /api/wallet/topup/initiate

**Idempotency Key bắt buộc.**

```typescript
// Body: { amountInCoin: number }  // min 100, max 10000
{ data: { transactionId: string; paymentUrl: string } }
```

## GET /api/wallet/topup/[txId]/status

```typescript
{ data: { status: 'pending' | 'success' | 'failed'; creditedCoin: number | null } }
```

---

# 8. Domain: Chat

## GET /api/chat/rooms

```typescript
{
  data: {
    rooms: {
      id; bookingId; participantName; participantAvatarUrl
      lastMessage: string | null; lastMessageAt: string | null
      isLocked: boolean; unreadCount: number
    }[]
  }
}
```

## GET /api/chat/rooms/[roomId]/messages

```typescript
// Query: ?cursor=&limit=20
{ data: { items: ChatMessage[]; nextCursor: string | null } }

type ChatMessage = { id; senderId; senderName; content; sentAt; status: 'sent' | 'failed' }
```

## POST /api/chat/rooms/[roomId]/messages

**Idempotency Key bắt buộc.**

```typescript
// Body: { content: string }
// Response 201: { data: ChatMessage }
// Error: ROOM_LOCKED
```

---

# 8b. Domain: Companion Scenarios *(Companion only)*

## GET /api/companion/scenarios
Lấy toàn bộ danh sách kịch bản do Companion tự định nghĩa (bao gồm cả active và inactive).

```typescript
{
  data: {
    scenarios: {
      id: string
      name: string
      description: string
      durationMinutes: number
      priceInCoin: number
      location: string
      isActive: boolean
      isFeatured: boolean
    }[]
  }
}
```

## POST /api/companion/scenarios
Thêm kịch bản mới. **Bắt buộc Idempotency Key.**

```typescript
// Body
{
  name: string
  description: string
  durationMinutes: number
  priceInCoin: number
  location: string
  isFeatured?: boolean
}

// Response 201
{
  data: {
    id: string
    name: string
    description: string
    durationMinutes: number
    priceInCoin: number
    location: string
    isActive: boolean
    isFeatured: boolean
  }
}

// Error codes:
// SCENARIO_LIMIT_EXCEEDED  → toast báo lỗi giới hạn 10 kịch bản
// DUPLICATE_SCENARIO_NAME  → báo lỗi trùng tên kịch bản
// VALIDATION_ERROR         → lỗi validate khoảng giá (100 - 10000 coin) hoặc độ dài text
```

## PUT /api/companion/scenarios/[scenarioId]
Cập nhật kịch bản. **Bắt buộc Idempotency Key.**

```typescript
// Body
{
  name?: string
  description?: string
  durationMinutes?: number
  priceInCoin?: number
  location?: string
  isActive?: boolean
  isFeatured?: boolean
}

// Response 200
{
  data: {
    id: string
    name: string
    description: string
    durationMinutes: number
    priceInCoin: number
    location: string
    isActive: boolean
    isFeatured: boolean
  }
}

// Error codes:
// NOT_FOUND                → kịch bản không tồn tại
// VALIDATION_ERROR         → dữ liệu nhập vào không hợp lệ
```

## DELETE /api/companion/scenarios/[scenarioId]
Xóa mềm kịch bản (Companion hủy đăng ký kịch bản này).

```typescript
// Response 200
{
  data: {
    success: boolean
  }
}
```

---

# 9. Realtime: SSE Endpoints

| Endpoint | Dùng cho | Auth |
| --- | --- | --- |
| `GET /api/sse/user` | Notifications + booking status | Cookie |
| `GET /api/sse/chat/[roomId]` | Chat messages | Cookie + member |
| `GET /api/sse/topup/[txId]` | VNPay IPN result | Cookie + owner |

## SSE Event Schema

```typescript
type SSEEvent = {
  type:
    | 'BOOKING_ACCEPTED' | 'BOOKING_REJECTED'
    | 'BOOKING_COMPLETED' | 'BOOKING_DISPUTED'
    | 'TOPUP_SUCCESS' | 'TOPUP_FAILED'
    | 'CHAT_MESSAGE'
    | 'NOTIFICATION_NEW'
    | 'ONBOARDING_APPROVED' | 'ONBOARDING_REJECTED'
  payload: Record<string, unknown>
}
```

## SSE Consumer Pattern

```typescript
// Nhận event → invalidate cache → React Query refetch → UI tự đồng bộ
switch (event.type) {
  case 'BOOKING_ACCEPTED':
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
    queryClient.invalidateQueries({ queryKey: ['wallet'] })
    break
  case 'TOPUP_SUCCESS':
    queryClient.invalidateQueries({ queryKey: ['wallet'] })
    break
}
```

---

# 10. Error Code Registry

| Code | HTTP | FE Action |
| --- | --- | --- |
| `UNAUTHENTICATED` | 401 | Redirect `/login` |
| `FORBIDDEN` | 403 | Show `AccessDeniedError` |
| `NOT_FOUND` | 404 | Show `NotFoundError` |
| `INSUFFICIENT_BALANCE` | 422 | Toast + link `/wallet/topup` |
| `DUPLICATE_REQUEST` | 200 | Dùng resource cũ, không báo lỗi |
| `BOOKING_NOT_ALLOWED` | 422 | Toast error |
| `ROOM_LOCKED` | 422 | Update chat → readonly |
| `REVIEW_ALREADY_EXISTS` | 409 | Refetch booking → ẩn nút review |
| `COMPANION_UNAVAILABLE` | 422 | Toast + suggest |
| `VALIDATION_ERROR` | 400 | Inline field error |
| `SCENARIO_LIMIT_EXCEEDED` | 422 | Toast "Đã đạt giới hạn tối đa 10 kịch bản" |
| `DUPLICATE_SCENARIO_NAME` | 422 | Inline error "Tên kịch bản này đã tồn tại" |
| `INTERNAL_ERROR` | 500 | Toast "Lỗi hệ thống, thử lại sau" |
