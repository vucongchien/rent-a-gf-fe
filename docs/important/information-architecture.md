# Information Architecture

**System:** Rent-a-Girlfriend Platform
**Frontend Apps:**

* `apps/web` → Client-facing platform (Guest / Client / Companion)
* `apps/admin` → Internal moderation & operational dashboard

**Framework:** Next.js App Router
**Architecture Style:** Server-first + Mobile-first + Route-driven UI
**Last updated:** 2026-05-17

---

# 1. Architectural Philosophy

Frontend được thiết kế theo các nguyên tắc:

* Mobile-first UX
* URL tối giản
* State-driven UI
* Persistent Layouts
* Low navigation friction
* Context-preserving interaction
* Realtime-first communication

Hệ thống tận dụng tối đa khả năng của Next.js App Router:

| Feature             | Mục đích                                      |
| ------------------- | --------------------------------------------- |
| Route Groups        | Tách boundary theo domain                     |
| Nested Layouts      | Giữ UI persistent                             |
| Parallel Routes     | Modal song song                               |
| Intercepting Routes | URL-driven modal                              |
| Streaming SSR       | Render từng phần                              |
| Suspense Boundary   | Independent loading                           |
| Server Components   | Giảm JS bundle                                |
| Client Components   | Chỉ dùng cho interactive UI                   |
| Persistent Layout   | Chat popup & notification tồn tại xuyên route |

---

# 2. Roles & Access Levels

| Role        | Mô tả                  | Ghi chú                             |
| ----------- | ---------------------- | ----------------------------------- |
| `guest`     | Chưa đăng nhập         | Chỉ xem public pages                |
| `client`    | Người thuê dịch vụ     | Khám phá, đặt lịch, nạp coin, chat  |
| `companion` | Người cung cấp dịch vụ | Quản lý profile, scenario, lịch hẹn |
| `admin`     | Quản trị hệ thống      | Moderation, disputes, transactions  |

---

# 3. Route Hierarchy — `apps/web`

## Route Tree

```text
app/
│
├── (marketing)                                 [Public Layout]
│   ├── /                                       # Landing page
│   ├── /explore                                # Explore companions
│   ├── /explore/[companionId]                  # Companion magazine profile
│   │
│   ├── /explore/[companionId]/booking          # Full-page booking fallback
│   │
│   ├── @modal/
│   │   └── (.)explore/[companionId]/booking    # URL-driven booking modal
│   │
│   └── /about
│
├── (auth)                                      [Auth Boundary]
│   └── /login                                  # Google login page
│
├── (client)                                    [Client Area]
│   ├── /bookings                               # Booking management page
│   ├── /wallet
│   │   ├── /wallet
│   │   ├── /wallet/topup
│   │   ├── /wallet/topup/processing
│   │   └── /wallet/topup/return
│   │
│   ├── /favorites
│   ├── /profile                                # Client Profile
│   └── /onboarding/companion                   # Wizard applying to become Companion
│       ├── /onboarding/companion/apply         # Fill application (album, voice, scenarios)
│       ├── /onboarding/companion/pending       # Locked waiting screen for review
│       └── /onboarding/companion/rejected      # View rejection reasons and re-apply
│
│
├── (companion)                                 [Companion Workspace]
│   └── /dashboard
│       ├── /dashboard
│       ├── /dashboard/requests
│       ├── /dashboard/schedule
│       ├── /dashboard/profile
│       ├── /dashboard/profile/scenarios
│       ├── /dashboard/earnings
│       ├── /dashboard/violations
│       └── /dashboard/settings
│
├── (shared-authenticated)
│   ├── /notifications
│   └── /messages                               # Mobile fallback message page
│
├── api/
│   ├── /auth
│   ├── /internal
│   └── /webhooks/vnpay
│
├── middleware.ts
├── layout.tsx
├── global-error.tsx
├── loading.tsx
└── not-found.tsx
```

---

# 4. Route Ownership & Rendering Strategy

