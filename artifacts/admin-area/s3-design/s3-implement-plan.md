# S3 — Implementation Plan v2: Admin Area (Next.js–first)

> Generated: 2026-06-22
> Stack: Next.js 16.2 (App Router) + React 19.2 + Tailwind + TypeScript
> Scope: **FE + BFF only** — BE là microservice thật, FE không nhúng business logic
> Source: S1 requirement-pack, S2 functional-spec, `docs/api-draft.md`, `docs/important/api-contract.md`
> Status: DRAFT v2 — viết lại để khai thác đúng sức mạnh App Router

---

## 1. Tóm Tắt

Xây 4 page admin trong route group `(admin)` của app Next.js đã có sẵn. Kiến trúc lấy **Server Components làm mặc định**, chỉ tách Client Island ở chỗ thật sự cần tương tác. Service fetch dùng `"use cache"` + `cacheTag()` per-entity (theo AGENTS.md cập nhật 2026-06-22), Mutation đi qua **Server Actions** + `revalidateTag()`, **không** dùng TanStack Query, **không** dùng route handler BFF.

**Lý do triết lý:**
- Codebase hiện tại (`bookings/page.tsx`) đã theo pattern Server Component → Suspense → Client Island. Plan này align thay vì áp pattern mới.
- 4 page là CRUD đơn giản, không realtime, không offline, không optimistic chain phức tạp → TanStack Query là tax không có giá trị.
- BFF route handler chỉ cần khi browser fetch trực tiếp (mobile, third-party). Server Components đã chạy server-side, gọi BE thẳng là tối ưu nhất — bớt 1 hop, bớt 1 lớp adapter.

---

## 2. Scope (giữ nguyên từ v1)

| Path | US | API |
|---|---|---|
| `/admin/companions` | US-002 | `GET /admin/upgrade-requests` |
| `/admin/companions/[id]` | US-003, US-004 | `GET /admin/accounts/{id}` · `PUT /admin/upgrade-requests/{id}/{approve\|reject}` · `PUT /admin/accounts/{id}/{lock\|unlock}` |
| `/admin/clients/[id]` | US-005, US-006 | `GET /admin/accounts/{id}` · lock/unlock |
| `/admin/disputes` | US-010 | `GET /disputes?status=&page=&pageSize=` |
| `/admin/disputes/[id]` | US-011 | `GET /disputes/{id}` · `POST /disputes/{id}/resolve` |

---

## 3. Decisions Kiến Trúc (rõ ràng, có lý do)

### D1. Server Component–first, Client Island khi cần

| Thành phần | Loại | Lý do |
|---|---|---|
| `app/(admin)/**/page.tsx` | **Server** | Fetch BE, render markup, không cần JS gửi xuống client |
| `app/(admin)/layout.tsx` | **Server** | Auth check (re-verify), render shell |
| Sidebar nav | **Server** (link tĩnh) | Không có state động |
| Topbar user menu | **Client** | Dropdown open/close state |
| Table body của list page | **Server** | Render rows inline trong page server component (không generic DataTable) |
| Filter/sort UI ở list page | **Client** | Component nhỏ chuyên dụng per route, dùng `useRouter` update searchParams |
| Pagination | **Client** | Navigate với `useRouter` |
| Modal xác nhận có reason (per route) | **Client** | Form state + `useActionState` (xem §7 rule-of-three) |
| Search input (debounced) | **Client** | `useDeferredValue` + `router.replace` |

Quy ước đặt tên: client component có suffix `Client` hoặc đặt trong file riêng có `'use client'` đầu file.

### D2. KHÔNG dùng TanStack Query

**Tradeoff đã xét:**

| Vấn đề | Solution không TanStack | Đủ chưa? |
|---|---|---|
| Initial load | Server Component fetch trực tiếp | ✅ Nhanh hơn, không spinner client |
| Sau mutation, refresh list | Server Action + `revalidateTag(adminTags.account(id))` | ✅ Next tự refetch RSC |
| Loading state | `loading.tsx` + `<Suspense>` | ✅ Streaming built-in |
| Error state | `error.tsx` per segment | ✅ Boundary built-in |
| Optimistic UI | KHÔNG cần (action sub-second, pending spinner đủ) | ✅ Skip |
| Pagination/filter URL | searchParams là SOT | ✅ Shareable, back-button hoạt động |
| Polling | Không cần (đã DROP dashboard) | ✅ |
| Stale-while-revalidate | `fetch(url, { next: { revalidate: 30 } })` nếu sau này cần | ✅ |

