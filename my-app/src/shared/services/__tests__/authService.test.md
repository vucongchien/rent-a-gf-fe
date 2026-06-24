# Tài Liệu Kiểm Thử AuthService

Tài liệu này mô tả chi tiết các kịch bản kiểm thử (Test Cases) được viết cho dịch vụ xác thực `authService`.

## Mục Lục Kiểm Thử

- [Kịch Bản 1: Lấy thông tin user hiện tại (getMe) trong Mock Mode](#kịch-bản-1-lấy-thông-tin-user-hiện-tại-getme-trong-mock-mode)
- [Kịch Bản 2: Lấy thông tin user hiện tại (getMe) trong Production Mode](#kịch-bản-2-lấy-thông-tin-user-hiện-tại-getme-trong-production-mode)
- [Cách chạy kiểm thử](#cách-chạy-kiểm-thử)

---

## Chi Tiết Kịch Bản

### Kịch Bản 1: Lấy thông tin user hiện tại (getMe) trong Mock Mode

- **Test Case 1.1: Trả về mock user mặc định khi không có cookie**
  - *Mô tả*: Khi `isMockMode()` trả về `true` và không tồn tại cookie `msw_mock_role`, hàm `getMe()` sẽ trả về mock user mặc định (`CLIENT`).
  - *Kết quả mong đợi*: Nhận về mock user CLIENT, không gọi `setMockUser`.

- **Test Case 1.2: Đồng bộ hóa và trả về mock user tương ứng với cookie msw_mock_role**
  - *Mô tả*: Khi `isMockMode()` trả về `true` và có cookie `msw_mock_role` là `'admin'`, hàm `getMe()` sẽ cập nhật mock user thông qua `setMockUser('admin')` để đồng bộ hóa trạng thái trên server-side.
  - *Kết quả mong đợi*: Gọi `setMockUser('admin')` và nhận về mock user mới.

- **Test Case 1.3: Trích xuất mock role từ request headers (options.req) trong Route Handler**
  - *Mô tả*: Khi chạy trong context API route, `options.req` được truyền vào, `getMe({ req })` tự động bóc tách cookie `msw_mock_role` từ request headers và cập nhật mock user.
  - *Kết quả mong đợi*: Bóc tách thành công và gọi `setMockUser('admin')`.

---

### Kịch Bản 2: Lấy thông tin user hiện tại (getMe) trong Production Mode

- **Test Case 2.1: Gọi API backend /auth/me để lấy thông tin thực tế**
  - *Mô tả*: Khi `isMockMode()` trả về `false`, hàm `getMe()` phải gửi request thực tế tới `/auth/me` của Backend thông qua `serverFetch`.
  - *Kết quả mong đợi*: Gọi `serverFetch('/auth/me', ...)` và trả về kết quả từ backend.

---

## Cách Chạy Kiểm Thử

Để chạy kiểm thử tự động cho `authService`, chạy lệnh sau từ thư mục `my-app`:

```bash
pnpm test src/shared/services/__tests__/authService.test.ts
```

hoặc chạy toàn bộ unit tests:
```bash
pnpm test:run
```
