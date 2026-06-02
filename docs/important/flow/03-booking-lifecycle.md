# BOOKING LIFECYCLE FLOW SPECIFICATION

**Domain:** Booking (Đặt lịch)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client-facing App Router) & `apps/admin` (Dashboard CSR)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Quản lý vòng đời trạng thái của cuộc hẹn từ lúc gửi yêu cầu, Companion phê duyệt (Accept/Reject), thực hiện cuộc hẹn, cho đến khi tự động hoàn thành (Complete) hoặc bị khiếu nại (Dispute).
*   **Business Goal:** Tự động hóa vận hành, giảm tải việc quản lý thủ công của Admin, bảo vệ quyền lợi tài chính cho cả Client (hoàn tiền khi Companion hủy lịch) và Companion (nhận bồi thường khi Client hủy sát giờ).
*   **UX Goal:** Hiển thị rõ ràng, trực quan trạng thái hiện tại của cuộc hẹn theo thời gian thực (realtime) mà không cần người dùng reload trang.

---

## 2. Entry Points
*   Trang quản lý danh sách cuộc hẹn của Client (`/bookings`).
*   Trang Dashboard quản lý yêu cầu (`/dashboard/requests`) và lịch hẹn (`/dashboard/schedule`) của Companion.
*   Click vào các Toast thông báo real-time.

---

## 3. Preconditions
*   Booking đã được tạo thành công và đang ở trạng thái `PENDING` (Coin đã bị Freeze).

---

## 4. Main Flow
```text
Companion views Pending Requests
→ Click "Accept"
→ BFF updates State to ACCEPTED (Coin moves to Escrow)
→ SSE triggers, Client's UI updates in real-time
→ Booking Chat Room is activated
→ Meeting occurs
→ If time passes end_time + 12 hours (Buffer time) and NO report:
  → System updates State to COMPLETED
  → Escrow releases coin, payouts to Companion (minus commission)
```

---

## 6. Hidden Flows
*   **Auto-Timeout 12 giờ:** Companion không thực hiện Chấp nhận hay Từ chối một yêu cầu đặt lịch trong vòng 12h kể từ lúc tạo, hoặc trước giờ hẹn 1 tiếng (tùy điều kiện nào đến trước).
    *   *Xử lý ở FE:* Khi hệ thống backend tự động chuyển trạng thái booking sang `REJECTED` và unfreeze ví cho Client, client nhận sự kiện `BOOKING_TIMEOUT` qua SSE stream. Thẻ booking trên màn hình tự động chuyển sang trạng thái "Hết hạn (Rejected)" và số dư ví hiển thị ở góc màn hình tự động tăng lên tương ứng kèm hiệu ứng đổi màu số dư xanh lá (Green pulse).
*   **Hủy lịch muộn (Late Cancellation):** Client thực hiện hủy lịch dưới 24h trước giờ hẹn.
    *   *Xử lý ở FE:* Trước khi thực hiện hủy, FE hiển thị một Modal xác nhận cực kỳ rõ ràng: "CẢNH BÁO: Cuộc hẹn của bạn diễn ra trong vòng chưa đầy 24 giờ nữa. Nếu hủy lịch bây giờ, bạn sẽ bị phạt 100% chi phí đặt lịch (500 Kano-Coin) để bồi thường cho Companion." Client phải click chọn "Tôi đồng ý với quy định phạt" thì nút "Hủy lịch" mới active.

---

## 7. Dangerous Flows
*   **Race Condition - Hủy lịch vs Chấp nhận cùng lúc:** Client đang mở màn hình chuẩn bị bấm Hủy lịch (vì việc bận đột xuất), cùng đúng tích tắc đó Companion bấm Chấp nhận (Accept) trên app của họ.
    *   *Biện pháp bảo vệ:* Server xử lý qua database row lock. Nếu Companion Accept trước dù chỉ 1 phần nghìn giây, request Hủy của Client gửi lên sau sẽ bị server từ chối với mã lỗi `ERR_BOOKING_ALREADY_ACCEPTED`. Lúc này, FE Client nhận mã lỗi, hiển thị Toast: "Yêu cầu hủy lịch thất bại do Companion đã chấp nhận cuộc hẹn trước đó." và tự động chuyển thẻ booking sang trạng thái `ACCEPTED`, đồng thời mở phòng chat để hai bên tự thương lượng.

---

## 9. Mobile-specific UX
*   **Desktop:** Sử dụng mô hình **List + Detail Drawer**. Danh sách cuộc hẹn dạng grid bên trái, click vào một cuộc hẹn sẽ trượt Drawer chi tiết từ bên phải ra. Trải nghiệm không đổi trang.
*   **Mobile:** Toàn bộ danh sách là các thẻ lớn cuộn dọc. Click vào thẻ sẽ kích hoạt mở một **Fullscreen Bottom Sheet** vuốt từ dưới lên. Hỗ trợ cử chỉ kéo xuống (drag down) để đóng nhanh sheet.