**Kết luận:** Thêm TanStack = thêm ~12KB gz + provider boilerplate + 2 layer cache (server fetch cache + RQ cache) đồng bộ tay. Không có upside cho 4 page admin.

### D3. KHÔNG dùng BFF route handler riêng

Server Component và Server Action gọi BE trực tiếp qua module service (`adminAccountService.getById(id)` ở server). Token đọc từ `cookies()` của `next/headers`. Error normalize làm **trong service** thay vì 1 lớp route handler trung gian.

**Khi nào cần route handler?** Nếu sau này có:
- Webhook từ BE gọi vào FE (signed).
- Client component cần long-poll/SSE.
- Mobile app gọi cùng API.

Cả 3 không có ở scope này → bỏ.

### D4. Mutation qua Server Action + `revalidateTag()`

Theo `my-app/AGENTS.md` (cập nhật 2026-06-22): user-specific data VẪN dùng `"use cache"` được — **bắt buộc** kèm `cacheTag()` chứa identifier riêng để mỗi entity có slot cache riêng và invalidate chính xác bằng `revalidateTag()`.

**Tag registry** mở rộng `my-app/src/shared/lib/cacheTags.ts` (đã có sẵn pattern):

```ts
// shared/lib/cacheTags.ts (extend)
export const CACHE_TAGS = {
  // ... existing
  ADMIN_UPGRADE_REQUESTS_LIST: 'admin-upgrade-requests-list',
  ADMIN_DISPUTES_LIST_ALL: 'admin-disputes-list-all',
  adminAccount: (id: string) => `admin-account-${id}`,
  adminDispute: (id: string) => `admin-dispute-${id}`,
  adminDisputesList: (scope: string) => `admin-disputes-list-${scope}`,
} as const;
```

**Service fetch — cache theo entity:**

```ts
// services/admin/adminAccountService.ts
import 'server-only';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { CACHE_TAGS } from '@/shared/lib/cacheTags';
import { fetchBE } from './fetchBE';

export const adminAccountService = {
  async getById(id: string) {
    'use cache';
    cacheTag(CACHE_TAGS.adminAccount(id));
    return fetchBE<AdminAccount>(`/admin/accounts/${id}`);
  },
};
```

> Tag key theo entity id — mọi admin viewer dùng chung slot của entity X (data về X, không về viewer). Mutate X → `revalidateTag(adminAccount(id))` xoá đúng slot đó.

**Ngoại lệ — `adminAuthService.me()`** không tag được an toàn vì data là về viewer (token-bound, không có entity id rõ trong arg). Dùng React `cache()` cho per-request dedup:

```ts
import { cache } from 'react';
export const adminAuthService = {
  me: cache(async () => fetchBE<MeResponse>('/api/auth/me', { cache: 'no-store' })),
};
```

**Mutation (Server Action):**

```ts
// actions/admin/upgradeRequest.actions.ts
'use server';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/shared/lib/cacheTags';
import { requireAdmin } from '@/services/admin/requireAdmin';
import { adminUpgradeRequestService } from '@/services/admin/adminUpgradeRequestService';

export async function approveUpgradeRequest(id: string) {
  await requireAdmin();
  try {
    await adminUpgradeRequestService.approve(id);
    revalidateTag(CACHE_TAGS.ADMIN_UPGRADE_REQUESTS_LIST);
    revalidateTag(CACHE_TAGS.adminAccount(id));
    return { ok: true } as const;
  } catch (e) {
    return { ok: false, error: normalizeError(e) } as const;
  }
}
```

Form Client Component dùng `useActionState`:

```tsx
'use client';
const [state, formAction, pending] = useActionState(rejectUpgradeRequest, null);
```

→ Progressive enhancement: form vẫn submit được khi JS fail.
→ Server Action **luôn** trả `{ ok, error? }` shape, không throw cho expected errors (validation, conflict).

### D5. URL searchParams là State of Truth cho filter/pagination

