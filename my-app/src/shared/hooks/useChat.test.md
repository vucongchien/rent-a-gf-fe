# Tài Liệu Kiểm Thử useChat Hook

Tài liệu này mô tả chi tiết các kịch bản kiểm thử (Test Cases) được viết cho custom hook `useChat` quản lý logic cuộc hội thoại chat.

---

## 1. Tổng quan & Thiết lập Mock
- **File kiểm thử**: [useChat.test.ts](file:///e:/LEARN/rent-a-gf-fe/my-app/src/shared/hooks/useChat.test.ts)
- **Môi trường**: Vitest + React Testing Library (`renderHook`, `act`, `waitFor`).
- **Mocking**:
  - Mock `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) để kiểm soát `roomId` từ URL query.
  - Mock `useAuth` để lấy thông tin user hiện tại (`CLIENT` hoặc `COMPANION`).
  - Mock `global.fetch` để giả lập API endpoints:
    - `GET /api/interaction/rooms` (lấy danh sách phòng).
    - `GET /api/interaction/rooms/:roomId/messages` (lấy lịch sử tin nhắn).
    - `POST /api/interaction/rooms/:roomId/messages` (gửi tin nhắn mới).

---

## 2. Danh sách Kịch bản kiểm thử (Test Cases)

### Kịch bản 1: Khởi tạo state mặc định và tải phòng chat thành công
- **Mục tiêu**: Đảm bảo hook tự động fetch danh sách phòng chat khi mount và tắt cờ loading.
- **Các bước thực hiện**:
  1. Render hook `useChat('CLIENT')`.
  2. Kiểm tra `isLoadingRooms` ban đầu là `true`.
  3. Đợi cho đến khi `isLoadingRooms` thành `false`.
  4. Xác nhận danh sách `rooms` chứa đúng dữ liệu mock.

### Kịch bản 2: Tải tin nhắn khi chọn một phòng chat hoạt động (active)
- **Mục tiêu**: Đảm bảo khi URL có tham số `roomId` (ví dụ `room-1`), hook tự động fetch danh sách tin nhắn tương ứng.
- **Các bước thực hiện**:
  1. Giả lập `roomId=room-1` trong URL search parameters.
  2. Render hook.
  3. Đợi cho đến khi tin nhắn tải xong.
  4. Kiểm tra tin nhắn và thông tin phòng chat đang chọn khớp với `room-1`.

### Kịch bản 3: Gửi tin nhắn thành công qua Optimistic Update
- **Mục tiêu**: Đảm bảo tin nhắn gửi đi xuất hiện tức thì trên giao diện dưới dạng "đang gửi" trước khi có phản hồi từ server. Sau khi gửi thành công, trạng thái chuyển sang gửi thành công (`isSending = false`, `isError = false`) và cập nhật ID thực tế.
- **Các bước thực hiện**:
  1. Thiết lập phòng chat hoạt động `room-1`.
  2. Mock API POST tin nhắn trả về đối tượng tin nhắn đã lưu.
  3. Gọi hàm `sendMessage('Chào Linh')`.
  4. Kiểm tra danh sách tin nhắn ngay lập tức hiển thị tin nhắn đó với flag `isSending: true`.
  5. Đợi phản hồi API và xác nhận tin nhắn chuyển trạng thái thành công với ID chính thức.

### Kịch bản 4: Gửi tin nhắn thất bại, đánh dấu lỗi và hỗ trợ gửi lại (Retry)
- **Mục tiêu**: Đảm bảo nếu API POST ném lỗi (ví dụ đứt mạng), tin nhắn tạm sẽ dừng gửi và hiển thị cờ báo lỗi (`isError = true`). Khi mạng phục hồi, người dùng có thể nhấp retry để gửi lại tin nhắn đó với nội dung cũ.
- **Các bước thực hiện**:
  1. Thiết lập phòng chat `room-1`.
  2. Mock API POST ném lỗi mạng (`Network error`).
  3. Gọi `sendMessage('Lỗi mạng nha')`.
  4. Chờ và kiểm tra tin nhắn hiển thị lỗi (`isError: true`, `isSending: false`).
  5. Giả lập khôi phục mạng (API POST thành công).
  6. Gọi `retryMessage(tempId)`.
  7. Xác nhận tin nhắn lỗi ban đầu đã được thay thế thành công bằng tin nhắn thực tế từ server.

---

## 3. Hướng dẫn chạy kiểm thử

Để chạy bộ kiểm thử này, mở terminal tại thư mục `my-app` và chạy lệnh:

```bash
pnpm test src/shared/hooks/useChat.test.ts --run
```
