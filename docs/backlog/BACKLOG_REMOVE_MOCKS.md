# Backlog: Loại bỏ hoàn toàn Mock & MSW, chuyển sang API thật

> Phạm vi: FE + BFF (`my-app/`). BE microservice do team khác lo — backlog này chỉ xử lý phía FE/BFF.
> Mục tiêu: sau khi xong, repo **không còn dấu vết** mock — không thư mục `mocks/`, không `NEXT_PUBLIC_MOCK_ENABLED`, không `isMock`, không `currentMockUser`, không MSW dependency, không SW import `mockServiceWorker.js`, không comment kiểu “mock mode / dev offline”.

---

## 0. Nguyên tắc thực hiện

1. **Một PR cho một phase.** Mỗi phase phải tự build, tự `pnpm typecheck`, `pnpm lint`, `pnpm test:run` xanh.
2. **Không để code chết.** Khi bỏ nhánh `if (isMock)`, xoá luôn import, biến, helper chỉ phục vụ nhánh đó. Không để `// removed mock branch`, không để `_unusedVar`.
3. **Không để comment ám chỉ mock.** Mọi comment chứa từ “mock”, “MSW”, “fixtures”, “dev offline”, “demo mode”, “fake”, “stub” phải bị xoá hoặc viết lại nếu vẫn còn ý nghĩa nghiệp vụ.
4. **Không thêm flag thay thế.** Không tạo `IS_DEMO`, `USE_FIXTURES`… Đường vào API thật là duy nhất; lỗi BE = lỗi thật, hiển thị qua UI error state có sẵn.
5. **Verify bằng grep, không bằng cảm tính.** Acceptance ở §9 phải trả về 0 match.

---

## 1. Tiền đề (Pre-requisite, do phía ngoài cấp trước khi mở Phase 1)

- [ ] BE microservice expose qua `API_URL` (HTTPS, có CORS với origin FE).
- [ ] Auth flow xác nhận: BFF set `access_token` HttpOnly cookie (đã có trong `apiClient.ts:23`), BE nhận `Authorization: Bearer <jwt>`.
- [ ] Có endpoint thật cho **mọi** route trong `src/app/api/**/route.ts` (xem §3.2). Nếu thiếu endpoint nào → khoá Phase tương ứng, không workaround bằng fixture.
- [ ] SSE endpoint thật ở BE cho `/notifications/stream`.
- [ ] VAPID keys production cho web-push (xoá nhánh auto-gen ở dev).
- [ ] Có môi trường staging chạy được FE + BE thật để smoke test end-to-end mỗi phase.

Nếu một trong các mục trên còn `?`, dừng — đừng bắt đầu Phase 1.

---

## 2. Tổng quan kiến trúc hiện tại liên quan tới mock

```
Browser (page.tsx, components)
  │
  │  fetch('/api/...')                    ← BFF route
  ▼
Next Route Handler (src/app/api/**/route.ts)
  │
  │  serverFetch() → API_URL (BE thật)    ← LUỒNG THẬT
  │  HOẶC
  │  if (isMock) trả fixtures/stream giả  ← LUỒNG MOCK (cần XOÁ)
  ▼
BE microservice

Song song:
- Service Worker /public/sw.js  importScripts /public/mockServiceWorker.js
- MockProvider boot MSW ở client khi NEXT_PUBLIC_MOCK_ENABLED=true
- 7 service files có double-path: if (isMock) return fixture; else serverFetch()
```

Sau khi xong backlog: chỉ còn nhánh “LUỒNG THẬT”.

---

## 3. Inventory bề mặt mock (chốt phạm vi sửa)

### 3.1 Thư mục cần XOÁ hoàn toàn

| Path | Ghi chú |
|---|---|
| `my-app/src/mocks/` | Toàn bộ: `browser.ts`, `handlers/*`, `fixtures/*`, `components/MockProvider.tsx`, `handlers/companions.test.tsx` |
| `my-app/public/mockServiceWorker.js` | MSW worker stub |
| `my-app/src/app/api/notifications/stream/createMockNotificationStream.ts` | Stream giả SSE |

### 3.2 File có nhánh `isMock` / import fixtures (sửa, không xoá file)