`/admin/disputes?status=OPEN&page=2&pageSize=20`

- Page nhận `searchParams` prop (Next 16: `searchParams: Promise<...>` — `await` trước khi dùng).
- Filter Client component dùng `useRouter().replace(buildUrl(...))` để không thêm history entry.
- Lợi: shareable link, back-button đúng, không cần state lib.

### D6. Auth — middleware + layout double-check

| Lớp | Việc |
|---|---|
| `middleware.ts` (root) | Match `/admin/:path*`. Đọc session cookie. Nếu thiếu → redirect `/login?next=...`. **Không** decode role ở middleware (giữ middleware nhẹ, không gọi BE) |
| `app/(admin)/layout.tsx` | Gọi `getCurrentUser()` (server, qua `adminAuthService.me()`). Nếu `role !== 'admin'` → `redirect('/login?reason=forbidden')`. Cover BR-001 |
| Mỗi Server Action | Re-check role trong helper `requireAdmin()` ở đầu action — phòng forge request |

3 lớp defense in depth; chi phí thấp vì hai lớp sau đã chạy trong cùng request cycle.

### D7. Caching strategy — `"use cache"` + tag per-entity

**Quy tắc:** admin data về một entity (account, dispute, upgrade request) cache an toàn bằng `"use cache"` + `cacheTag(entityKey)`. Data về viewer (`/api/auth/me`) dùng React `cache()` per-request.

| Service method | Cache strategy | Tag |
|---|---|---|
| `adminUpgradeRequestService.list()` | `"use cache"` | `ADMIN_UPGRADE_REQUESTS_LIST` |
| `adminAccountService.getById(id)` | `"use cache"` | `adminAccount(id)` |
| `adminDisputeService.list(params)` | `"use cache"` | `ADMIN_DISPUTES_LIST_ALL` + `adminDisputesList(hash(params))` |
| `adminDisputeService.getById(id)` | `"use cache"` | `adminDispute(id)` |
| `adminAuthService.me()` | React `cache()` (per-request) | — |

**Invalidate chính xác sau mutation:**

| Mutation | Tags revalidate |
|---|---|
| approve/reject upgrade | `ADMIN_UPGRADE_REQUESTS_LIST`, `adminAccount(id)` |
| lock/unlock account | `adminAccount(id)`, `ADMIN_UPGRADE_REQUESTS_LIST` (nếu account đang trong list pending) |
| resolve dispute | `adminDispute(id)`, `ADMIN_DISPUTES_LIST_ALL` |

**Pattern đa-tag cho list có filter:** mỗi list call gắn đồng thời tag chung (`ADMIN_DISPUTES_LIST_ALL`) và tag scoped theo filter hash. Mutation đơn lẻ revalidate tag chung — nuke mọi filter combo, đơn giản và an toàn:

```ts
async list(params: { status?: string; page?: number }) {
  'use cache';
  cacheTag(CACHE_TAGS.ADMIN_DISPUTES_LIST_ALL);
  cacheTag(CACHE_TAGS.adminDisputesList(stableHash(params)));
  return fetchBE<DisputeList>(`/disputes?${stringify(params)}`);
}
```

### D8. Form validation: thủ công (3 form đơn giản)

Spec chỉ có 3 form (reject upgrade, lock account, resolve dispute). Validate thủ công ngay đầu Server Action (`if (!reason?.trim()) return { ok: false, error: { code: 'VALIDATION', field: 'reason' } }`) + duplicate check ở client để UX nhanh. Nếu sau này codebase add Zod cho lý do khác → migrate sau, không add chỉ vì 3 form này.

### D9. PPR / streaming

- **PPR (Partial Prerendering)**: KHÔNG enable cho admin area. Admin pages auth-gated, không có "static shell" thật sự — toàn dynamic.
- **Streaming**: dùng `<Suspense>` quanh data loader, hiển thị shell + skeleton ngay, fill bảng khi BE response về. Đã là pattern hiện tại của codebase.

### D10. Error UX & Server Action error shape

**Quy ước:** Server Action **luôn** wrap body trong `try/catch` và return `Result<T>` shape — `error.tsx` KHÔNG catch Server Action errors (chỉ catch render errors).

