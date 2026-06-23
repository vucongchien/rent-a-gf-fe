# Báo cáo rà soát FE — Rent-a-Girlfriend

> Phạm vi: `my-app/` (Next.js 15 App Router). Rà soát theo luồng nghiệp vụ.
> Ngày: 2026-06-23. Ngữ cảnh: FE + BFF; BE là microservice do team khác.

---

## Tóm tắt mức độ ưu tiên

| Mức | Hạng mục | Lý do |
|---|---|---|
| 🔴 P0 | Booking Detail page, Payment flow, BookingCard dropdown menu, `error.tsx` boundaries | Đứt luồng core “đặt bạn đồng hành” — không có dropdown menu vi phạm trực tiếp `ORIGINAL_REQUEST.md` R2 |
| 🟠 P1 | Wallet UI, Companion dashboard (requests/earnings/schedule) | Service đã sẵn nhưng thiếu page — companion không vận hành được |
| 🟡 P2 | Auth UI (login/register/OTP/forgot), Review form, Client `/me` | Đang phụ thuộc Google OAuth — fallback cần thiết cho release |
| 🟢 P3 | Phase 2–6 backlog (gỡ mock), SSE mock | Đã có lộ trình trong `docs/backlog` |

---

## P0 — Bắt buộc fix trước release

### P0-1. BookingCard thiếu dropdown menu “…”
- **Nghiệp vụ**: `ORIGINAL_REQUEST.md` R2 (dòng 30–35) yêu cầu **bắt buộc** mỗi card phải có nút 3 chấm với menu `Trò chuyện` và `Hủy đặt lịch`. Acceptance Criteria dòng 49 cũng liệt kê đây là điều kiện nghiệm thu.
- **Hiện trạng**: BookingCard render thông tin nhưng không có dropdown — vi phạm AC.
- **Tác động**: User pending/accepted không có cách hủy từ list; user có chatRoomId không có lối tắt vào chat → vòng đời booking bị kẹt ở UI.
- **DoD**:
  - Dropdown menu floating, đóng khi click ngoài, không bị cắt bởi overflow (R2 dòng 35).
  - `Trò chuyện` chỉ hiện khi có `chatRoomId`, link `/chat?roomId={id}`.
  - `Hủy đặt lịch` chỉ hiện khi status ∈ {PENDING, ACCEPTED}, gọi `bookingService.cancelBooking(id)` và revalidate (R3 dòng 40).

### P0-2. Booking Detail page chưa có
- **Nghiệp vụ**: Luồng đặt lịch yêu cầu user xem chi tiết hợp đồng (giờ, kịch bản, địa điểm, tổng tiền, trạng thái thanh toán, lịch sử state machine) trước khi quyết định hủy / review. Đây là điểm chốt giao dịch.
- **Hiện trạng**: `bookingService.getBookingDetail(id)` đã có nhưng không có route consume. Card list không click được vào detail.
- **Tác động**: User không có nơi xem điều khoản, không thể tra cứu khi tranh chấp → admin dispute (đã có) không có nguồn dữ liệu hiển thị từ phía client.
- **DoD**: Route `/(client)/bookings/[id]/page.tsx`, hiển thị toàn bộ field từ `BookingDetail`, nút Hủy/Chat tái dùng menu của P0-1, link review nếu COMPLETED.

### P0-3. Payment / VNPay flow chưa xây
- **Nghiệp vụ**: Booking model có trường `price` (Kanocoin) và backend đã có endpoint `initiateTopup` (VNPay). Không có thanh toán → không có giao dịch thật → toàn bộ business không vận hành.
- **Hiện trạng**: `walletService.initiateTopup()` mock URL; không có page nạp coin; không có gateway callback page; booking không gắn vào payment state.
- **Tác động**: User không thể nạp coin để đặt; companion không có doanh thu; admin transactions page (đã có UI) không có dữ liệu thật.
- **DoD**:
  - `/(client)/wallet/topup` chọn mệnh giá → redirect VNPay.
  - Route callback `/api/payment/vnpay/return` xác thực signature, cập nhật wallet.
  - Booking flow check số dư trước khi tạo.

### P0-4. Không có `error.tsx` boundaries
- **Nghiệp vụ**: Next.js App Router với Server Component sẽ crash cả page nếu fetch lỗi. Với hệ thống dùng BFF + microservice thật, lỗi network là chắc chắn xảy ra.
- **Hiện trạng**: `grep -r "error.tsx"` trong `src/app` → **0 file**.
- **Tác động**: Một service BE down = toàn bộ app whitescreen, không có fallback UX.
- **DoD**: Tối thiểu `app/error.tsx`, `(client)/error.tsx`, `(companion)/error.tsx`, `admin/error.tsx`. Có nút retry + log.

---

## P1 — Cần thiết để vận hành

### P1-1. Wallet UI page chưa tồn tại
- **Nghiệp vụ**: Đồng tiền nội bộ Kanocoin — user phải xem được số dư, lịch sử nạp/rút, trước khi tin tưởng đặt lịch. Nghiệp vụ tài chính bắt buộc phải minh bạch.
- **Hiện trạng**: `walletService.getWallet / getTransactions` ready; navbar có link nhưng page không tồn tại (404). Chỉ có `/client/wallet/test` debug.
- **Tác động**: User không tra được số dư → không tin tưởng nạp tiền → không đặt lịch.
- **DoD**: `/(client)/wallet/page.tsx` (số dư + nút nạp/rút), `/(client)/wallet/transactions/page.tsx` (lịch sử có filter), empty/loading state.

