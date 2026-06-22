# Services Review — `my-app/src/shared/services/`

> Generated: 2026-06-22
> Reviewers: 7 parallel sub-agents, 1 per service
> Scope: 7 service modules + corresponding route handlers in `my-app/src/app/api/*`
> Reference: `my-app/AGENTS.md` (caching rules cập nhật 2026-06-22)

---

## 0. Executive Summary

### Verdict per service

| Service | LOC | Verdict | Critical issues |
|---|---|---|---|
| `authService` | 66 | **NEEDS-TUNING** | Không có cache; logout không `revalidateTag`; duplicate `getRequestCookieHeader` helper |
| `bookingService` | 217 | **NEEDS-TUNING / REWORK** | Không dùng `"use cache"` / `cacheTag` dù AGENTS.md yêu cầu; `isMock` duplicate 5 lần; inconsistent error handling |
| `chatService` | 131 | **NEEDS-TUNING** | Chat history user-specific nhưng không tag → leak risk khi bật cache; thiếu pagination; type thiếu participants |
| `companionService` | 193 | **NEEDS-TUNING** | Public list/detail tag tốt; `getMyProfile()` thiếu `"use cache"` + tag per-user; mutations không revalidate |
| `configService` | 17 | **NEEDS-TUNING** | Public data nhưng không có cache directive; thiếu type registry cho config keys |
| `notificationService` | 118 | **REWORK** | Tag `NOTIFICATIONS` là global string → **leak rủi ro cao** nếu bật cache; thiếu `userId` trong service args |
| `walletService` | 100 | **NEEDS-TUNING / REWORK** | Hardcoded `userId: 'u-client-1'`; topup thiếu idempotency key; thiếu cache invalidation sau mutation |

### Cross-cutting issues (issue lặp ở >= 3 service)

1. **🔴 Cache strategy không tuân AGENTS.md** — 6/7 service không dùng `"use cache"` + `cacheTag()`. AGENTS.md (2026-06-22) cho phép cache user-specific *nếu* tag theo entity/user id. Bỏ trống = mất performance + trống thiết kế.
2. **🔴 `getRequestCookieHeader` duplicate 5 lần** — copy-paste ở `authService`, `bookingService`, `chatService`, `notificationService`, `walletService` (line 6-23 mỗi file). Maintenance burden + bug fan-out.
3. **🟠 `isMock` env-check duplicate** — pattern `process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL` lặp lại trong `bookingService` (5 chỗ), `chatService`, `walletService`.
4. **🟠 Inconsistent error handling** — một số method catch và return empty array (`getTransactions`), một số throw (`getWallet`), một số catch và return null (`getMe`). Không có quy ước chung.
5. **🟠 Mutation route handlers không gọi `revalidateTag`** — ngay cả ở `companionService` (đã có cache) và `notificationService` (đã có `CACHE_TAGS.NOTIFICATIONS` global) — sau mutation không invalidate đúng cách.
6. **🟡 `cacheTags.ts` registry chưa đầy đủ** — chỉ có `COMPANIONS*`, `NOTIFICATIONS`. Thiếu `BOOKINGS`, `CHAT_ROOMS`, `WALLET`, `USER_ME`, `AUTH`. Mỗi service tự rải tag string.
7. **🟡 userId không truyền vào service** — service tin BE đọc JWT để biết user. OK cho call simple, nhưng **chặn cache theo userId** (Next cache key theo function args, không theo cookie).

---

## 1. authService.ts — NEEDS-TUNING

### Token forwarding — ✅ OK
- Dùng `cookies()` từ `next/headers` đúng pattern Next 16.
- `getRequestCookieHeader()` fallback khi không có `req` truyền vào.
- Service chỉ import ở route handler (`/api/auth/me`, `/api/auth/logout`), không leak ra client.

### Cache strategy — ⚠️ MISSING
- `getMe()` mỗi lần gọi fetch thực, không cache.
- **Đề xuất**:
  ```ts
  async getMe(options?: ServiceRequestOptions): Promise<User | null> {
    'use cache';
    cacheTag(CACHE_TAGS.USER_ME);
    cacheLife('hours');
    // ...
  }
  ```
- Route handler `logout` PHẢI gọi `revalidateTag(CACHE_TAGS.USER_ME)` sau khi xoá session.