```ts
type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: { code: 'VALIDATION'|'CONFLICT'|'FORBIDDEN'|'UNKNOWN'; message: string; field?: string } };
```

| Layer | Cơ chế |
|---|---|
| Server Component fetch lỗi network/5xx | Throw → `error.tsx` segment catch → nút "Thử lại" (`reset()`) |
| Server Component fetch 401/403 | Throw redirect → middleware xử lý |
| Server Action — bất kỳ throw nào | Try/catch ngay trong action, trả `{ ok: false, error }`; client toast |
| Server Action 409 conflict | `{ ok: false, error: { code: 'CONFLICT' } }` → client toast + `router.refresh()` |
| Validation lỗi (reason rỗng) | `{ ok: false, error: { code: 'VALIDATION', field: 'reason' } }` → form inline error |
| Race condition (optimistic lock) | Nếu BE trả `version`/ETag mismatch → map sang `CONFLICT` (xem G9 mới) |

---

## 4. Cấu Trúc Folder Đề Xuất

```
my-app/src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx                    # server: shell + auth gate
│   │   ├── loading.tsx                   # global admin loader
│   │   ├── error.tsx                     # global admin error
│   │   ├── companions/
│   │   │   ├── page.tsx                  # server: list page
│   │   │   ├── loading.tsx
│   │   │   ├── _components/
│   │   │   │   ├── UpgradeRequestTable.tsx     # server (rows render server)
│   │   │   │   └── UpgradeRequestFilters.tsx   # client: searchParams writer
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── _components/
│   │   │       │   ├── ApproveButton.tsx       # client form
│   │   │       │   ├── RejectModal.tsx         # client form + reason
│   │   │       │   └── LockToggle.tsx          # client form + reason
│   │   ├── clients/[id]/...
│   │   └── disputes/
│   │       ├── page.tsx
│   │       ├── _components/
│   │       │   ├── DisputeTable.tsx
│   │       │   └── DisputeStatusFilter.tsx     # client
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── _components/
│   │               └── ResolveDisputeForm.tsx  # client form
├── components/admin/                     # shared, generic
│   ├── StatusBadge.tsx                   # server (pure)
│   ├── Pagination.tsx                    # client (router.push)
│   ├── EmptyState.tsx                    # server
│   └── AdminPageHeader.tsx               # server
│   # Bảng + modal inline trong _components/ của từng route (rule-of-three)
├── services/admin/                       # server-only data layer
│   ├── adminAuthService.ts               # 'server-only'
│   ├── adminAccountService.ts
│   ├── adminUpgradeRequestService.ts
│   ├── adminDisputeService.ts
│   ├── fetchBE.ts                        # token forward, error normalize
│   └── requireAdmin.ts                   # guard helper for actions
├── actions/admin/                        # 'use server' modules
│   ├── upgradeRequest.actions.ts
│   ├── account.actions.ts
│   └── dispute.actions.ts
└── middleware.ts                         # thêm match /admin/:path*
```

Quy ước:
- File trong `services/admin/` bắt buộc có `import 'server-only';` ở đầu (Next sẽ throw nếu lỡ import từ client).
- Component có `'use client';` chỉ đặt trong `_components/` của route segment để rõ phạm vi.

---

## 5. Component Composition (3 ví dụ mẫu)

### 5.1. List Page — `/admin/companions`

```
CompanionsPage (Server)
├── AdminPageHeader (Server)
├── UpgradeRequestFilters (Client)      ← reads/writes searchParams
└── <Suspense fallback={<TableSkeleton/>}>
    └── UpgradeRequestTable (Server, async)    ← fetch + render rows
        └── StatusBadge (Server)
        └── Pagination (Client)
```

- Page nhận `searchParams`, truyền vào `<UpgradeRequestTable searchParams={...}>` để async fetch.
- Filters là client, render độc lập, không Suspense (instant).
- Skeleton xuất hiện ngay; bảng stream về sau.

### 5.2. Detail + Action Page — `/admin/companions/[id]`

```
CompanionDetailPage (Server, async)
├── AdminPageHeader (Server)
├── <Suspense fallback={<DetailSkeleton/>}>
│   └── CompanionDetail (Server, async)
│       ├── ProfileBlock (Server)
│       ├── ApproveButton (Client)            ← Server Action
│       ├── RejectModal (Client)              ← useActionState
│       └── LockToggle (Client)               ← reason modal inline
```