### P1-2. Companion Dashboard — 4 page placeholder
- **Nghiệp vụ**: Companion là một bên đối tác, cần đủ công cụ vận hành. Thiếu page = không onboard được companion thật.
- **Hiện trạng**:
  - `/dashboard/requests` → "Trang đang được xây dựng"
  - `/dashboard/earnings` → placeholder
  - `/dashboard/schedule` → placeholder
  - `/dashboard/notifications` → chưa xây
- **Tác động**:
  - **Requests**: companion không có nơi accept/reject booking đến → toàn bộ luồng booking đứt ở phía companion (dù API `/bookings/[id]/accept`, `/reject` đã có).
  - **Earnings**: không xem được doanh thu → không có động lực cộng tác.
  - **Schedule**: không quản lý được lịch rảnh → overbooking.
- **DoD**: 4 page có UI + service binding. Requests có realtime hoặc poll.

### P1-3. BookingCard / BookingService mock mapping lệch
- **Nghiệp vụ**: Khi gỡ mock (Phase 2 backlog), shape `mockBookings` khác `BookingListItem` BE thật. Sẽ vỡ runtime ngay khi switch sang BE.
- **Hiện trạng**: `bookingService.getBookings()` có nhánh `isMockMode()` map ad-hoc.
- **DoD**: Align type với OpenAPI contract của companion-service; viết adapter một chiều.

---

## P2 — Hoàn thiện trải nghiệm

### P2-1. Auth UI form (login/register/OTP/forgot password)
- **Nghiệp vụ**: Hiện chỉ có Google OAuth. Theo nghiệp vụ KYC + booking pháp lý ở VN, không phải user nào cũng dùng Google; companion cần đăng ký riêng với số điện thoại + OTP để verify danh tính trước KYC.
- **Hiện trạng**: Không có page login/register/OTP/forgot. `authService` có mock.
- **DoD**: Page `/auth/login`, `/auth/register`, `/auth/verify-otp`, `/auth/forgot-password`. Form validation, redirect logic.

### P2-2. Review form sau booking COMPLETED
- **Nghiệp vụ**: Companion detail page có `recentReviews` field và badge rating — không có form thì rating mãi rỗng. Trust signal cốt lõi của platform marketplace.
- **Hiện trạng**: Booking model có `hasReviewed: boolean` nhưng không có UI submit.
- **DoD**: Modal/page review từ Booking Detail (P0-2) khi `status=COMPLETED && !hasReviewed`. Mapping review về companion profile.

### P2-3. Client `/(client)/me` chỉ là stub
- **Nghiệp vụ**: User cần xem/edit thông tin cá nhân, đổi mật khẩu, quản lý phương thức thanh toán.
- **Hiện trạng**: Chỉ có placeholder text.
- **DoD**: Form edit profile + đổi mật khẩu + danh sách card/wallet.

### P2-4. Companion Detail mapping `recentReviews`
- **Nghiệp vụ**: Page detail hiển thị section review nhưng field chưa map từ service.
- **DoD**: Bổ sung mapping trong `companionService.getCompanionDetail()`.

---

## P3 — Tech debt theo backlog đã có

### P3-1. Phase 2–6 gỡ mock (xem `docs/backlog`)
- **Nghiệp vụ**: Mock data hiện đan vào 11 service qua `isMockMode()`. Tồn tại lâu = nguy cơ leak vào prod, mismatch shape với BE thật.
- **Files cần dọn**:
  - Phase 2: `authService, bookingService, chatService, companionService, notificationService, walletService`
  - Phase 3: `admin{User,Companion,Dispute,Settings,Transaction}Service`
  - Phase 4: `src/app/api/notifications/stream/route.ts` (SSE mock)
  - Phase 6: xóa `src/mocks/`, `public/mockServiceWorker.js`, `NEXT_PUBLIC_MOCK_ENABLED`

### P3-2. Chat mock mutate global state
- **Nghiệp vụ**: `mockMessages[roomId].push()` mutate trong handler — không an toàn concurrent, gây flaky khi dev test parallel.
- **DoD**: Gỡ cùng Phase 2.

### P3-3. Link navigation gãy
- **Hiện trạng**: Một số `href="/dashboard"` không có prefix `/companion` (route group).
- **DoD**: Audit Grep `href="/dashboard"` và sửa thành route đầy đủ.

### P3-4. Admin audit log mock mutable
- **Hiện trạng**: Admin service đọc/ghi trực tiếp fixture in-memory. Reload mất state.
- **DoD**: Gỡ ở Phase 3.

---

## Phụ lục — Bảng tổng hợp page theo luồng

| Luồng | ✅ Có | ⚠️ Chưa ổn | ❌ Thiếu |
|---|---|---|---|
| Auth | logout action | getMe (mock) | login, register, OTP, forgot |
| Onboarding | companion profile, scenarios | client `/me`, recentReviews mapping | — |
| Discovery | explore, detail, photo lightbox | — | — |
| Booking | list `/bookings` | dropdown menu, mock mapping | **detail page, payment, review** |
| Chat | list, detail (client + companion) | mock mutation | — |
| Wallet | (chỉ service) | — | **page, topup, transactions, voucher** |
| Notification | list, mark-read, SSE | SSE mock | — |
| Admin | users, companions, disputes, transactions, settings | fixture-heavy, audit mutable | — |
| Companion dash | home, profile, chat | — | **requests, earnings, schedule, notifications** |

---

## Đề xuất thứ tự thực thi

1. **Sprint 1 (P0)**: error boundaries → BookingCard dropdown → Booking Detail → Payment skeleton.
2. **Sprint 2 (P1)**: Wallet UI → Companion Requests + Earnings + Schedule.
3. **Sprint 3 (P2)**: Auth UI form → Review form → Client `/me`.
4. **Sprint 4 (P3)**: Chạy backlog Phase 2–6 gỡ mock theo thứ tự đã có.
