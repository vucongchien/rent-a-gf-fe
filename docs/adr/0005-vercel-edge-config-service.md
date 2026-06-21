# ADR 0005: DỊCH VỤ CẤU HÌNH HỆ THỐNG TRỪU TƯỢNG (CONFIGSERVICE) QUA VERCEL EDGE CONFIG

*   **Trạng thái:** Đã duyệt (Approved)
*   **Tác giả:** Staff Engineer chuyên về Web Platform & Mobile Architecture
*   **Ngày:** 2026-06-21

---

## 1. TÓM TẮT DIỄN BIẾN (WHAT HAPPENED)

Để chuẩn bị đưa dự án lên production trên Vercel một cách chuyên nghiệp, chúng tôi đã thực hiện hai cải tiến kiến trúc chính:
1.  **PWA Chuẩn Production:** Thay thế các mock in-memory subscriptions bằng một adapter hỗ trợ kết nối trực tiếp với **Vercel KV REST API** thông qua `fetch` gốc. Điều này đảm bảo khi deploy lên Vercel Serverless, dữ liệu đăng ký Web Push của thiết bị di động không bị xóa sạch sau khi container cold start.
2.  **Edge Config Integration:** Thiết kế một dịch vụ cấu hình tập trung **ConfigService** sử dụng **Vercel Edge Config** để đọc cấu hình ứng dụng (như Feature Flags, Bật/Tắt Chat, Chế độ bảo trì) siêu nhanh ở Edge (độ trễ <10ms).
3.  **Thiết kế Trừu tượng (Abstraction):** Lớp ConfigService được thiết kế qua mô hình Factory/Strategy. Code chính của ứng dụng chỉ gọi thông qua giao diện chung `ConfigService.get()` và `ConfigService.set()`, hoàn toàn không biết và không phụ thuộc vào SDK của Vercel, giúp dễ dàng thay thế hoặc cắm thêm các database backend khác (như Redis, PostgreSQL) trong tương lai chỉ bằng cách thay đổi biến môi trường `CONFIG_BACKEND`.

---

## 2. DƠI SÁCH FILE LIÊN QUAN (OUTLINE FILES)

Toàn bộ dịch vụ cấu hình được thu gọn lại trong một tệp duy nhất để dễ dàng bảo trì:

```text
my-app/src/
├── shared/
│   └── services/
│       └── configService.ts          # Tệp duy nhất chứa logic đọc/ghi Edge Config và In-Memory fallback
├── app/
│   ├── config-actions.ts             # Server Actions ('use server') bọc ngoài ConfigService
│   └── config-test/
│       └── page.tsx                  # Giao diện UI kiểm thử đọc/ghi Config trực quan
```

---

## 3. CƠ CHẾ HOẠT ĐỘNG (HOW IT WORKS)

### Luồng Đọc Giao Diện (Read Flow):
1.  Client Component gọi Server Action `getAppConfig(key)`.
2.  Server Action gọi `ConfigService.get(key)`.
3.  `ConfigService` kiểm tra biến môi trường `CONFIG_BACKEND`.
4.  Nếu là `'edge-config'`, nó gọi trực tiếp hàm `get` từ SDK `@vercel/edge-config` để lấy dữ liệu siêu nhanh từ Edge Network. Nếu không, nó đọc trực tiếp từ cache in-memory cục bộ (`localCache`).

### Luồng Ghi Giao Diện (Write Flow):
1.  Client Component gọi Server Action `setAppConfig(key, value)`.
2.  Server Action gọi `ConfigService.set(key, value)`.
3.  Nếu `CONFIG_BACKEND` là `'edge-config'`, `ConfigService` gửi yêu cầu HTTP PATCH chứa dữ liệu đến REST API của Vercel (`https://api.vercel.com/v1/edge-config/${configId}/items`) được xác thực bằng `VERCEL_ACCESS_TOKEN`. Nếu không, nó ghi thẳng vào cache in-memory.

---

## 4. CÁC EDGE CASES QUAN TRỌNG & BIỆN PHÁP XỬ LÝ (EDGE CASES)

Khi vận hành thực tế ở môi trường Production, chúng ta bắt buộc phải lưu ý 4 edge cases kỹ thuật sau:

### Edge Case 1: Write-to-Read Sync Latency (Độ trễ đồng bộ dữ liệu)
*   **Hiện tượng:** Vercel Edge Config tối ưu hóa tuyệt đối cho việc đọc nhưng quá trình đồng bộ hóa ghi (PATCH items) ra hàng trăm server Edge toàn cầu mất khoảng **vài giây**. Nếu bạn vừa gọi `set(key, value)` và lập tức gọi `get(key)` ngay sau đó trên client, bạn sẽ nhận được **giá trị cũ** (Stale data).
*   **Biện pháp:** Không thiết kế luồng nghiệp vụ yêu cầu tính nhất quán tức thì (Strong Consistency) sau khi ghi. Tránh gọi refresh/reload UI ngay lập tức khi nút set vừa hoàn tất hoặc dùng Optimistic UI ở Client để che giấu độ trễ này.

### Edge Case 2: Vercel API Write Rate Limits (Giới hạn tần suất ghi)
*   **Hiện tượng:** Vercel áp dụng rate limit rất nghiêm ngặt cho API ghi Edge Config (ví dụ: vài chục lượt ghi mỗi phút tùy tài khoản). Nếu gọi hàm `set()` quá nhiều hoặc liên tục, Vercel sẽ trả về lỗi `429 Too Many Requests`.
*   **Biện pháp:** **Tuyệt đối không dùng Edge Config làm Database ghi dữ liệu runtime thông thường** (như lưu lượt xem, lưu tin nhắn chat, đếm số lượt booking). Chỉ sử dụng Edge Config cho các tham số cấu hình tĩnh, ít thay đổi của quản trị viên (Feature Flags, Maintenance Mode toggles).

### Edge Case 3: Cold Start & Memory Eviction trên Serverless
*   **Hiện tượng:** Ở chế độ `in-memory`, dữ liệu được lưu trữ trong RAM của serverless container. Khi ứng dụng rảnh (idle), Vercel sẽ hủy container này để giải phóng tài nguyên. Khi có request mới, container khởi động lại (Cold Start) và toàn bộ giá trị trong `InMemoryConfigBackend` sẽ bị reset về giá trị mặc định ban đầu.
*   **Biện pháp:** Sử dụng `in-memory` backend thuần túy cho mục đích kiểm thử và phát triển local. Khi chạy production bắt buộc phải sử dụng `edge-config` hoặc cấu hình một Database thật.

### Edge Case 4: Lỗi Phân Tích Edge Config ID Tự Động
*   **Hiện tượng:** Hàm regex tự động bóc tách ID từ biến môi trường `EDGE_CONFIG` (do Vercel tự inject) có thể bị lỗi nếu Vercel thay đổi định dạng URL kết nối của họ trong tương lai.
*   **Biện pháp:** Code đã được thiết kế sẵn cơ chế fallback. Nếu regex lỗi, hệ thống sẽ đọc trực tiếp từ biến môi trường `EDGE_CONFIG_ID`. Hãy cấu hình tường minh biến này trên Vercel Dashboard nếu gặp lỗi.

---

## 5. BƯỚC CẦN LÀM TIẾP THEO (NEXT STEPS)

1.  **Test Giao Diện Cục Bộ:** 
    *   Mở trình duyệt truy cập đường dẫn `/config-test` trên dev server local.
    *   Thử thay đổi giá trị `greeting` để xác nhận chế độ `in-memory` hoạt động đúng.
2.  **Cấu Hình Edge Config Trên Vercel:**
    *   Tạo 1 Edge Config Store trên Vercel.
    *   Tạo 1 Vercel Access Token.
    *   Thêm các biến môi trường `CONFIG_BACKEND=edge-config` và `VERCEL_ACCESS_TOKEN` vào Settings dự án trên Vercel để kích hoạt chế độ Edge Config.
3.  **Tích Hợp Feature Flags:**
    *   Thay thế các đoạn code kiểm tra tính năng cứng (ví dụ: `if (features.chatEnabled)`) bằng lệnh gọi qua `ConfigService.get('features')` để quản lý bật/tắt tính năng từ xa mà không cần redeploy app.