| Route                   | Domain        | Rendering       | Notes                      |
| ----------------------- | ------------- | --------------- | -------------------------- |
| `/`                     | Marketing     | Static + ISR    | SEO landing                |
| `/explore`              | Discovery     | Streaming SSR   | Search/filter heavy        |
| `/explore/[id]`         | Discovery     | Dynamic SSR     | SEO profile page           |
| `/explore/[id]/booking` | Booking       | Dynamic         | Intercepting modal         |
| `/bookings`             | Booking       | Client-heavy    | Stateful management UI     |
| `/wallet/*`             | Finance       | Hybrid          | Sensitive transactional UI |
| `/dashboard/*`          | Companion Ops | Streaming SSR   | Operational dashboard      |
| `/notifications`        | Interaction   | Hybrid realtime | SSE updates                |
| `/messages`             | Interaction   | Client-heavy    | Mobile fullscreen fallback |

---

# 5. Booking Architecture

## Booking Creation Flow

Booking creation KHÔNG phải page độc lập hoàn toàn.

Người dùng đang ở flow:

```text
Explore
→ Xem profile
→ Hứng thú
→ Đặt lịch ngay
```

Vì vậy hệ thống dùng:

```text
URL-driven Modal
```

thay vì redirect sang page mới.

---

## Booking Modal Strategy

### Desktop

* Render dưới dạng centered modal
* Preserve background profile
* Preserve scroll position
* Back button đóng modal

### Mobile

* Render dạng fullscreen sheet / fullscreen modal
* Tránh modal nhỏ gây khó thao tác
* Touch-first optimized

---

## Next.js Intercepting Route Structure

```text
app/(marketing)/explore/[companionId]/
│
├── page.tsx
│
├── booking/
│   └── page.tsx
│
├── @modal/
│   └── (.)booking/
│       └── page.tsx
│
└── layout.tsx
```

---

## Booking Management Strategy

Hệ thống KHÔNG dùng:

```text
/bookings/[bookingId]
```

cho MVP.

Lý do:

* Booking chưa đủ phức tạp
* Không cần deep-link mạnh
* Tránh route explosion
* Tránh duplicated layouts
* Tối ưu mobile UX

Thay vào đó:

```text
/bookings
```

sẽ sử dụng:

* tabs
* filters
* drawer
* bottom sheet
* expandable cards

---

# 6. Booking Management UX

## Desktop

### Layout Pattern

```text
List + Detail Drawer
```

### UI

* Danh sách booking bên trái
* Drawer chi tiết bên phải
* Không điều hướng route mới

### Booking Detail Drawer gồm:

* trạng thái booking
* timeline
* payment status
* report action
* review action
* open chat action

---

## Mobile

### Layout Pattern

```text
Fullscreen Bottom Sheet
```

### Vì sao?

Drawer desktop không hợp mobile:

* thiếu không gian
* gesture khó
* keyboard conflict

Nên mobile sẽ:

* mở fullscreen sheet
* swipe down để đóng
* tối ưu touch interaction

---

# 7. Chat System Architecture

Chat KHÔNG phải primary route.

Chat là:

```text
persistent realtime utility
```

giống:

* Facebook Messenger
* Intercom
* Discord overlay

---

# 8. Chat UX Strategy

## Desktop

### Global Popup Chat

Chat mounted tại:

```text
Root Layout
```

### Structure

```tsx
<AuthProvider>
  <NotificationProvider>
    <ChatProvider>

      {children}

      <ChatPopupSystem />
      <NotificationPanel />
      <ToastViewport />

    </ChatProvider>
  </NotificationProvider>
</AuthProvider>
```

---

## Desktop UX

### Hành vi:

* popup góc phải dưới
* nhiều chat tabs
* persistent giữa routes
* không reload khi navigate
* floating overlay

### Trigger Sources:

* booking card
* notification
* dashboard
* profile page

---

## Mobile

### KHÔNG dùng popup chat

Mobile popup chat rất tệ:

* conflict keyboard
* conflict viewport
* conflict gestures
* thiếu chiều cao

Nên mobile sẽ fallback sang:

```text
/messages
```

fullscreen page.

---

## Mobile Chat UX

### Layout:

```text
Conversation List
→ Fullscreen Conversation
```

### Giống:

* Messenger mobile
* Telegram mobile
* Discord mobile

---

