# Tài liệu Kiểm thử Hệ thống Thông báo (Notification & SSE Realtime)

Tài liệu này mô tả chi tiết quy trình kiểm thử tự động, danh sách các test case và hướng dẫn chạy test cho hệ thống thông báo của ứng dụng **Rent-a-Girlfriend**.

---

## 1. Danh sách các file kiểm thử tự động (Unit Tests)

Chúng tôi đã viết 3 file test tự động cho toàn bộ hệ thống thông báo, đảm bảo độ bao phủ (coverage) tốt từ tầng Context cho tới các Component hiển thị:

1. **`NotificationContext.test.tsx`**  
   *Đường dẫn*: [NotificationContext.test.tsx](file:///e:/LEARN/rent-a-gf-fe/my-app/src/shared/contexts/NotificationContext.test.tsx)  
   *Mục tiêu*: Kiểm tra logic kết nối SSE, trigger Toast khi có thông báo mới, đếm và quản lý số lượng chưa đọc (`unreadCount`).
   
2. **`NotificationListClient.test.tsx`**  
   *Đường dẫn*: [NotificationListClient.test.tsx](file:///e:/LEARN/rent-a-gf-fe/my-app/src/app/(shared-authenticated)/notifications/components/NotificationListClient.test.tsx)  
   *Mục tiêu*: Kiểm tra render danh sách, thao tác chuyển đổi Tab lọc phân loại, nút "Đánh dấu tất cả đã đọc" gọi API PATCH, hiển thị trạng thái rỗng (Empty State), và cập nhật thêm item mới khi Custom Event phát ra.

3. **`NotificationItem.test.tsx`**  
   *Đường dẫn*: [NotificationItem.test.tsx](file:///e:/LEARN/rent-a-gf-fe/my-app/src/app/(shared-authenticated)/notifications/components/NotificationItem.test.tsx)  
   *Mục tiêu*: Kiểm tra logic rẽ nhánh hiển thị (Render Avatar đối tác cho Chat/Booking hoặc render Icon màu nước cho Hệ thống), click đọc thông báo gọi Optimistic UI update, gửi request PATCH read và chuyển hướng chính xác đến `actionUrl`.

---

## 2. Chi tiết các Test Case

### 2.1. Test Cases cho `NotificationContext`
- **Case 1**: Khởi tạo context khi user mount trang. Gửi request fetch `/api/notifications` để lấy dữ liệu ban đầu, lọc ra các thông báo chưa đọc (`isRead === false`) và set `unreadCount` chính xác.
- **Case 2**: Hàm `decrementUnreadCount` giảm số lượng chưa đọc đi 1 đơn vị (không giảm quá 0).
- **Case 3**: Hàm `resetUnreadCount` đặt số lượng chưa đọc về 0 khi đánh dấu đã đọc tất cả.

### 2.2. Test Cases cho `NotificationListClient`
- **Case 1**: Render danh sách thông báo mock ban đầu đầy đủ 3 nhóm.
- **Case 2**: Nhấp chọn Tab lọc "Tương tác", danh sách tự động lọc chỉ hiển thị các thông báo thuộc danh mục `INTERACTION` (như tin nhắn chat).
- **Case 3**: Nhấp nút "Đánh dấu tất cả đã đọc" sẽ gọi API `PATCH /api/notifications/read-all` và cập nhật ngay lập tức trạng thái `isRead = true` cho mọi thông báo trên UI.
- **Case 4**: Khi danh sách trống, hiển thị màn hình Empty State tinh tế kèm hình vẽ Sakura màu nước loang và mô tả.
- **Case 5**: Khi có sự kiện `new-notification` được trigger từ SSE, danh sách tự động cập nhật và đưa thông báo mới nhận lên trên cùng.

### 2.3. Test Cases cho `NotificationItem`
- **Case 1**: Render thẻ Avatar đối tác nếu thông báo liên quan đến Booking/Chat và có ảnh đại diện của đối tác.
- **Case 2**: Không render Avatar mà render vòng tròn chứa Icon màu nước vẽ tay tinh tế (như `CoinIcon` hay `SakuraIcon`) đối với thông báo giao dịch tài chính hoặc khuyến mãi hệ thống.
- **Case 3**: Nhấp chuột vào thông báo chưa đọc: gọi lập tức callback cập nhật UI (Optimistic), giảm `unreadCount` ở context, gửi request PATCH đánh dấu đã đọc và chuyển hướng người dùng đến link chi tiết (`router.push`).

---

## 3. Hướng dẫn chạy thử nghiệm tự động

Để thực thi bộ kiểm thử tự động cho hệ thống thông báo, bạn chạy lệnh sau trong terminal tại thư mục root `my-app`:

```bash
# Chạy vitest ở chế độ watch (interactive)
npm run test

# Hoặc chạy kiểm thử một lần duy nhất (CI mode)
npm run test run
```

Hoặc bạn có thể chỉ định chạy riêng các file test thông báo:
```bash
npx vitest src/app/\(shared-authenticated\)/notifications/components/
npx vitest src/shared/contexts/NotificationContext.test.tsx
```