| File | Vị trí cần dọn |
|---|---|
| `src/shared/services/authService.ts` | L2 import `currentMockUser`, L30-34, L50-53 nhánh isMock |
| `src/shared/services/bookingService.ts` | L2 import, L33-83, L85-118, L120-160, L162-183, L185-201, L203-… nhánh isMock |
| `src/shared/services/chatService.ts` | L2 import, L30-68 (kể cả `await import('@/mocks/fixtures/data')` ở L33), L70-96, L98-… |
| `src/shared/services/companionService.ts` | L2 import, các block isMock tại L15, L69, L111, L145, L151, L169, L175, L181, L187, L200 |
| `src/shared/services/notificationService.ts` | L2 import, L37, L83, L103 |
| `src/shared/services/walletService.ts` | L2 import, L30, L55, L84 |
| `src/shared/services/adminUserService.ts` | L9, L16 import, helper `isMock()` L26-27, L34, L76, L124, L134 |
| `src/shared/services/adminCompanionService.ts` | L6 docstring, L11, L16 import, `isMock()` L34-35, L57, L105, L169, L187 |
| `src/shared/services/adminDisputeService.ts` | L6, L12 import, `isMock()` L23-24, L31, L78, L98, L104 |
| `src/shared/services/adminSettingsService.ts` | L8, L13 import, `isMock()` L20-21, L25, L36-37 |
| `src/shared/services/adminTransactionService.ts` | L8 import, `isMock()` L16-17, L24 |
| `src/app/api/notifications/stream/route.ts` | L2 import mock stream, L17-22 nhánh isMock |
| `src/app/actions/pwa.ts` | L22-39 nhánh auto-gen VAPID khi `isMock` |
| `src/app/RootClientLayout.tsx` | L4 import + L14, L30 sử dụng `<MockProvider>` |
| `src/shared/components/molecules/useBookingForm.ts` | L10 `IS_MOCK`, mọi nhánh sử dụng |
| `src/shared/components/molecules/BookingForm.tsx` | L61 comment “Mock: onSubmit…” |
| `src/app/(debug)/test/page.tsx` | Trang debug type-mock, cần xác nhận có còn dùng — nếu chỉ phục vụ mock thì xoá luôn |
| `src/app/(marketing)/explore/test/EXPLORE_TEST.md` | Đoạn nhắc tới MSW/mock |
| `src/test/TESTS.md` | Đoạn nhắc MSW |
| `src/shared/contexts/AuthContext.test.tsx` | Nếu test phụ thuộc fixture từ `@/mocks` → port sang dữ liệu test cục bộ trong `__tests__/fixtures` riêng (xem Phase 5) |

### 3.3 Config / metadata

| File | Chi tiết |
|---|---|
| `my-app/package.json` | Bỏ `msw` (devDependencies L38), bỏ block `msw.workerDirectory` L43-47 |
| `my-app/.env.example` | Bỏ dòng `NEXT_PUBLIC_MOCK_ENABLED=true`, mở `API_URL=` (bắt buộc, không comment) |
| `my-app/.env.local` | Phải set `API_URL` thật, xoá `NEXT_PUBLIC_MOCK_ENABLED` |
| `my-app/eslint.config.mjs` | L15 bỏ ignore `public/mockServiceWorker.js` |
| `my-app/README.md` | L32-38 viết lại phần Deploy: bỏ hướng dẫn MSW, thay bằng yêu cầu set `API_URL` |
| `my-app/next.config.ts` | L38-56: phần CSP `/sw.js` được nới rộng cho MSW passthrough — siết lại sau khi bỏ MSW (xem Phase 6) |
| `my-app/public/sw.js` | L1-8 xoá `importScripts('/mockServiceWorker.js')` + log; comment L1 cũng phải viết lại |
| `pnpm-lock.yaml` / `package-lock.json` | Regen sau khi gỡ `msw` |

---

## 4. Lộ trình theo phase

