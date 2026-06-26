# Hướng Dẫn Kiểm Thử Luồng Đăng Nhập Google OAuth (Trực Tiếp Backend)

Tài liệu này mô tả chi tiết các kịch bản kiểm thử (Test Cases) được viết cho luồng xác thực Google OAuth 2.1 kết hợp trực tiếp giữa BFF và Backend.

## 1. Kịch Bản Kiểm Thử (Test Cases)

### Kịch Bản 1: Khởi tạo luồng OAuth qua BFF `/api/auth/google`
- **File test**: `src/app/api/auth/__tests__/routes.test.ts`
- **Mô tả**:
  - Khi ở **Mock Mode** (Offline), route handler này sẽ tự động sinh mock JWT và redirect thẳng tới callback để set cookie.
  - Khi ở **Real Mode** (Online), route handler này sẽ redirect trình duyệt của người dùng sang endpoint khởi tạo OAuth của Backend Gateway (`/api/v1/auth/google/init`).
- **Kết quả mong đợi**: Chuyển hướng chính xác theo cấu hình môi trường.

### Kịch Bản 2: Callback tiếp nhận token tại BFF `/api/auth/callback`
- **File test**: `src/app/api/auth/__tests__/routes.test.ts`
- **Mô tả**:
  - Trích xuất token từ query parameters. Trả về `400 Bad Request` nếu thiếu token.
  - Ghi token hệ thống vào cookie `access_token` với cấu hình bảo mật: `HttpOnly`, `Secure`, `SameSite=Lax`.
  - Chuyển hướng người dùng về trang chủ `/`.
- **Kết quả mong đợi**: Cookie được set và chuyển hướng về trang chủ thành công.

---

## 2. Hướng dẫn chạy test

Để chạy kiểm thử cho toàn bộ luồng xác thực, chạy lệnh sau trong thư mục `my-app`:

```bash
# Chạy tất cả test của Auth (gồm BFF route handlers và AuthContext)
pnpm test src/app/api/auth/__tests__/routes.test.ts src/shared/contexts/AuthContext.test.tsx
```