### Route handler — ✅ OK (cần giữ)
- AuthContext (`'use client'`) gọi `fetch('/api/auth/me')` → cần route handler để extract HttpOnly cookie.
- Server Action có thể thay nhưng route handler an toàn hơn cho browser-initiated request.

### Types — ⚠️ thiếu nhỏ
- `User` đầy đủ.
- `catch (err)` không typed → đổi `catch (err: unknown)`.
- Logout response không có type chính thức (chỉ inline `{ message: string }`).

### Dead code — ⚠️ duplicate helper
- `getRequestCookieHeader()` copy-paste 5 services khác. Tách thành `shared/lib/cookieHelper.ts`.

### Brainstorm
- Tag `user-me` cho `getMe()`, `cacheLife('hours')` vì user profile ít đổi.
- Logout revalidate tag để client lập tức thấy state mới.

---

## 2. bookingService.ts — NEEDS-TUNING (sát REWORK)

### Token forwarding — ✅ OK
- `getRequestCookieHeader()` smart wrapper, fallback `cookies()`.
- Tất cả call từ Server Component / Server Action / Route Handler.

### Cache strategy — 🔴 MISSING
- **Không** dùng `"use cache"` ở bất kỳ method nào.
- **Đề xuất tag per method**:
  - `getBookings()` → `cacheTag(bookings-list-${userId})` (PHẢI truyền userId làm arg để cache key đúng).
  - `getBookingDetail(id)` → `cacheTag(booking(id))`.
  - `createBooking` → mutation, `revalidateTag(bookings-list-${userId})`.
  - `cancelBooking`/`acceptBooking`/`rejectBooking` → `revalidateTag(booking(id))` + list tag.

### Route handlers — ✅ OK
- 5 route handlers (list/create/detail/cancel/accept/reject) cần giữ vì client component cũng dùng.
- BFF proxy pattern đúng.

### Types — ✅ OK với fix nhỏ
- 7 types đầy đủ trong `types/booking.ts`.
- `acceptBooking`/`rejectBooking` dùng inline type → tách thành `AcceptBookingResponse`, `RejectBookingResponse`.

### Dead code — 🟠 cần dọn
- `const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL` lặp **5 lần** (dòng 33, 85, 120, 162, 185, 202). Extract thành helper `isMockMode()`.
- `getBookings()` catch → return empty; `createBooking()` catch → re-throw — không nhất quán.
- Module-level import `mockBookings`, `currentMockUser` không dùng ở mọi nơi → lazy import.

### Brainstorm
- Có thể gom mutations: `PATCH /api/bookings/[id]` với body `{ action: 'cancel'|'accept'|'reject' }` thay vì 3 route riêng.
- Dùng React `cache()` quanh `serverFetch()` để dedupe trong cùng render tree.
- Move token logic vào `apiClient.ts` (1 chỗ).

---

## 3. chatService.ts — NEEDS-TUNING (cache leak risk)

### Token forwarding — ✅ OK
- Pattern chuẩn.
- ⚠️ `useChat` hook ở client gọi `fetch('/api/interaction/...')` trực tiếp — OK vì browser auto-forward HttpOnly cookie, nhưng cần document.

### Cache strategy — 🔴 MISSING + LEAK RISK
- `getChatRooms()`, `getChatMessages()` không cache.
- Nếu bật `"use cache"` mà không tag theo `userId` + `roomId` → leak cross-user nguy hiểm.
- **Đề xuất**:
  - `getChatRooms(userId)` → `cacheTag(chat-rooms-list-${userId})`.
  - `getChatMessages(roomId, userId)` → `cacheTag(chat-room-${roomId})` + tag `chat-room-${roomId}-user-${userId}` nếu BE filter messages theo user.

### Route handler — ✅ OK
- Proxy đúng. Polling 3.5s (`useChat` line 114-118) — chấp nhận cho MVP. Sau này có thể chuyển SSE.

### Types — ⚠️ thiếu
- `ChatMessage` thiếu `updatedAt`, `isEdited`, `isDeleted` — block edit/delete sau.
- `ChatRoom` thiếu `participants[]` — chỉ biết companion từ field riêng.
- `SendMessageBody` chỉ có `text` — không hỗ trợ attachment/voice/image.

### Dead code — ✅ OK
- Không TODO/FIXME. Mock duplicate `isMock` ở 3 method.