| Phase | Mục tiêu | Điều kiện ra |
|---|---|---|
| 1 | Bật `API_URL` ở mọi môi trường, smoke test BFF→BE | `/api/auth/me` thật trả 200 trên staging |
| 2 | Xoá nhánh mock ở **non-admin services** (auth, booking, chat, companion, notification, wallet) | E2E luồng client + companion chạy thật |
| 3 | Xoá nhánh mock ở **admin services** (5 file) | Admin pages chạy thật |
| 4 | Xoá SSE mock + MockProvider + flag `NEXT_PUBLIC_MOCK_ENABLED` | Không còn import từ `@/mocks` |
| 5 | Refactor test: tách test fixture riêng, không phụ thuộc `src/mocks` | `pnpm test:run` xanh |
| 6 | Xoá `src/mocks/`, `public/mockServiceWorker.js`, gỡ `msw` package, dọn SW + CSP + README + eslint ignore | Grep acceptance §9 = 0 match |
| 7 | Hardening: VAPID prod-only, log mode, error UX | Production ready |

---

## 5. Chi tiết từng Phase

### Phase 1 — Bật API thật, không động code mock

**Mục tiêu:** chứng minh BFF + BE thật chạy được trước khi xoá fallback.

Tasks:
- [ ] 1.1 Tạo `my-app/.env.local` với `API_URL=<staging-be>` và **bỏ** `NEXT_PUBLIC_MOCK_ENABLED`.
- [ ] 1.2 Chạy `pnpm dev`, gọi `/api/auth/me`, `/api/companions`, `/api/bookings` → verify BFF log `[BFF] GET ... → 200`.
- [ ] 1.3 Cập nhật `.env.example`: `API_URL=` bắt buộc, xoá dòng `NEXT_PUBLIC_MOCK_ENABLED=true`.
- [ ] 1.4 Document ở `README.md` (tạm thời): khi dev không có BE, vẫn còn nhánh mock; sẽ xoá ở Phase 6.

DoD: smoke test xanh trên staging với BE thật. Không sửa source code FE trong phase này.

---

### Phase 2 — Xoá nhánh mock ở 6 service non-admin

Cho **từng** file trong danh sách, áp dụng cùng pattern:

**Files:** `authService.ts`, `bookingService.ts`, `chatService.ts`, `companionService.ts`, `notificationService.ts`, `walletService.ts`.

Steps cho mỗi file:
1. Xoá dòng `import ... from '@/mocks/fixtures/data'` ở đầu file.
2. Trong mỗi method:
   - Xoá toàn bộ block `const isMock = ...; if (isMock) { ... }`.
   - Xoá biến `currentMockUser` còn lại — đã có session từ cookie qua `serverFetch`.
   - Nếu nhánh `isMock` trả về object khác shape với BE → align lại type. Nếu BE chưa khớp → block phase, tạo ticket BE.
3. Xoá `await import('@/mocks/fixtures/data')` (chỉ ở `chatService.ts:33`).
4. Xoá mọi comment chứa “mock mode”, “fixture”, “dev offline”, “demo”.
5. Đảm bảo method không còn dùng helper nào chỉ phục vụ mock → xoá helper nếu mồ côi.
6. Đối với `useBookingForm.ts:10` và `BookingForm.tsx:61`: xoá `IS_MOCK` const + branch + comment.

Verify mỗi file:
```bash
# trong my-app
pnpm typecheck
pnpm lint
grep -nE "isMock|MOCK_ENABLED|currentMockUser|@/mocks" src/shared/services/<file>
# → phải rỗng
```

E2E smoke (manual) sau cả phase: đăng nhập → list companion → tạo booking → cancel → wallet topup → chat → notification dropdown.

---

### Phase 3 — Xoá nhánh mock ở 5 admin service

**Files:** `adminUserService.ts`, `adminCompanionService.ts`, `adminDisputeService.ts`, `adminSettingsService.ts`, `adminTransactionService.ts`.

Đặc thù admin: hiện đang **đọc/ghi trực tiếp fixtures** (xem docstring `adminCompanionService.ts:6`). Bỏ nhánh này sẽ làm các trang admin **phụ thuộc tuyệt đối** vào BE admin API. Trước khi mở phase:

- [ ] Xác nhận BE có đủ admin endpoints: list users, ban/unban, list companions, approve/reject KYC, dispute list/detail/resolve, settings flags, transactions list.
- [ ] Nếu thiếu bất kỳ endpoint nào → tạo ticket BE, không tự ý giữ fixture “tạm thời”.

Steps mỗi file: giống Phase 2, cộng thêm:
- Xoá helper local `const isMock = () => ...` (mỗi file 1 dòng L16-L35 tuỳ file).
- Xoá `const actor = currentMockUser!` — chuyển sang đọc từ session/JWT (đã có cơ chế qua `serverFetch` cookie forwarding); nếu method admin cần actor display name, BE phải trả về trong response, **không** lấy từ FE.
- Xoá import `from '@/mocks/fixtures/admin'` và `from '@/mocks/fixtures/data'`.