- Mỗi action button là Client Component nhận `id` qua prop; gọi Server Action import từ `actions/admin/*`.
- Sau action: action gọi `revalidateTag` → Next tự re-render Server Component → UI update.

### 5.3. Form Page — `/admin/disputes/[id]`

```
DisputeDetailPage (Server)
├── DisputeHeader (Server)
├── <Suspense fallback={...}>
│   └── DisputeBody (Server, async)
│       ├── EvidenceList (Server)
│       ├── PartiesInfo (Server)
│       └── ResolveDisputeForm (Client)       ← 3 radio + notes + useActionState
```

ResolveDisputeForm dùng `useActionState(resolveDispute, null)`:
- 3 radio: `REFUND_CLIENT` / `PAYOUT_COMPANION` / `REJECT_DISPUTE`
- Textarea notes (required, length > 0 validate cả client + server)
- Submit → Server Action → trả `{ ok }` hoặc `{ error }` → toast + `revalidateTag`

---

## 6. Service Layer Contract (rút từ v1, không đổi nhiều)

| Service | Method | API |
|---|---|---|
| `adminAuthService` | `me()`, `logout()` | `GET /api/auth/me`, `POST /api/auth/logout` |
| `adminUpgradeRequestService` | `list()`, `approve(id)`, `reject(id, reason)` | `GET /admin/upgrade-requests`, `PUT /admin/upgrade-requests/{id}/approve\|reject` |
| `adminAccountService` | `getById(id)`, `lock(id, reason)`, `unlock(id)` | `GET /admin/accounts/{id}`, `PUT /admin/accounts/{id}/lock\|unlock` |
| `adminDisputeService` | `list(params)`, `getById(id)`, `resolve(id, payload)` | `GET /disputes`, `GET /disputes/{id}`, `POST /disputes/{id}/resolve` |

Helper chung `fetchBE(path, opts)`:
- Forward `Authorization: Bearer ${token}` đọc từ `cookies()`.
- Catch network → throw `BackendUnreachableError`.
- Catch !ok → parse body gRPC-Gateway shape, normalize sang `{ code: string, message, field? }`, throw `BackendError`.
- Caller (Server Component / Action) quyết định: throw tiếp (→ error.tsx) hay return error (→ form).

---

## 7. Shared Components (chỉ build khi có ≥2 usage thật)

**Nguyên tắc rule-of-three**: build inline trong route trước; tách shared khi xuất hiện usage thứ 3. Bảng dưới chia nhóm rõ.

**Build sẵn ở Wave 0** (chắc chắn ≥2 usage):

| Component | Loại | Lý do build trước |
|---|---|---|
| `AdminPageHeader` | Server | Dùng ở cả 5 page |
| `StatusBadge` | Server | Dùng ở list + detail companions + disputes + accounts |
| `Pagination` | Client | Dùng companions list + disputes list |
| `EmptyState` | Server | Cả 2 list |

**KHÔNG build generic ở Wave 0 — inline trước:**

| ~~Component~~ | Quyết định |
|---|---|
| ~~`DataTable` generic~~ | Inline 2 bảng (companions, disputes) bằng JSX trực tiếp. Bảng chỉ có 5-7 column, không lý do gì phải có abstraction columns/rows. Refactor khi có bảng thứ 3. |
| ~~`AuditConfirmModal` wrap `ConfirmDialog`~~ | Build `AuditConfirmModal` standalone trong `_components/` của route đầu tiên (Companion detail). Khi route 2 (Disputes) cần → mới promote lên shared. ConfirmDialog không cần wrap riêng. |
| ~~`SearchInput`~~ | Chưa có search yêu cầu trong spec (search "theo tên" của AC-005-01 thuộc `/admin/clients` list — đã DROP). Bỏ. |
| `ConfirmDialog` | Có thể skip, dùng `<dialog>` native + form action thẳng |

Bỏ hoàn toàn: KpiCard, DateRangePicker, FilterBar, AuditLogTrail (page liên quan đã DROP).

---

## 8. Implementation Plan

### Wave 0 — Foundation