### Brainstorm
- Pagination message: `getChatMessages(roomId, { page, pageSize })` — hiện không paginate, sẽ vỡ khi room >1000 message.
- Optimistic UI ở client đã có (temp message), giữ.
- Cần endpoint `PUT /rooms/{roomId}/read-all` để clear `unreadCount`.
- Realtime: nếu chuyển SSE, route `/api/interaction/stream` cần `Cache-Control: no-cache`.

---

## 4. companionService.ts — NEEDS-TUNING

### Token forwarding — ✅ OK
- Phân biệt public (không pass `req`) vs private (`/me/*` pass `req`) đúng.
- Cơ chế `apiClient` chỉ thêm Bearer khi có `req` → an toàn.

### Cache strategy — ⚠️ mixed
- ✅ `getCompanions()`, `getFeaturedCompanion()`, `getCompanionDetail(id)` đã dùng `"use cache"` + `cacheTag()` đúng — gương mẫu cho các service khác.
- ❌ `getMyProfile()` **không cache** dù là user-specific data → mỗi request hit BE.
- ❌ Mutations (`updateMyProfile`, scenario CRUD) **không gọi `revalidateTag`** sau khi thành công → list/detail cache có thể stale.

### Route handlers — ✅ OK
- Đầy đủ cho cả browse (public) lẫn manage (`/me/*`).

### Types — ⚠️ vài thiếu
- `availability` chỉ là `availableCities: string[]` — chưa model time slot (Mon-Fri 9-17).
- `CreateScenarioBody` return không có `scenarioId`.
- Thiếu type cho `/upgrade-requests` POST body (applyCompanion).

### Dead code — ✅ OK

### Brainstorm
- **Pagination tag scope**: `getCompanions(page, pageSize, city)` hiện đều dùng `cacheTag('companions-list')` chung → invalidate 1 page = nuke all. Tag granular hơn: `companions-list-p${page}-${city || 'all'}`.
- Search query cache (nếu sau này thêm): `companions-search-${q}`.
- React `cache()` per-request cho dedupe trong render tree.

---

## 5. configService.ts — NEEDS-TUNING

### Token — ✅ OK
- Config qua Vercel Edge Config — `get()` public read, `set()` env-gated write token.

### Cache strategy — ⚠️ MISSING
- Config public, ideal cho `"use cache"` + `cacheLife('hours')` hoặc `cacheLife('days')`.
- Hiện không cache → mỗi request hit Vercel Edge Config.

### Route handler — ✅ N/A
- Truy cập qua Server Action `getAppConfig()` / `setAppConfig()` ở `app/actions/config.ts`. Pattern đúng.

### Types — ⚠️ thiếu type registry
- Generic `get<T>(key)`/`set<T>(key, value)` — caller tự định type.
- Đề xuất: tạo `type AppConfig = { greeting: string; features: FeaturesConfig; ... }` để TypeScript check key + value an toàn.

### Dead code — ✅ OK
- 17 dòng, test coverage tốt (6 cases).

### Brainstorm
- Edge Config có thể đổi runtime → không dùng build-time fetch (`generateStaticParams`).
- Pattern tối ưu: `'use cache'; cacheLife('hours')` ở service hoặc Server Action gốc.

---

## 6. notificationService.ts — REWORK (cache leak risk cao)

### Token — ⚠️
- Reading cookie đúng nhưng **không truyền userId rõ vào service method** → không thể tag cache theo user → nguy hiểm.

### Cache strategy — 🔴 LEAK RISK
- Hiện service không cache → tạm an toàn.
- Nhưng `cacheTags.ts` đã có `CACHE_TAGS.NOTIFICATIONS` **global string** dùng chung cho mọi user. Nếu ai đó thêm `"use cache"` mà dùng tag này → leak cross-user (user A đọc notification của user B).
- Mark-read route gọi `revalidateTag(CACHE_TAGS.NOTIFICATIONS)` → ngay khi cache bật, user A đọc → invalidate cho tất cả user.

### Route handler — ✅ SSE OK
- SSE stream đầy đủ (heartbeat 15s, mock 10s, abort signal).
- GET `/api/notifications` polling — OK MVP.
- ⚠️ Route handler không pass `searchParams` xuống service `getNotifications()` dù service nhận option.

### Types — ⚠️ thiếu userId
- 16 NotificationType + 3 Category đầy đủ.
- Field `userId` không có → BE phải ngầm scope theo JWT.

### Dead code — ⚠️ HTTP semantic không rõ
- Route `[notifId]/read` dùng `PATCH` nhưng comment nói `PUT` — chốt 1 cái.

