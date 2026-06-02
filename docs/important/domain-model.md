# Frontend Domain Model

**System:** Rent-a-Girlfriend Platform
**Scope:** `apps/web` — ViewModel types dùng cho rendering, không lấy thẳng từ BE schema
**Last updated:** 2026-05-17

---

# 1. Philosophy

## Tại sao FE cần model riêng?

Backend trả gì không có nghĩa FE dùng đó.

3 lý do cốt lõi:

| Lý do | Vấn đề nếu dùng thẳng BE |
| --- | --- |
| **Optimized for rendering** | BE trả `rating: 4.73` — FE cần `ratingText: "4.7 ⭐"` |
| **Optimized for UX** | BE trả `status: "ACCEPTED"` — FE cần `canChat: true`, `canReview: false` |
| **Stable against BE changes** | BE đổi field name → FE vỡ toàn bộ nếu không có adapter layer |

## Quy tắc đặt tên

```text
[Domain][Purpose]ViewModel

Ví dụ:
- CompanionCardViewModel     → dùng trong list/grid
- CompanionProfileViewModel  → dùng trong magazine profile page
- BookingCardViewModel       → dùng trong /bookings list
- BookingDetailViewModel     → dùng trong drawer/sheet chi tiết
```

## Nguồn dữ liệu

```text
API Response (raw)
      ↓
  Adapter fn       ← transform tại repository layer
      ↓
 ViewModel         ← component chỉ nhận ViewModel
      ↓
  Component        ← render, không biết BE schema
```

---

# 2. Core Domain: Companion

## CompanionCardViewModel

> Dùng tại: `/explore` grid, search results, favorites list

```typescript
type CompanionCardViewModel = {
  id: string
  displayName: string
  avatarUrl: string
  city: string
  ratingText: string         // "4.7 ⭐" | "Chưa có đánh giá"
  reviewCount: number
  featuredScenarioLabel: string  // "Cà phê & trò chuyện · 200K"
  featuredScenarioPrice: string  // "200.000 ₫"
  isAvailable: boolean
  voiceIntroUrl: string | null   // null → ẩn nút nghe
}
```

## CompanionProfileViewModel

> Dùng tại: `/explore/[companionId]` magazine profile page

```typescript
type CompanionProfileViewModel = {
  id: string
  displayName: string
  bio: string
  city: string
  avatarUrl: string
  albumUrls: string[]            // max 4 ảnh
  voiceIntroUrl: string | null
  rating: number                 // 0-5, dùng để render sao
  ratingText: string
  reviewCount: number
  scenarios: ScenarioViewModel[]
  recentReviews: ReviewViewModel[]
  isFavorited: boolean           // derived từ user state
}
```

## ScenarioViewModel

```typescript
type ScenarioViewModel = {
  id: string
  name: string
  description: string
  durationText: string    // "2 giờ"
  priceText: string       // "200.000 ₫"
  priceInCoin: number     // 200 Kano-Coin
  location: string        // địa điểm do Companion đề xuất
  isActive: boolean       // Trạng thái kịch bản hoạt động
  isFeatured: boolean     // Có phải kịch bản nổi bật của Companion không
}

type CreateScenarioInputViewModel = {
  name: string
  description: string
  durationMinutes: number // Nhập từ form (ví dụ: 120 phút)
  priceInCoin: number     // Giá kịch bản tự quyết định (Kano-Coin)
  location: string        // địa điểm do Companion đề xuất
  isFeatured?: boolean
}

type UpdateScenarioInputViewModel = {
  name?: string
  description?: string
  durationMinutes?: number
  priceInCoin?: number
  location?: string
  isActive?: boolean
  isFeatured?: boolean
}
```

---

# 3. Core Domain: Booking

## BookingCardViewModel

> Dùng tại: `/bookings` list — phải render nhanh, ít field

```typescript
type BookingCardViewModel = {
  id: string
  companionName: string
  companionAvatarUrl: string
  scenarioName: string
  scheduledAt: string      // "Thứ 7, 18/05 · 14:00"
  statusLabel: string      // "Đang chờ xác nhận"
  statusVariant: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'disputed'
  priceText: string
  canChat: boolean
  canCancel: boolean
  canReview: boolean
  canReport: boolean
}
```

**Lý do dùng `statusVariant`:**
Component không switch trên string raw `"ACCEPTED"` → dễ typo, dễ vỡ.
`statusVariant` là union type → TypeScript bắt lỗi compile-time.

## BookingDetailViewModel

> Dùng tại: `/bookings` drawer (desktop) / bottom sheet (mobile)

```typescript
type BookingDetailViewModel = {
  id: string
  companionId: string
  companionName: string
  companionAvatarUrl: string
  scenarioName: string
  scenarioLocation: string
  scheduledAt: string
  endsAt: string
  statusLabel: string
  statusVariant: BookingStatusVariant
  priceText: string
  escrowStatusText: string       // "Đang giữ 200 Kano-Coin"
  chatRoomId: string | null
  canChat: boolean
  canCancel: boolean
  canReview: boolean
  canReport: boolean
  review: ReviewViewModel | null  // null nếu chưa review
  timeline: BookingTimelineEvent[]
}

type BookingTimelineEvent = {
  at: string           // "17/05 10:30"
  label: string        // "Companion đã xác nhận"
  variant: 'default' | 'success' | 'warning' | 'danger'
}
```

