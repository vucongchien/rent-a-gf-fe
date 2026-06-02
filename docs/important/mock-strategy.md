# Mock Strategy

**System:** Rent-a-Girlfriend Platform
**Scope:** `apps/web` — mock-driven development, tách biệt FE khỏi BE
**Tool:** MSW (Mock Service Worker) v2
**Last updated:** 2026-05-17

---

# 1. Philosophy

## Tại sao mock-first?

FE development không nên bị block bởi BE chưa sẵn sàng.

3 lợi ích cốt lõi:

| Lợi ích | Mô tả |
| --- | --- |
| **Development speed** | FE chạy hoàn toàn độc lập, không cần BE local |
| **Reliable testing** | Test không phụ thuộc network, không flaky |
| **UX exploration** | Dễ thử các trạng thái edge case (loading, empty, error) |

## Nguyên tắc

```text
KHÔNG làm:
  component → random hardcoded JSON → render

PHẢI làm:
  component → Repository interface → Mock Adapter → Fake Data
```

Khi BE sẵn sàng, chỉ cần swap Mock Adapter → Real Adapter. Component không thay đổi.

---

# 2. Architecture

## Mock Layer Stack

```text
UI Components
     ↓
Repository (interface)
     ↓
Mock Adapter   ←→   Real Adapter (production)
     ↓
Fake Data (fixtures)
```

## Cơ chế switch

Dùng environment variable để switch layer:

```typescript
// src/lib/api.ts
const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true'

export const companionRepo = isMock
  ? new MockCompanionRepository()
  : new RealCompanionRepository()
```

Không cần thay đổi bất kỳ component nào khi switch.

---

# 3. MSW Setup

## Vị trí file

```text
src/
└── mocks/
    ├── browser.ts          # MSW browser worker setup
    ├── server.ts           # MSW Node server (cho Jest/Vitest)
    ├── handlers/
    │   ├── index.ts        # export tất cả handlers
    │   ├── auth.ts
    │   ├── companions.ts
    │   ├── bookings.ts
    │   ├── wallet.ts
    │   ├── chat.ts
    │   └── notifications.ts
    └── fixtures/
        ├── companions.ts
        ├── bookings.ts
        ├── wallet.ts
        └── chat.ts
```

## browser.ts

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

## server.ts (cho test)

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

## Kích hoạt trong dev

```typescript
// src/app/layout.tsx (hoặc src/instrumentation.ts)
if (process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true') {
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}
```

---

# 4. Mock Fidelity Levels

Không phải mọi feature cần mock cùng mức độ. Định nghĩa 4 level:

| Level | Tên | Mô tả | Dùng khi |
| --- | --- | --- | --- |
| **L1** | Static JSON | Trả fixed data, không delay | Prototype nhanh |
| **L2** | Fake latency | Có `delay(800ms)`, simulate loading | Kiểm tra loading state |
| **L3** | Stateful | Mock có state thay đổi (list thêm/xóa) | Form, CRUD flows |
| **L4** | Full fidelity | Auth, SSE, pagination, error scenarios | Pre-production testing |

Mục tiêu MVP: **L3** cho core flows, **L4** cho Wallet + Booking.

---

# 5. Mock Handlers — Core Examples

## Auth

```typescript
// handlers/auth.ts
import { http, HttpResponse, delay } from 'msw'

export const authHandlers = [
  http.get('/api/auth/me', async () => {
    await delay(300)
    return HttpResponse.json({
      data: fixtures.currentUser   // switch giữa guest/client/companion
    })
  }),

  http.post('/api/auth/logout', async () => {
    await delay(200)
    return HttpResponse.json({ data: { success: true } })
  }),
]
```

## Companions