### Brainstorm
- **Priority fix**:
  1. Service nhận `userId` arg, tag theo `notification-list-${userId}`, `notification-unread-${userId}`.
  2. Xoá `CACHE_TAGS.NOTIFICATIONS` global, thay bằng builder.
  3. Unread count cache tag riêng để invalidate granular.
  4. Fix PUT vs PATCH semantic.

---

## 7. walletService.ts — NEEDS-TUNING + REWORK (idempotency missing)

### Token — ✅ OK
- Cookie forwarding đúng.
- ⚠️ Hardcoded `userId: 'u-client-1'` ở topup line 70 — chưa extract từ JWT.

### Cache strategy — ⚠️ no-cache hiện OK
- Tài chính ưu tiên fresh. Không cache hiện tại OK.
- Khi bật cache, BẮT BUỘC tag `wallet-${userId}`, `cacheLife('seconds')`, revalidate sau mutation.

### Route handlers — ✅ OK
- BFF proxy đúng. 3 route handler logic tương tự → có thể refactor helper.

### Types — ⚠️ thiếu currency
- Wallet/WalletTransaction không có field `currency: 'KNO'` → mất tính mở rộng multi-currency.
- TopupResponse không có `vnp_TxnRef` để tracking.
- Exchange rate (1 Kano → ? VND) hardcoded ở mock, không trong type.

### Dead code — ⚠️
- Hardcoded `userId` (line 70).
- `getRequestCookieHeader()` fallback quá narrow (check `name.toLowerCase() === 'cookie'`).

### Inconsistency
- `getTransactions()` catch → return `[]` (line 96); `getWallet()` throw — không nhất quán.

### Brainstorm — 🔴 cần làm trước production
- **Idempotency key cho topup** (PRIORITY): bookings route đã có pattern `x-idempotency-key`; topup chưa. Tài chính KHÔNG có idempotency = double-charge risk.
- Cache invalidation sau topup: `revalidateTag(wallet-${userId})`.
- Polling strategy theo spec `04-wallet-topup.md` (SHORT POLLING tối đa 5 lần, 2s/lần) sau redirect VNPay — **chưa thấy code**.
- Optimistic balance update khi topup pending.

---

## 8. Brainstorm — Có nên gom thành 1 endpoint BFF aggregate?

Câu hỏi user: "ví dụ gọi 1 cái về hết luôn thì sao".

### Phương án A — Giữ nhiều endpoint (hiện tại)
| Ưu | Nhược |
|---|---|
| Cache granular theo entity tag | N+1 round-trip nếu page cần nhiều domain |
| Reuse cho nhiều page | Mỗi mutation phải biết invalidate những tag nào |
| Test/mock dễ | |

### Phương án B — BFF aggregate endpoint (ví dụ `/api/me/dashboard` trả wallet + notifications + bookings + chat unread)
| Ưu | Nhược |
|---|---|
| 1 request, 1 round-trip | Cache key phức tạp (phải tag mọi entity con trong response) |
| Latency tốt cho mobile / first-paint | Khó revalidate granular — mỗi entity nhỏ thay đổi → invalidate cả response |
| | Type kép (vừa có type entity riêng, vừa có aggregate type) |
| | Khó tái sử dụng cho page chỉ cần 1 domain |

### Khuyến nghị
- **Server Component App Router đã đủ "aggregate"**: 1 page có thể `await Promise.all([s1.x(), s2.y(), s3.z()])` parallel — không cần aggregate endpoint.
- BFF aggregate chỉ có giá trị nếu:
  - Mobile/client component cần 1 request.
  - Latency Server-to-BE thật sự cao.
  - Có view phức tạp dùng đi dùng lại (vd Dashboard).
- **Verdict cho dự án này**: KHÔNG gom. Giữ nhiều endpoint + `Promise.all` ở Server Component.

### Server Component vs Route Handler — khác gì?
- **Server Component** gọi service: chạy server-side, fetch BE thẳng, dữ liệu inline vào HTML. Không cần route handler.
- **Route Handler**: cần khi browser (`'use client'`) gọi fetch, hoặc third-party webhook, hoặc mobile.
- **Pattern hiện tại**: Service được dùng cả 2 chỗ — OK, nhưng đôi khi route handler chỉ là 1 pass-through (`return await service.x({ req })`). Có thể bỏ những route handler chỉ Server Component dùng.

---