Verify như Phase 2 cho từng file, cộng test pages: `/admin`, `/admin/users`, `/admin/users/[id]`, `/admin/companions`, `/admin/companions/[id]`, `/admin/disputes`, `/admin/disputes/[id]`, `/admin/transactions`, `/admin/settings`.

---

### Phase 4 — Xoá SSE mock, MockProvider, flag `NEXT_PUBLIC_MOCK_ENABLED`

Tasks:
- [ ] 4.1 `src/app/api/notifications/stream/route.ts`:
  - Xoá L2 `import { createMockNotificationStream }`.
  - Xoá L17-22 nhánh `if (isMock)`.
  - Body còn lại: chỉ proxy. Nếu `apiUrl` falsy → trả 500 với message rõ ràng (không fallback).
- [ ] 4.2 Xoá `src/app/api/notifications/stream/createMockNotificationStream.ts`.
- [ ] 4.3 `src/app/RootClientLayout.tsx`: xoá L4 import + L14/L30 `<MockProvider>`. Đảm bảo `<AuthProvider>` thành provider ngoài cùng.
- [ ] 4.4 `src/app/actions/pwa.ts` L20-39: xoá toàn bộ block auto-gen VAPID. Nếu thiếu key → throw rõ ràng, không generate runtime. Xoá biến `isMock`, `keys` chuyển thành `const`.
- [ ] 4.5 Grep toàn repo `NEXT_PUBLIC_MOCK_ENABLED` → 0 match (sau khi 4.1-4.4 xong, chỉ còn ở `MockProvider.tsx`, `.env.example`, `README.md`; xoá tất cả).
- [ ] 4.6 Xoá file `src/mocks/components/MockProvider.tsx`.

DoD: app chạy bình thường không cần env `NEXT_PUBLIC_MOCK_ENABLED`. Tắt BE thật → app phải lỗi rõ (không có “MSW khởi động”).

---

### Phase 5 — Refactor tests độc lập với `src/mocks`

Tests hiện đang dùng fixtures và MSW handlers như “source of truth”:
- `src/shared/contexts/AuthContext.test.tsx`
- `src/mocks/handlers/companions.test.tsx` (test này đang sống trong `src/mocks/` — bất thường)
- Các test khác dùng `vi.mock` đè service đã đủ; check thêm bằng grep ở §9.

Tasks:
- [ ] 5.1 Tạo `src/test/fixtures/` chứa **chỉ** dữ liệu test thuần (không có business logic, không có `currentMockUser` stateful).
- [ ] 5.2 Di chuyển các fixtures còn cần thiết (User, Companion, Booking shape) từ `src/mocks/fixtures/data.ts` sang `src/test/fixtures/` — chỉ data tĩnh, bỏ logic `setMockRole`, `currentMockUser` mutable.
- [ ] 5.3 Sửa `AuthContext.test.tsx` (và bất kỳ test nào còn import `@/mocks`) trỏ về `@/test/fixtures`.
- [ ] 5.4 Quyết định `companions.test.tsx`:
  - Nếu là unit test cho service: chuyển sang `src/shared/services/__tests__/companions.test.tsx`, mock `serverFetch`/`fetch` bằng `vi.mock`, không qua MSW.
  - Nếu redundant: xoá.
- [ ] 5.5 Loại bỏ `msw` khỏi test runtime (không setup MSW server trong `vitest.setup.ts` nếu đang có).
- [ ] 5.6 `pnpm test:run` xanh, coverage business logic ≥ mức cũ.

---

### Phase 6 — Xoá vật lý mock + dọn config + lockfile

Sau khi 5 phase trước xanh, không còn import từ `@/mocks` ở source thật:

- [ ] 6.1 `rm -r my-app/src/mocks`
- [ ] 6.2 `rm my-app/public/mockServiceWorker.js`
- [ ] 6.3 `my-app/public/sw.js`:
  - Xoá L1-8 (`try { importScripts(...) } catch ...` + comment đầu file nhắc MSW).
  - Đặt lại comment đầu file: chỉ mô tả PWA offline + push, không nhắc mock.
  - Cân nhắc giữ logic `pwaEnabled` postMessage hay không (tuỳ Phase 7).