---

# 4. Core Domain: Wallet

## WalletViewModel

> Dùng tại: `/wallet`

```typescript
type WalletViewModel = {
  balanceText: string        // "1.500 Kano-Coin"
  balanceInVnd: string       // "≈ 1.500.000 ₫"
  frozenText: string         // "200 đang giữ" | null
  transactions: WalletTxViewModel[]
}

type WalletTxViewModel = {
  id: string
  label: string              // "Đặt lịch · Cà phê với Linh"
  amountText: string         // "-200 KC" | "+500 KC"
  amountVariant: 'debit' | 'credit'
  at: string                 // "17/05 · 14:32"
  statusVariant: 'pending' | 'completed' | 'failed' | 'frozen'
}
```

## TopUpFlowViewModel

> Dùng tại: `/wallet/topup` flow

```typescript
type TopUpFlowViewModel = {
  step: 'idle' | 'initiated' | 'processing' | 'success' | 'failed'
  amountInCoin: number | null
  amountInVnd: string | null      // "200.000 ₫"
  paymentUrl: string | null       // redirect link tới VNPay
  errorMessage: string | null
}
```

---

# 5. Core Domain: Review

## ReviewViewModel

```typescript
type ReviewViewModel = {
  id: string
  authorName: string
  authorAvatarUrl: string
  rating: number             // 1-5
  ratingStars: string        // "★★★★☆"
  comment: string
  postedAt: string           // "3 ngày trước"
  isHidden: boolean          // true → ẩn, chỉ Admin thấy
}
```

**Lý do có `isHidden`:**
BRD BR-08a: nếu dispute resolve = refund → review bị soft-delete.
FE cần biết để: Admin thấy `[Đã ẩn]`, Client/Guest không thấy.

---

# 6. Core Domain: Notification

## NotificationViewModel

```typescript
type NotificationViewModel = {
  id: string
  title: string
  body: string
  variant: 'booking' | 'wallet' | 'system' | 'reminder'
  isRead: boolean
  actionUrl: string | null     // deep link navigate khi click
  receivedAt: string           // "Vừa xong" | "5 phút trước"
}
```

---

# 7. Derived State: Access Flags

Các flag `canChat`, `canCancel`, `canReview`, `canReport` **không được tính trong component**.

Tính tại adapter, dựa trên `bookingStatus` + `role` + `currentTime`:

```typescript
function deriveBookingFlags(
  status: BookingStatus,
  role: 'client' | 'companion',
  endTime: Date,
): BookingFlags {
  const now = new Date()
  const hoursSinceEnd = (now.getTime() - endTime.getTime()) / 3600000

  return {
    canChat: (status === 'ACCEPTED' || (status === 'COMPLETED' && hoursSinceEnd < 24)),
    canCancel: status === 'ACCEPTED' && role === 'client',
    canReview: status === 'COMPLETED' && role === 'client',
    canReport: status === 'ACCEPTED' && hoursSinceEnd >= 0,
  }
}
```

**Trade-off:**
- ✅ Component cực kỳ đơn giản, không có business logic
- ✅ Dễ test adapter riêng biệt
- ⚠️ Nếu BE đổi rule → cần cập nhật adapter

---

# 8. Adapter Layer

Mỗi domain có 1 adapter file:

```text
src/domains/
├── companion/
│   └── adapters/
│       ├── toCompanionCardViewModel.ts
│       └── toCompanionProfileViewModel.ts
├── booking/
│   └── adapters/
│       ├── toBookingCardViewModel.ts
│       └── toBookingDetailViewModel.ts
├── wallet/
│   └── adapters/
│       └── toWalletViewModel.ts
└── shared/
    └── adapters/
        └── toReviewViewModel.ts
```

Adapter là **pure function** — không có side effect, dễ unit test:

```typescript
// toCompanionCardViewModel.ts
export function toCompanionCardViewModel(raw: CompanionRaw): CompanionCardViewModel {
  return {
    id: raw.id,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url ?? '/placeholder-avatar.png',
    city: raw.city,
    ratingText: raw.rating_avg > 0
      ? `${raw.rating_avg.toFixed(1)} ⭐`
      : 'Chưa có đánh giá',
    reviewCount: raw.review_count,
    featuredScenarioLabel: `${raw.featured_scenario.name} · ${formatCoin(raw.featured_scenario.price_in_coin)}`,
    featuredScenarioPrice: formatCoin(raw.featured_scenario.price_in_coin),
    isAvailable: raw.status === 'APPROVED',
    voiceIntroUrl: raw.voice_intro_url ?? null,
  }
}
```

---

# 9. Model Stability Rules

| Rule | Mô tả |
| --- | --- |
| **No raw BE fields in components** | Component không được nhận `snake_case` fields từ BE |
| **No computation in JSX** | Không format date/coin/rating trong JSX. Làm ở adapter |
| **Flags from adapter only** | `canChat`, `canReview`, v.v. chỉ đến từ `deriveBookingFlags()` |
| **Null-safe by design** | Optional fields phải là `T | null`, không dùng `undefined` |
| **String for display, number for logic** | `priceText: "200.000 ₫"` cho render, `priceInCoin: 200` cho computation |
