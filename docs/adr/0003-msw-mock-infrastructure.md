# ADR 0003: MSW Mock Infrastructure

**Status:** ACCEPTED  
**Date:** 2026-05-17  
**Decider:** Antigravity (AI Architect) & Developer  

---

## 1. Context (Bối cảnh)

Để đáp ứng mục tiêu phát triển giao diện Rent-a-Girlfriend Platform một cách độc lập, tách biệt hoàn toàn khỏi sự phụ thuộc vào sự sẵn sàng của Backend (FE-BE decoupling), chúng tôi cần thiết lập một hạ tầng mô phỏng dữ liệu (Mock Infrastructure) mạnh mẽ cho dự án `my-app`.

Yêu cầu đặt ra:
- Mô phỏng chính xác hành vi của BFF API Gateway tại đầu mút `/api/*`.
- Cung cấp dữ liệu thử nghiệm động (stateful mock) để có thể tương tác đầy đủ các luồng nghiệp vụ cốt lõi (Đặt lịch, Hủy lịch, Thay đổi ví, Chuyển quyền User).
- Hạn chế tối đa rủi ro thay đổi mã nguồn FE (no tech debt) khi chuyển dịch sang API thật ở giai đoạn sản xuất.

---

## 2. Decision (Quyết định)

Chúng tôi quyết định lựa chọn **MSW (Mock Service Worker) v2** làm hạ tầng mock chính thức, thay vì các giải pháp thay thế như JSON Server hay Next.js Route Handlers thủ công.

### Chi tiết thiết kế hạ tầng:
1. **Service Worker Interception:** MSW chạy trực tiếp ở tầng Service Worker của trình duyệt, chặn các yêu cầu HTTP thực tế được gửi qua `fetch` và khớp nối với các handler tương ứng.
2. **Stateful In-Memory Fixtures:** Dữ liệu được lưu trữ dạng mutable in-memory state tại `src/mocks/fixtures/data.ts` giúp mô phỏng chính xác các thao tác CRUD (ví dụ: Huỷ lịch -> cập nhật trạng thái -> Client tự động fetch lại trạng thái mới nhất).
3. **Mock Provider Wrapper:** Tích hợp gọn gàng qua component `MockProvider` bọc ở layout gốc, chỉ kích hoạt khi `NEXT_PUBLIC_MOCK_ENABLED=true` trong môi trường phát triển (`.env.local`), đảm bảo không bị bundle vào production build.

---

## 3. Lựa chọn thay thế & Trade-offs (Đánh giá & Đánh đổi)

### Lựa chọn 1: JSON Server
- **Ưu điểm:** Cực kỳ nhanh, có sẵn tính năng CRUD tự động trên file JSON tĩnh.
- **Nhược điểm (Tech Debt cao):** Chạy trên một cổng riêng biệt (ví dụ `:3001`). Khiến client phải thay đổi Base URL liên tục. Không hỗ trợ mô phỏng các trường hợp lỗi nghiệp vụ đặc thù (Dispute status, custom error payload, authentication cookie simulation).

### Lựa chọn 2: MSW v2 (Được chọn)
- **Ưu điểm:**
  - Giữ nguyên toàn bộ cấu trúc URL thực tế của BFF (`/api/*`). Khi kết nối với BE thật, chỉ cần tắt biến môi trường `NEXT_PUBLIC_MOCK_ENABLED`, không cần sửa một dòng code component nào.
  - Hỗ trợ mô phỏng dynamic delay, stateful update, custom error codes (`INSUFFICIENT_BALANCE`, `ROOM_LOCKED`), và kiểm thử tự động (Vitest/Playwright).
- **Nhược điểm:** Cần cài đặt và cấu hình ban đầu phức tạp hơn một chút (msw init script, setup worker handlers).

---

## 4. Boundary (Ranh giới & Quy tắc phát triển)

- **Không hardcode mock data trong Components:** Toàn bộ component chỉ được phép giao tiếp qua hàm `fetch` thông thường tới các đường dẫn chuẩn `/api/*`.
- **Độc lập môi trường:** Thư mục `src/mocks/` là độc lập, tuyệt đối không được import trực tiếp các helper hoặc data của mock vào code chính (ngoại trừ qua interface standard).
- **Duy trì live bindings:** Đối với các biến lưu trữ mock state, luôn khai báo đầy đủ kiểu dữ liệu TypeScript union chuẩn để tránh các lỗi ép kiểu khi chạy dev mode.
