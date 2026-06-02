# Rent-a-Girlfriend Frontend Monorepo (rent-a-gf-fe)

## start

```bash
cd my-app
pnpm i msw --save-dev
pnpm exec msw init ./public
pnpm dev

```


## 📌 Tài liệu Hệ thống

*   📑 **[Frontend Vision & Scope Document](file:///e:/LEARN/rent-a-gf-fe/docs/important/frontend_vision_scope.md)**: Ranh giới trách nhiệm FE-BE, kiến trúc monorepo 5 tầng, chiến lược rendering, responsive, SEO, a11y, i18n và Dark Mode.
*   📑 **[Business Requirements Document (BRD)](file:///e:/LEARN/rent-a-gf-fe/docs/important/BRD.md)**: Chi tiết luồng nghiệp vụ cốt lõi, quy tắc tài chính, hủy lịch, voice intro và Booking State Machine.
*   📑 **[Các Luồng Nghiệp Vụ Cốt Lõi](file:///e:/LEARN/rent-a-gf-fe/docs/reference/core-business.md)**: Phân tích Event Storming, Process Flow cho Booking Core Loop.
*   📑 **[User Flow Document (UX State Machine)](file:///e:/LEARN/rent-a-gf-fe/docs/important/user-flow.md)**: Đặc tả chi tiết 9 luồng nghiệp vụ cốt lõi, ma trận trạng thái UI, xử lý bất đồng bộ, race conditions, đồng bộ real-time và tối ưu hóa mobile.
*   📑 **[Frontend State Machine Document (UX Life-Cycle & Transitions)](file:///e:/LEARN/rent-a-gf-fe/docs/important/state-machine.md)**: Định nghĩa chi tiết các Finite State Machines (FSM) ở phía Client cho Booking & Escrow, Chat Session & SSE, VNPay Wallet Topup, Companion Onboarding Wizard và Companion Scenario Management.

---

## 📌 Architectural Decisions (ADR)

*   📑 **[ADR 0001: Kiến trúc Monorepo 5 tầng, BFF & Event-Driven SSE Chat](file:///e:/LEARN/rent-a-gf-fe/docs/adr/0001-frontend-architecture.md)**: Quyết định nền tảng về tổ chức source code, bảo mật token qua lớp BFF và giao thức truyền tin thời gian thực.
*   📑 **[ADR 0002: Điều hướng và Quản lý luồng giao diện trên Next.js App Router](file:///e:/LEARN/rent-a-gf-fe/docs/adr/0002-nextjs-route-driven-flows.md)**: Quyết định kiến trúc về Route-driven UX, Intercepting/Parallel Routes cho Booking Modal, Global Persistent Chat và mobile navigation fallbacks.
*   📑 **[ADR 0003: MSW Mock Infrastructure làm nền tảng mô phỏng BFF API Gateway](file:///e:/LEARN/rent-a-gf-fe/docs/adr/0003-msw-mock-infrastructure.md)**: Thiết lập Mock Layer chặn request HTTP thực tế thông qua Service Worker, lưu trữ dynamic in-memory fixtures, hỗ trợ stateful mock và mô phỏng lỗi nghiệp vụ không nợ kỹ thuật (no tech debt).

---
