# Tài liệu kiểm thử Trang Khám phá (Explore Page Testing)

Tài liệu này mô tả chi tiết cấu trúc, mục tiêu và cách chạy các bộ test liên quan đến chức năng Khám phá (Explore) của ứng dụng Rent-a-Girlfriend.

---

## 1. Mục tiêu kiểm thử

-   **ExplorePage Integration**: Đảm bảo sự gắn kết đúng đắn giữa các component Organisms (`SiteHeader`, `HeroSection`), Molecules (`FilterBar`), và Atoms (`CompanionCard`) khi tích hợp trên trang `/explore`.
-   **API Integration**: Đảm bảo trang gọi API backend thật thông qua Route Handler / BFF và xử lý dữ liệu trả về một cách chính xác.
-   **Địa bàn hoạt động & Lọc dữ liệu**: Xác minh khi chuyển đổi bộ lọc thành phố, danh sách hiển thị cập nhật chính xác theo query parameter của URL mà không gây giật lag.
-   **Cơ chế Phân trang bằng Cursor**: Kiểm thử nút "Tải thêm" (Load More) tương tác đúng với cursor pagination, tải trang tiếp theo lên UI một cách mượt mà.

---

## 2. Các File Kiểm thử liên quan

| Tên File | Chức năng kiểm thử | Các trường hợp kiểm thử (Cases) |
| --- | --- | --- |
| [page.test.tsx](file:///e:/LEARN/rent-a-gf-fe/my-app/src/app/(marketing)/explore/page.test.tsx) | Kiểm thử tích hợp tích hợp trang explore | 1. Tải danh sách companion mặc định (limit 6) lên UI khi mounted.<br>2. Lọc danh sách đúng đắn khi click các chip lọc thành phố (ví dụ: click TP.HCM chỉ hiển thị bạn đồng hành ở HCM).<br>3. Tải thêm dữ liệu trang sau khi nhấn nút "Tải thêm bạn đồng hành" qua cơ chế cursor pagination. |
| [CompanionCard.test.tsx](file:///e:/LEARN/rent-a-gf-fe/my-app/src/shared/components/molecules/CompanionCard.test.tsx) | Kiểm thử độc lập thẻ bạn đồng hành | 1. Hiển thị đúng các thuộc tính (tên, avatar, viền ảnh, giá, và metadata rõ nghĩa).<br>2. Kích hoạt đúng callback khi bấm "Meet me" hay "Like". |

---

## 3. Cách chạy kiểm thử

Để chạy kiểm thử cho trang Explore và các component liên quan, thực hiện các lệnh sau tại terminal:

```bash
# Di chuyển vào thư mục dự án
cd my-app

# Chạy tất cả test suites
npx vitest run

# Chạy test suites trong chế độ xem thay đổi (watch mode)
npx vitest
```