## 9. Priority action list (theo thứ tự thực hiện)

### P0 — chặn bug an toàn dữ liệu
1. **Tạo `shared/lib/cookieHelper.ts`** — extract `getRequestCookieHeader()` về 1 chỗ. Update 5 service import.
2. **Mở rộng `shared/lib/cacheTags.ts`** — thêm builder cho mọi entity user-specific:
   ```ts
   userMe: (userId: string) => `user-me-${userId}`,
   wallet: (userId: string) => `wallet-${userId}`,
   bookingsList: (userId: string) => `bookings-list-${userId}`,
   booking: (id: string) => `booking-${id}`,
   chatRoomsList: (userId: string) => `chat-rooms-list-${userId}`,
   chatRoom: (roomId: string) => `chat-room-${roomId}`,
   notificationsList: (userId: string) => `notifications-list-${userId}`,
   notificationsUnread: (userId: string) => `notifications-unread-${userId}`,
   ```
   Xoá `CACHE_TAGS.NOTIFICATIONS` global (leak risk).
3. **`notificationService` rework** — service nhận `userId`, tag theo userId. Tránh leak.
4. **`walletService` thêm idempotency key cho topup** — pattern theo `bookings`. Cache invalidation `revalidateTag(wallet-${userId})` sau mutation.

### P1 — performance + AGENTS.md compliance
5. **`authService.getMe()`** — thêm `"use cache"` + `cacheTag(userMe(userId))` + `cacheLife('hours')`. Logout `revalidateTag`.
6. **`bookingService`** — thêm cache đúng pattern. Extract `isMockMode()` helper. Consistent error handling.
7. **`companionService.getMyProfile()`** — thêm cache + tag per-user. Mutations gọi `revalidateTag`.
8. **`configService`** — `"use cache"` + `cacheLife('hours')`. Tạo `AppConfig` type registry.
9. **`chatService`** — pagination cho messages; cache với tag per room+user; type `participants[]`, `updatedAt`, `isEdited`.

### P2 — chất lượng code
10. Extract `isMockMode()` helper dùng chung.
11. Standardize error handling: tất cả service `throw ApiError`, không service nào return empty array khi lỗi.
12. Inline types thành named types (`AcceptBookingResponse`, `RejectBookingResponse`, `LogoutResponse`, `TopupTrackingMeta`).
13. Catch dùng `unknown` thay vì implicit `any`.
14. Document phân biệt public vs private service method ở docstring.
15. Bỏ route handler nào chỉ Server Component dùng (xác định case by case sau khi P0/P1 xong).

### P3 — feature gap
16. `chatService` — pagination + read-all endpoint + SSE migration plan.
17. `walletService` — polling strategy theo VNPay spec + optimistic UI.
18. `companionService` — availability time slot type.

---

## 10. Phụ lục — Cross-reference với AGENTS.md (2026-06-22)

> "User-specific data VẪN dùng `"use cache"` được — nhưng **BẮT BUỘC** kèm `cacheTag()` chứa identifier riêng của user/entity để mỗi user có cache slot riêng và có thể invalidate chính xác bằng `revalidateTag()` sau mutation. Không tag = cache global = rò rỉ dữ liệu."

| Service | Tuân thủ? | Note |
|---|---|---|
| authService | ❌ không cache (nhưng có thể thêm theo rule) | Cần `userMe(userId)` tag |
| bookingService | ❌ không cache | Cần `bookings-list-${userId}` + `booking(id)` |
| chatService | ❌ không cache | Cần `chat-room-${roomId}` + scope user |
| companionService (public) | ✅ tag chuẩn | `companions-list`, `companion(id)` — public OK |
| companionService (`/me`) | ❌ getMyProfile không cache | Cần per-user tag |
| configService | ❌ không cache | Public, có thể dùng `cacheLife('hours')` |
| notificationService | 🔴 tag global, leak risk khi bật cache | Phải tag per-user |
| walletService | ❌ không cache | Khi bật phải tag per-user, ngắn life |

---

> **Kết:** không service nào "OK hoàn toàn". Mức độ rework dao động từ tuning (auth/config) đến rework (notification/wallet). Cross-cutting issue lớn nhất là **thiếu cache strategy có tag** theo AGENTS.md mới. Bắt đầu từ P0 (cookie helper + cacheTags extend + notification rework + wallet idempotency) để vá an toàn dữ liệu trước, rồi mới đến performance.