| # | Task | Output | Spec |
|---|---|---|---|
| W0.1 | Scaffold `app/(admin)/` + `layout.tsx` (server) + `loading.tsx` + `error.tsx` | shell | §4 |
| W0.2 | `middleware.ts` thêm match `/admin/:path*` — check cookie tồn tại, redirect login nếu thiếu | guard nhẹ | D6 |
| W0.3 | `services/admin/fetchBE.ts` — token forward (cookies) + error normalize (gRPC-Gateway → app shape) + Origin/CSRF check for Server Actions | helper | §6, D10, R7 |
| W0.4 | `services/admin/adminAuthService.ts` + `requireAdmin()` guard | auth | D6 |
| W0.5a | Mở rộng `shared/lib/cacheTags.ts`: thêm `ADMIN_UPGRADE_REQUESTS_LIST`, `ADMIN_DISPUTES_LIST_ALL`, builder `adminAccount(id)`, `adminDispute(id)`, `adminDisputesList(scope)` | tag registry | D4, D7 |
| W0.5b | 3 service modules (`adminAccountService`, `adminUpgradeRequestService`, `adminDisputeService`) — `import 'server-only'` + `"use cache"` + `cacheTag()` per-entity. `adminAuthService.me()` dùng React `cache()` | data layer | §6, D7 |
| W0.6 | `actions/admin/*.actions.ts` skeleton — `'use server'` + `requireAdmin()` + try/catch + `revalidateTag` (tags từ registry) + `ActionResult` shape | mutation layer | D4, D10 |
| W0.7a | Shared components nhóm 1 (server-pure): `AdminPageHeader`, `StatusBadge`, `EmptyState` | server kit | §7 |
| W0.7b | Shared components nhóm 2 (client interactive): `Pagination` | client kit | §7 |
| W0.8 | `app/(admin)/layout.tsx` shell: sidebar 2 nhóm (Companions, Disputes) + topbar (logout) — align với design tokens pastel hiện có (`ruka-500`, etc.) | shell | §3, R8 |
| W0.9 | a11y baseline: focus trap util cho modal, ARIA labels cho radio group, skip-to-content link | a11y | R9 |

### Wave 1 — In-scope Pages

| # | Task | API | Spec |
|---|---|---|---|
| W1.1 | `/admin/companions` list — Server page + Suspense + UpgradeRequestTable | `GET /admin/upgrade-requests` | US-002, §5.1 |
| W1.2 | `/admin/companions/[id]` detail + Approve + Reject (RejectModal client với useActionState) | `GET /admin/accounts/{id}`, approve/reject | US-003, §5.2 |
| W1.3 | LockToggle trên Companion detail | lock/unlock | US-004 |
| W1.4 | `/admin/clients/[id]` detail + LockToggle (reuse W1.3 component) | `GET /admin/accounts/{id}`, lock/unlock | US-005, US-006 |
| W1.5 | `/admin/disputes` list — Server page + DisputeStatusFilter (client) + Pagination | `GET /disputes` | US-010, §5.1 |
| W1.6 | `/admin/disputes/[id]` detail + ResolveDisputeForm | `GET /disputes/{id}`, resolve | US-011, §5.3 |
| W1.7 | 409 conflict UX: Server Action trả `{ error: { code: 'CONFLICT' } }` → toast + `router.refresh()` | — | AC-003-04, AC-011-05 |

> Wave 2/3 vẫn DROP (không có API).

---

## 9. Test Strategy

| Loại | Phạm vi |
|---|---|
| **Unit (Vitest)** | `fetchBE` (mock global `fetch`), error normalize, `requireAdmin`, service methods, validation helper |
| **Action test** | Server actions test với `fetch` mocked — verify gọi đúng endpoint + `revalidateTag` được trigger với đúng tag (spy `next/cache`) + đúng `ActionResult` shape cho success/validation/conflict |
| **Component (RTL)** | `Pagination` (page boundaries), `RejectReasonModal` & `LockToggle` (disable submit khi reason rỗng), `ResolveDisputeForm` (radio + notes validation, focus trap) |
| **E2E (Playwright)** | 5 golden path (giữ nguyên từ v1) |

Bỏ: contract test (BE chưa có OpenAPI), visual regression (chưa cần).