- [ ] 6.4 `my-app/next.config.ts`:
  - Comment L41 (`MSW passthrough`) viết lại — chỉ giải thích PWA cache.
  - CSP `/sw.js` (L52-54) siết lại: `connect-src 'self' <CDN image domains>` (không cần `data: blob:` cho passthrough nữa). Test PWA push vẫn chạy.
- [ ] 6.5 `my-app/eslint.config.mjs`: xoá L15 `"public/mockServiceWorker.js"`.
- [ ] 6.6 `my-app/package.json`:
  - Xoá `msw` ở `devDependencies`.
  - Xoá toàn bộ block `"msw": { "workerDirectory": ["public"] }`.
- [ ] 6.7 Regenerate lockfile: `pnpm install` (chỉ commit `pnpm-lock.yaml`). Nếu repo vẫn còn `package-lock.json` mồ côi → xoá, ghi vào `.gitignore` (hoặc chuẩn hoá về 1 package manager).
- [ ] 6.8 `my-app/README.md` viết lại đoạn L32-38: hướng dẫn set `API_URL`, bỏ MSW/Vercel demo note. Không nhắc “mock”.
- [ ] 6.9 `my-app/.env.example`: chỉ còn `NEXT_PUBLIC_GOOGLE_CLIENT_ID=`, `NEXT_PUBLIC_PWA_ENABLED=false`, `API_URL=`, `AUTH_COOKIE_NAME=access_token`, `VAPID_PUBLIC_KEY=`, `VAPID_PRIVATE_KEY=`.
- [ ] 6.10 Xoá `src/app/(debug)/test/page.tsx` và `src/app/(debug)/pwa-test/page.tsx` nếu chỉ phục vụ kiểm thử mock; nếu vẫn cần PWA test thì giữ `pwa-test` nhưng xoá mọi đề cập “mock” trong nội dung.
- [ ] 6.11 `src/test/TESTS.md`, `src/app/(marketing)/explore/test/EXPLORE_TEST.md`: viết lại bỏ phần MSW.
- [ ] 6.12 `src/shared/lib/apiClient.ts`:
  - L14-17 docstring “Toggle mock/real” → xoá. Thay bằng mô tả tĩnh BFF flow.
  - L67-72 message lỗi “Dev offline: không set API_URL để MSW tự intercept” → đổi sang “`API_URL` is required”.

---

### Phase 7 — Hardening sau khi mock đã chết

