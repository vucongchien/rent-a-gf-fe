# Frontend Vision & Scope

**Platform:** Companion booking platform  
**Scope:** `apps/web` (public + authenticated), `apps/admin`  
**Last updated:** 2026-05-17

---

## Tài liệu liên quan

Chi tiết kỹ thuật được tách ra các tài liệu chuyên biệt:

| Tài liệu | Mô tả |
|---|---|
| [`information-architecture.md`](./information-architecture.md) | Route hierarchy, screen list, navigation, access control ✅ |
| `user-flow.md` | Flow-level behavior, loading/error/empty/timeout states |
| `state-machine.md` | Booking, escrow, chat, review lifecycle |
| [`domain-model.md`](./domain-model.md) | FE ViewModel types (không lấy thẳng từ BE schema) ✅ |
| [`api-contract.md`](./api-contract.md) | Endpoint, request/response, error format, auth behavior ✅ |
| [`mock-strategy.md`](./mock-strategy.md) | Mock layer, mock fidelity, MSW setup ✅ |
| `frontend-architecture.md` | App structure, state management, data fetching strategy |
| `design-system.md` | Design tokens, component spec |
| `realtime-spec.md` | SSE reconnect, heartbeat, stale event handling |
| `error-handling.md` | Error → UX mapping |
| `auth-flow.md` | Cookie strategy, route guard, role guard, CSRF |
| `performance-strategy.md` | Code splitting, image, cache, streaming |
| `testing-strategy.md` | Unit, component, E2E, MSW |
| [`ci-cd.md`](./ci-cd.md) | Lint, typecheck, test, build, deploy pipeline ✅ |
| `accessibility-checklist.md` | Keyboard nav, focus trap, aria, contrast |

---

## Architectural Decisions (cấp cao)

Các quyết định này không thay đổi trừ khi có ADR mới.

**Multi-app Monorepo — không dùng microfrontend runtime**
- `apps/web`: Next.js App Router — cần SEO, SSR/ISR cho public pages
- `apps/admin`: Next.js — CSR, không cần SEO
- Chia sẻ qua compile-time packages: `packages/ui`, `packages/contracts`, `packages/config`

**Domain-driven bên trong mỗi app**
- `src/domains/` — booking, chat, wallet, companion
- Cấm import chéo giữa các domain. Shared logic → `packages/`

**BFF thay vì gọi thẳng microservices**
- Browser chỉ giao tiếp với Next.js BFF (`/api/*`)
- BFF đọc HttpOnly Cookie, gắn JWT, forward lên API Gateway
- FE không bao giờ chạm vào raw token

**SSE, không dùng WebSocket**
- Nhận event qua SSE stream từ BFF
- Gửi message (chat) qua HTTP POST
- SSE event → `queryClient.invalidateQueries` → React Query refetch

**Backend là source of truth**
- FE giữ: UI state, cache state, optimistic updates, realtime reconciliation
- FE không thực thi business rules, không tính toán số dư, không tự quyết định quyền hạn

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js App Router + TypeScript |
| Styling | Tailwind CSS + CSS Variables (Design Tokens) |
| Server state | TanStack Query (React Query) |
| UI state | Zustand |
| Realtime | Native `EventSource` (SSE) |
| Upload | Pre-signed URL → Cloudinary trực tiếp |
| Auth | Google OAuth, JWT lưu HttpOnly Cookie |

---

## SEO & Rendering

- Public pages (`/explore`, `/explore/[id]`): SSR hoặc ISR — cần SEO
- Authenticated pages (dashboard, chat, wallet): CSR — không cần SEO
- Admin app: CSR toàn bộ

---

## Future-ready (chưa implement trong MVP)

- **Dark mode:** Dùng CSS Variables semantic — không hardcode màu. Sẵn sàng swap `.dark` class sau.
- **i18n:** Wrap tất cả display text bằng `t('key')`, string trong `locales/vi.json`. Thêm ngôn ngữ sau chỉ cần thêm file JSON.

---

## Deployment & CDN

- `apps/web` và `apps/admin` deploy độc lập (Vercel hoặc Docker)
- Static assets và ISR pages → Cloudflare / CloudFront CDN Edge
- Media assets (ảnh, audio) → Cloudinary CDN — FE gọi thẳng, không qua BFF