---

## 10. Gap Analysis

G1–G3, G5–G8: giữ từ v1 (contract chưa rõ: pagination, account fields, dispute join, 409 shape, /me endpoint, error mapping). G4: CLOSED.

**G9 (mới) — Optimistic lock / version field cho concurrent admin action:** Dispute có field `version`. Luật: client gửi `version` trong body resolve; BE trả `409 CONFLICT` nếu mismatch. Hỏi BE: có ETag/If-Match alternative? FE phải retry tự động (fetch lại version mới + warn user) hay chỉ hiển thị conflict toast? **Action:** confirm với BE trước W1.6 + W1.7.

---

## 11. Risks

- **R1 — Server Action gọi sai layer**: kỹ luật `'use server'` + `import 'server-only'`. Mitigation: linter rule + code review.
- **R3 — Không có admin booking management**: vẫn open.
- **R4 — Pagination cho upgrade-requests**: nếu volume > 200 mà BE chưa pagination, cân nhắc client-side truncate + warning banner.
- **R6 — Cache tag typo / mismatch**: tag sai làm `revalidateTag` không trigger, UI stale. Mitigation: dùng builder ở `shared/lib/cacheTags.ts` (đã có pattern), không dùng raw string trong action; unit test verify action gọi đúng tag function.
- **R7 — Server Action sau reverse proxy**: Next 16 chống CSRF bằng Origin check + Action ID. Sau reverse-proxy mất Origin → config `experimental.serverActions.allowedOrigins` trong `next.config.ts`. **Acceptance:** test 1 Server Action behind production proxy trước khi gate S4.
- **R8 (mới) — Design system drift**: codebase dùng tokens pastel (`ruka-500`, `chizuru-*`, `mami-*`, `sumi-*`) và component như `WipeReveal`. Admin area phải dùng cùng tokens (lấy từ `globals.css`), không tạo palette mới. Layout admin desktop-first nhưng phải reuse Button/Input atoms hiện có nếu có.
- **R9 (mới) — a11y**: modal cần focus trap + restore focus; radio group cần `role="radiogroup"` + label; nút action có aria-label rõ. Sai → user dùng bàn phím/screen reader không thao tác được. Acceptance: axe-core scan pass ở W1.
- **R10 (mới) — Skeleton layout shift**: skeleton width/height phải khớp markup thật (table row, detail card). Mitigation: skeleton dùng cùng class container.

---

## 12. Trade-offs Đã Bỏ (ghi minh bạch)

| Bỏ | Lý do |
|---|---|
| TanStack Query | Server Components + Server Actions + `"use cache"` + `revalidateTag` đã đủ; thêm RQ là tax bundle + 2 lớp cache đồng bộ tay |
| Route handler BFF (`app/api/admin/*`) | Server Components chạy server-side, gọi BE trực tiếp tiết kiệm 1 hop. Sẽ thêm khi có client cần fetch (mobile, webhook) |
| Zustand/Jotai | Không có cross-component client state đáng kể; searchParams + form state là đủ |
| PPR | Admin page auth-gated, dynamic-only |
| ISR | Admin data cần fresh, không phù hợp |
| Edge runtime | Service gọi BE microservice nội bộ, Node runtime an toàn hơn (tránh edge limit về fetch body size, time) |
| React Hook Form | 3 form đơn giản, `useActionState` đủ |
| Optimistic UI bằng `useOptimistic` | Action chạy nhanh (sub-sec), pending spinner đủ; sẽ thêm sau nếu admin báo chậm |

---

## 13. GATE để sang S4

- [ ] Tech Lead approve: Server-first, no TanStack, no BFF route handler.
- [ ] Tech Lead approve: D7 `"use cache"` + `cacheTag(entityKey)` (theo AGENTS.md cập nhật 2026-06-22). `adminAuthService.me()` dùng React `cache()` per-request.
- [ ] BE confirm G1, G2, G7 (HIGH gaps) và G9 (version/ETag policy).
- [ ] Verify Server Action behind reverse proxy (R7) — POC ở W0 build.
- [ ] Design lead xác nhận admin layout dùng tokens pastel hiện có (R8).
- [ ] a11y baseline (R9) có trong W0.9 task.