# 9. Stateful Chat Behavior

| Booking State    | Chat Access | UI State          |
| ---------------- | ----------- | ----------------- |
| `PENDING`        | hidden      | Chưa tạo room     |
| `ACCEPTED`       | active      | Chat hoạt động    |
| `COMPLETED <24h` | active      | Cho phép trao đổi |
| `COMPLETED >24h` | readonly    | Khóa gửi tin      |
| `CANCELLED`      | locked      | Khóa ngay         |
| `DISPUTED`       | readonly    | Preserve evidence |

---

# 10. Notifications Architecture

## Desktop

### Notification Slide-over Panel

* Mở từ góc phải
* Overlay nhẹ
* Không redirect route

---

## Mobile

### Fullscreen Notifications Page

```text
/notifications
```

Lý do:

* không đủ width cho side panel
* mobile navigation khác desktop

---

# 11. Mobile-first Navigation

## Guest

| Tab        | Mục đích      |
| ---------- | ------------- |
| 🔍 Explore | Khám phá      |
| 👤 Account | Login/Profile |

---

## Client

| Tab         | Mục đích |
| ----------- | -------- |
| 🔍 Explore  | Khám phá |
| 📅 Bookings | Cuộc hẹn |
| 💬 Messages | Chat     |
| 💰 Wallet   | Ví       |
| 👤 Profile  | Cá nhân  |

---

## Companion

| Tab          | Mục đích  |
| ------------ | --------- |
| 📊 Dashboard | Tổng quan |
| 📅 Schedule  | Lịch hẹn  |
| 💬 Messages  | Chat      |
| 💰 Earnings  | Thu nhập  |
| 👤 Profile   | Hồ sơ     |

---

# 12. Access Control Matrix

| Route                   | Guest | Client           | Companion        | Admin       |
| ----------------------- | ----- | ---------------- | ---------------- | ----------- |
| `/`                     | view  | view             | view             | —           |
| `/explore/*`            | view  | view             | view             | —           |
| `/explore/[id]/booking` | —     | create           | —                | —           |
| `/bookings`             | —     | own only         | —                | —           |
| `/wallet/*`             | —     | own only         | —                | —           |
| `/dashboard/*`          | —     | —                | approved only    | —           |
| `/notifications`        | —     | own only         | own only         | —           |
| `/messages`             | —     | room member only | room member only | moderation  |
| `apps/admin/*`          | —     | —                | —                | full access |

---

# 13. apps/admin Route Hierarchy

```text
/
├── /companions
├── /companions/[id]
├── /users
├── /transactions
├── /disputes
└── /settings
```

---

# 14. Admin UX Strategy

## Desktop-first

Admin KHÔNG optimize mobile trước.

Lý do:

* moderation workflow phức tạp
* table-heavy UI
* audit-heavy
* nhiều data density

---

## Layout

```text
Persistent Sidebar
+ Streaming Data Panels
+ Suspense Boundaries
```

---

# 15. SEO Strategy

| Route           | SEO     |
| --------------- | ------- |
| `/`             | indexed |
| `/explore`      | indexed |
| `/explore/[id]` | indexed |
| `/bookings`     | noindex |
| `/wallet/*`     | noindex |
| `/dashboard/*`  | noindex |
| `/messages`     | noindex |
| `apps/admin`    | blocked |

---

# 16. Architectural Notes

## Server Components

Dùng cho:

* SEO pages
* data fetching
* streaming layouts

KHÔNG dùng cho:

* realtime chat
* heavy interaction
* animated overlays

---

## Client Components

Chỉ dùng cho:

* forms
* realtime UI
* modal
* drawer
* chat
* notifications
* optimistic updates

---

## Realtime Strategy

| Feature         | Transport |
| --------------- | --------- |
| Notifications   | SSE       |
| Chat typing     | WebSocket |
| Chat messages   | WebSocket |
| Booking updates | SSE       |

---

# 17. MVP Scope Philosophy

Hệ thống intentionally:

* giảm số lượng routes
* giảm hard navigation
* tăng overlay UX
* tăng continuity
* tránh over-engineering

Mục tiêu:

> Social-product UX trước, enterprise workflow sau.