```typescript
// handlers/companions.ts
export const companionHandlers = [
  http.get('/api/companions', async ({ request }) => {
    await delay(800)   // fake network latency
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const page = Number(url.searchParams.get('page') ?? 1)

    let items = fixtures.companions
    if (city) items = items.filter(c => c.city === city)

    const limit = 6
    const start = (page - 1) * limit
    return HttpResponse.json({
      data: {
        items: items.slice(start, start + limit),
        meta: { page, limit, total: items.length, hasNextPage: start + limit < items.length }
      }
    })
  }),
]
```

## Booking — Stateful Mock

```typescript
// handlers/bookings.ts
// Mock có state thay đổi sau mỗi action
let mockBookings = [...fixtures.bookings]

export const bookingHandlers = [
  http.get('/api/bookings', async () => {
    await delay(600)
    return HttpResponse.json({ data: { items: mockBookings, meta: { total: mockBookings.length } } })
  }),

  http.post('/api/bookings', async ({ request }) => {
    await delay(1200)
    const body = await request.json()
    const newBooking = createMockBooking(body as any)
    mockBookings.unshift(newBooking)
    return HttpResponse.json({ data: newBooking }, { status: 201 })
  }),

  http.patch('/api/bookings/:id/cancel', async ({ params }) => {
    await delay(800)
    mockBookings = mockBookings.map(b =>
      b.id === params.id ? { ...b, status: 'CANCELLED' } : b
    )
    return HttpResponse.json({ data: { status: 'CANCELLED', refundedCoin: 200 } })
  }),
]
```

---

# 6. Fake Auth — Role Switching

Trong dev, cần test nhiều role mà không cần login thật.

```typescript
// src/mocks/fixtures/auth.ts
export const mockUsers = {
  guest: null,
  client: { id: 'u-client-1', role: 'client', displayName: 'Minh Khách', ... },
  companion: { id: 'u-comp-1', role: 'companion', displayName: 'Linh Companion', ... },
  admin: { id: 'u-admin-1', role: 'admin', displayName: 'Admin', ... },
}

// Đổi user trong dev toolbar:
export let currentMockUser = mockUsers.client
export function setMockUser(role: keyof typeof mockUsers) {
  currentMockUser = mockUsers[role]
}
```

Dev Toolbar (chỉ hiện khi `NEXT_PUBLIC_MOCK_ENABLED=true`):

```tsx
// src/components/dev/DevToolbar.tsx
<select onChange={e => setMockUser(e.target.value as any)}>
  <option value="guest">Guest</option>
  <option value="client">Client</option>
  <option value="companion">Companion</option>
  <option value="admin">Admin</option>
</select>
```

---

# 7. Fake SSE

SSE không thể mock bằng MSW handler HTTP thông thường. Dùng `ReadableStream`:

```typescript
// handlers/sse.ts
http.get('/api/sse/user', async () => {
  const stream = new ReadableStream({
    async start(controller) {
      // Simulate booking accepted sau 2s
      await delay(2000)
      controller.enqueue(
        `data: ${JSON.stringify({ type: 'BOOKING_ACCEPTED', payload: { bookingId: 'bk-1' } })}\n\n`
      )
      // Simulate notification sau 5s
      await delay(3000)
      controller.enqueue(
        `data: ${JSON.stringify({ type: 'NOTIFICATION_NEW', payload: fixtures.notification })}\n\n`
      )
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}),
```

---

# 8. Fake Pagination

```typescript
// utils/paginate.ts
export function fakePaginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit
  const sliced = items.slice(start, start + limit)
  return {
    items: sliced,
    meta: {
      page,
      limit,
      total: items.length,
      hasNextPage: start + limit < items.length
    }
  }
}
```

---

# 9. Fake Optimistic Update

Optimistic update là FE concern — không cần mock đặc biệt.
Mock chỉ cần respond đúng sau delay:

```typescript
// handler cancel booking: delay 800ms rồi trả kết quả
// React Query Optimistic Update sẽ:
// 1. Update UI ngay lập tức
// 2. Gửi request (→ mock handler)
// 3. Nếu OK: giữ nguyên
// 4. Nếu lỗi: rollback

// Để test rollback, dùng error scenario:
http.patch('/api/bookings/:id/cancel', () => {
  return HttpResponse.json(
    { error: { code: 'CANCEL_NOT_ALLOWED', message: 'Không thể hủy lúc này' } },
    { status: 422 }
  )
}),
```

---

# 10. Fake Error Scenarios

Định nghĩa các scenario lỗi có thể bật/tắt trong dev:

```typescript
// src/mocks/scenarios.ts
export type ErrorScenario =
  | 'none'
  | 'insufficient_balance'
  | 'companion_unavailable'
  | 'network_timeout'
  | 'server_error'

export let activeScenario: ErrorScenario = 'none'

// Dùng trong handler:
http.post('/api/bookings', async () => {
  if (activeScenario === 'insufficient_balance') {
    return HttpResponse.json(
      { error: { code: 'INSUFFICIENT_BALANCE', message: 'Số dư không đủ' } },
      { status: 422 }
    )
  }
  if (activeScenario === 'network_timeout') {
    await delay(15000)   // trigger timeout
    return HttpResponse.error()
  }
  // Happy path
  await delay(1200)
  return HttpResponse.json({ data: newMockBooking() }, { status: 201 })
}),
```

---

# 11. Fixtures Structure

```typescript
// src/mocks/fixtures/companions.ts
export const companions: CompanionRaw[] = [
  {
    id: 'comp-1',
    display_name: 'Nguyễn Thị Linh',
    avatar_url: 'https://i.pravatar.cc/400?u=comp-1',
    city: 'TP.HCM',
    rating_avg: 4.8,
    review_count: 23,
    status: 'APPROVED',
    voice_intro_url: '/mock-audio/intro-1.mp3',
    featured_scenario: {
      id: 'sc-1',
      name: 'Cà phê & trò chuyện',
      price_in_coin: 200,
    },
  },
  // ... thêm 5-10 fixtures đủ để test filter/pagination
]
```

**Quy tắc fixtures:**
- Đủ đa dạng để test filter (nhiều city, nhiều price range)
- Có đủ số lượng để test pagination (>6 items)
- Cover edge cases: companion chưa có rating, không có voice intro
- Dùng `https://i.pravatar.cc` cho avatar placeholder

---

# 12. Mock Fidelity Matrix — Per Feature

| Feature | Level | Fake latency | Fake auth | Fake SSE | Fake pagination | Fake error |
| --- | --- | --- | --- | --- | --- | --- |
| Explore / Search | L3 | ✅ 800ms | — | — | ✅ | ✅ empty state |
| Companion Profile | L2 | ✅ 600ms | — | — | — | ✅ 404 |
| Booking Creation | L4 | ✅ 1200ms | ✅ | — | — | ✅ INSUFFICIENT_BALANCE |
| Booking List | L3 | ✅ 600ms | ✅ | — | ✅ | ✅ empty |
| Wallet / Top-up | L4 | ✅ | ✅ | ✅ IPN | — | ✅ FAILED |
| Chat | L4 | ✅ | ✅ | ✅ messages | ✅ cursor | ✅ ROOM_LOCKED |
| Notifications | L3 | ✅ | ✅ | ✅ | ✅ | — |
| Onboarding | L3 | ✅ | ✅ | ✅ APPROVED/REJECTED | — | — |

---

# 13. Test Integration

MSW server dùng trong unit test / component test:

```typescript
// vitest.setup.ts
import { server } from '@/mocks/server'
import { beforeAll, afterAll, afterEach } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Override handler trong test cụ thể:

```typescript
it('should show error toast on insufficient balance', async () => {
  server.use(
    http.post('/api/bookings', () =>
      HttpResponse.json(
        { error: { code: 'INSUFFICIENT_BALANCE', message: 'Số dư không đủ' } },
        { status: 422 }
      )
    )
  )

  // render component → trigger booking → assert toast
})
```
