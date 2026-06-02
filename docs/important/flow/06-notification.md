# NOTIFICATION FLOW SPECIFICATION

**Domain:** Interaction & Notification (Tương tác & Thông báo)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client-facing App Router)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Hệ thống thu nhận và hiển thị các thông báo thời gian thực (Booking mới, Chấp nhận/Từ chối, nhắc nhở trước cuộc hẹn, nhắc nhở review) qua kênh truyền SSE stream.
*   **Business Goal:** Tăng tính tương tác của người dùng, thúc đẩy hành động (nhận lịch ngay, viết review nhanh) giúp hệ thống vận hành trơn tru.
*   **UX Goal:** Thông báo xuất hiện tức thời nhưng tinh tế, không làm phiền trải nghiệm hiện tại, click vào điều hướng chính xác ngữ cảnh.

---

## 2. Entry Points
*   Góc phải thanh điều hướng (Header Bell Icon).
*   SSE stream kết nối tự động ngay sau khi đăng nhập thành công.

---

## 3. Preconditions
*   Người dùng đã được xác thực vai trò Client hoặc Companion.

---

## 4. Main Flow
```text
Event occurs on Backend (e.g., Booking Accepted)
→ BFF pushes event "NOTIFICATION_RECEIVED" via SSE
→ Client receives event
→ Sound play (Subtle alert sound)
→ Increase unread badge count (+1) with bounce animation
→ Mount toast notification at top-right (Autohide after 5s)
→ User clicks bell icon
→ Slide-over notifications panel opens (Desktop)
→ Click notification item
→ Mark as read via API
→ Smart redirect to target page (e.g., /bookings)
```

---

## 5. UI State Matrix
| State | UI Behavior |
| :--- | :--- |
| **idle** | Biểu tượng quả chuông hiển thị số lượng thông báo chưa đọc (Badge count). |
| **loading** | Hiển thị spinner nhỏ bên trong panel thông báo khi người dùng click mở ra xem danh sách chi tiết. |
| **success** | Hiển thị danh sách thông báo xếp theo thời gian mới nhất. Các thông báo chưa đọc hiển thị nền xanh nhạt/chấm xanh nổi bật. |
| **network_error** | Thay thế danh sách bằng thông báo: "Không thể tải thông báo. Vui lòng kiểm tra kết nối." |
| **stale_state** | Tự động làm mờ badge count và giảm số lượng khi người dùng click "Đánh dấu tất cả đã đọc" (Optimistic update). |

---

## 6. Hidden Flows
*   **Notification Click điều hướng thông minh:** 
    *   *Xử lý ở FE:* Hệ thống không redirect mù quáng. Dựa vào `notification.type`, FE quyết định hành vi:
        *   `TYPE_NEW_MESSAGE`: Nếu người dùng đang ở sẵn trong phòng chat đó trên desktop, chỉ thực hiện highlight tin nhắn mới, không redirect. Nếu ở trang khác, mở popup chat tương ứng. Trên mobile, redirect thẳng vào `/messages/[roomId]`.
        *   `TYPE_BOOKING_ACCEPTED`: Chuyển hướng sang `/bookings` và tự động trượt mở Drawer chi tiết của đúng booking đó (`?bookingId=XYZ` query parameter).
        *   `TYPE_REVIEW_REMINDER`: Mở trực tiếp Form đánh giá dạng Modal ngay tại màn hình hiện tại của Client để họ điền nhanh.

---

## 7. Dangerous Flows
*   **Duplicated WebSocket/SSE Events (Trùng lặp sự kiện):** Do trục trặc kết nối mạng, server gửi lại một loạt thông báo cũ trong stream khiến client hiển thị lặp lại các Toast cũ hoặc tăng badge count ảo.
    *   *Biện pháp bảo vệ:* Mỗi thông báo gửi từ backend bắt buộc phải có một **UUID duy nhất (notificationId)**. Client duy trì một set `receivedNotificationIds` trong Zustand store. Khi nhận event từ SSE, client check ID. Nếu ID đã tồn tại trong set, lập tức bỏ qua (discard) event đó.
*   **Desync Badge Count:** Người dùng mở ứng dụng trên cả điện thoại và máy tính. Khi họ đọc hết thông báo trên máy tính, badge count trên điện thoại vẫn hiện số lượng cũ gây khó chịu.
    *   *Biện pháp bảo vệ:* Sự kiện đọc thông báo từ máy tính gửi lên server sẽ phát một SSE event `NOTIFICATIONS_READ_SYNC` tới tất cả các thiết bị đang online khác của user đó để đồng bộ giảm badge count về 0 ngay lập tức.

---

## 8. Recovery Strategy
*   Nếu SSE bị đứt kết nối hoàn toàn, client sẽ fall back về cơ chế Polling lấy số lượng thông báo chưa đọc (`/api/notifications/unread-count`) mỗi 60 giây một lần để giữ cho badge count tương đối chính xác.

---

## 9. Mobile-specific UX
*   **Desktop:** Danh sách thông báo hiển thị dạng **Slide-over Panel** trượt từ cạnh phải màn hình ra, chiếm 350px width.
*   **Mobile:** Nhấp quả chuông sẽ điều hướng toàn trang sang `/notifications` fullscreen route. Bố cục danh sách thông báo lớn, dễ chạm bằng ngón tay. Hỗ trợ thao tác vuốt ngang (Swipe to delete) một thông báo.

---

## 10. Performance Notes
*   **Static Layout Preservation:** Bell Icon và Badge count được bọc ngoài bởi Next.js Persistent Layout để đảm bảo không bị render lại (re-render) khi người dùng di chuyển giữa các trang khác nhau, tối ưu CPU.