- [ ] 7.1 `src/app/actions/pwa.ts`: VAPID keys bắt buộc ở env, throw fail-fast khi thiếu. Xoá log `console.log('VAPID Keys ...')` (rò keys).
- [ ] 7.2 `apiClient.ts`: timeout, retry, circuit breaker — xem xét lại tham số `TIMEOUT_MS=10_000` vì giờ không còn fallback.
- [ ] 7.3 UX error: mọi page server-fetch (`explore`, `bookings`, admin/*) phải có `error.tsx` boundary trả lỗi rõ, không hiển thị skeleton vô tận khi BE chết.
- [ ] 7.4 Service Worker `/sw.js`: cân nhắc đăng ký tường minh `navigator.serviceWorker.register('/sw.js')` (hiện chưa có chỗ register — xem note PWA cũ).
- [ ] 7.5 Bổ sung health check: route `/api/health` ping BE, dùng cho Vercel monitoring.

---

## 6. Chính sách comment & code dấu vết

Trong mọi file đụng vào, tuân thủ:

- **Cấm** chừa comment kiểu `// removed mock branch`, `// TODO: re-add mock for dev`, `// previously: if (isMock)`.
- **Cấm** giữ tham số/biến đã thành unused chỉ để “khỏi gây lint cảnh báo” — xoá thật.
- **Cấm** rename `isMock` → `_isMock`. Xoá.
- Mọi comment tiếng Việt còn lại liên quan tới mock/MSW/fixture/demo phải bị xoá. Comment nghiệp vụ thật sự (vd: cookie auth flow) giữ lại nhưng phải đảm bảo không còn nhắc “mock”.
- Docstring đầu file (vd: `adminCompanionService.ts:1-7` mô tả “Mock mode vs Real mode”) phải được viết lại — chỉ mô tả Real mode.

---

## 7. Quy tắc git / PR

- Mỗi phase = 1 PR, tiêu đề: `chore(mocks): phase-N — <mô tả ngắn>`.
- PR phải kèm output grep acceptance (§9) trong description, chứng minh 0 match cho các pattern thuộc phase đó.
- Không merge phase N+1 trước khi phase N đã lên staging tối thiểu 24h và không có regression.
- Không push trực tiếp protected branch.

---

## 8. Risk / Mitigation

| Risk | Tác động | Mitigation |
|---|---|---|
| BE thiếu endpoint khi vào Phase 2/3 | Trang trắng, 500 | Pre-flight checklist §1; nếu thiếu, dừng phase, tạo ticket BE, **không** giữ fixture |
| Shape response BE ≠ shape fixture cũ | UI vỡ silently | TypeScript strict + viết e2e smoke per service trước khi xoá fallback |
| Vercel demo cũ phụ thuộc MSW | Demo public mất | Trước Phase 6, deploy staging mới có BE thật; thông báo team marketing; xoá hướng dẫn cũ trong README |
| Test runtime phụ thuộc MSW handler | `pnpm test` đỏ sau Phase 6 | Phase 5 phải hoàn tất trước Phase 6 |
| VAPID keys thiếu khi tắt auto-gen | Push notification chết | Yêu cầu DevOps cấp key trước Phase 4 |

---

## 9. Acceptance — Grep checklist (chạy ở `my-app/`)

Sau khi Phase 6 merge, **tất cả** lệnh sau phải trả về 0 dòng:

```bash
# 1. Không còn flag mock
grep -rnE "NEXT_PUBLIC_MOCK_ENABLED|IS_MOCK\b|isMock\(" src/ public/ next.config.ts .env.example

# 2. Không còn import từ thư mục mocks
grep -rnE "from\s+['\"]@/mocks|from\s+['\"]\.{1,2}/.*mocks/" src/

# 3. Không còn symbol fixture
grep -rnE "currentMockUser|mockBookings|mockNotifications|mockWallet|mockChatRooms|mockMessages|adminTransactions|adminFeatureFlags" src/

# 4. Không còn MSW
grep -rnE "msw|MSW|mockServiceWorker|setupWorker" src/ public/ package.json next.config.ts

# 5. Không còn file/dir mock
test ! -d src/mocks
test ! -f public/mockServiceWorker.js
test ! -f src/app/api/notifications/stream/createMockNotificationStream.ts

# 6. Không còn dependency msw
node -e "process.exit(require('./package.json').devDependencies?.msw ? 1 : 0)"

# 7. Comment dấu vết
grep -rniE "mock mode|dev offline|demo mode|removed mock|fixture|fake data|stub data" src/ public/ README.md
```

Và:
```bash
pnpm install            # lockfile sạch
pnpm typecheck          # 0 lỗi
pnpm lint               # 0 lỗi
pnpm test:run           # xanh
pnpm build              # xanh, không warn về `@/mocks`
```

E2E manual smoke (staging, BE thật):
- [ ] Login (Google) → `/api/auth/me` trả user thật
- [ ] `/explore` list companion, filter by city, paginate
- [ ] Tạo booking → companion accept → chat → cancel
- [ ] Topup wallet, view transaction
- [ ] Notification dropdown nhận event qua SSE
- [ ] Admin: list users, ban, list companions approve, list disputes resolve
- [ ] PWA push: subscribe → sendNotification → nhận noti
- [ ] Tắt BE → trang hiển thị error boundary đàng hoàng, không infinite skeleton, không message MSW

---

## 10. Rollback

Vì backlog xoá vật lý ở Phase 6, rollback = revert PR phase đó. **Không** giữ branch “legacy-mock” song song trong main repo. Nếu cần demo offline trong tương lai: cân nhắc dùng tool độc lập (ví dụ Hoppscotch/Prism mock server) thay vì khôi phục MSW vào codebase.

---

## 11. Out of scope

- Thay BFF khỏi Next.js → tách thành Hono/Fastify service (liên quan kế hoạch Tauri mobile, có backlog riêng).
- Refactor naming services (`adminXxxService`) — chỉ làm khi đụng tới.
- Performance tuning `cacheComponents` — sau khi BE thật vào production sẽ đo lại.
