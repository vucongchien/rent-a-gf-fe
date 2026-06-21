# Tài Liệu Kiểm Thử ConfigService

Tài liệu này mô tả chi tiết các kịch bản kiểm thử (Test Cases) được viết cho dịch vụ cấu hình `ConfigService`.

## Mục Lục Kiểm Thử

- [Kịch Bản 1: Đọc tham số cấu hình (get)](#kịch-bản-1-đọc-tham-số-cấu-hình-get)
- [Kịch Bản 2: Ghi tham số cấu hình (set)](#kịch-bản-2-ghi-tham-số-cấu-hình-set)
- [Cách chạy kiểm thử](#cách-chạy-kiểm-thử)

---

## Chi Tiết Kịch Bản

### Kịch Bản 1: Đọc tham số cấu hình (get)

- **Test Case 1.1: Đọc thành công từ Edge Config**
  - *Mô tả*: Khi gọi `ConfigService.get('key')`, hệ thống gọi hàm `get` từ `@vercel/edge-config` và trả về đúng dữ liệu mock.
  - *Mock*: `get` của `@vercel/edge-config` trả về `'mock-value'`.
  - *Kết quả mong đợi*: Nhận về `'mock-value'`.

- **Test Case 1.2: Đọc thất bại do lỗi kết nối**
  - *Mô tả*: Khi thư viện `@vercel/edge-config` ném lỗi (ví dụ lỗi mạng), `ConfigService.get` bắt được ngoại lệ, in log lỗi và trả về `undefined`.
  - *Mock*: `get` ném ra `new Error('Network Error')`.
  - *Kết quả mong đợi*: Nhận về `undefined`.

---

### Kịch Bản 2: Ghi tham số cấu hình (set)

- **Test Case 2.1: Ghi thất bại do thiếu thông tin cấu hình**
  - *Mô tả*: Khi thiếu cả `EDGE_CONFIG_ID` và `VERCEL_ACCESS_TOKEN`, hàm `set` phải dừng sớm, in log lỗi và trả về `false`.
  - *Điều kiện*: `process.env.EDGE_CONFIG_ID` và `process.env.VERCEL_ACCESS_TOKEN` bằng `undefined`.
  - *Kết quả mong đợi*: Hàm trả về `false`.

- **Test Case 2.2: Ghi thành công lên API Vercel**
  - *Mô tả*: Khi đầy đủ token và id, hàm `set` thực hiện gửi request HTTP PATCH tới `https://api.vercel.com/v1/edge-config/...` với đúng headers và body, trả về `true`.
  - *Điều kiện*: Cấu hình đúng env. Mock `fetch` trả về `ok: true`.
  - *Kết quả mong đợi*: Gọi đúng URL, headers, body và hàm trả về `true`.

- **Test Case 2.3: Tự động bóc tách ID từ EDGE_CONFIG Url**
  - *Mô tả*: Trường hợp không cung cấp `EDGE_CONFIG_ID` nhưng có `EDGE_CONFIG` URL, hàm `set` có thể tự động bóc tách ID bằng regex và gửi API PATCH thành công.
  - *Điều kiện*: Chỉ cung cấp `EDGE_CONFIG` dạng URL kết nối của Vercel.
  - *Kết quả mong đợi*: Gọi đúng URL chứa ID đã trích xuất từ URL.

- **Test Case 2.4: Ghi thất bại do API Vercel trả về lỗi**
  - *Mô tả*: Khi Vercel API phản hồi status code không phải 2xx (ví dụ 400 Bad Request), hàm `set` in log lỗi và trả về `false`.
  - *Mock*: `fetch` trả về `ok: false`, `status: 400`.
  - *Kết quả mong đợi*: Hàm trả về `false`.

- **Test Case 2.5: Ghi thất bại do fetch ném lỗi**
  - *Mô tả*: Khi `fetch` ném ra ngoại lệ (ví dụ lỗi mạng, timeout), hàm `set` bắt lỗi, in log lỗi và trả về `false`.
  - *Mock*: `fetch` ném ra `new Error('Network timeout')`.
  - *Kết quả mong đợi*: Hàm trả về `false`.

---

## Cách Chạy Kiểm Thử

Để chạy kiểm thử tự động cho `ConfigService`, chạy lệnh sau từ thư mục `my-app`:

```bash
pnpm test src/shared/services/__tests__/configService.test.ts
```
hoặc chạy toàn bộ unit tests:
```bash
pnpm test:run
```
