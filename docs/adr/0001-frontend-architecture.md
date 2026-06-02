# ADR 0001: KIẾN TRÚC FRONTEND MONOREPO 5 TẦNG, BFF & EVENT-DRIVEN SSE CHAT

*   **Trạng thái:** Đã duyệt (Approved)
*   **Tác giả:** Principal Frontend Architect & Developer
*   **Ngày:** 2026-05-17

---

## 1. BỐI CẢNH (CONTEXT)

Hệ thống Rent-a-Girlfriend có các đặc tính vận hành và nghiệp vụ đa dạng:
1.  Trang ứng dụng khách hàng/companion (`web`) đòi hỏi tối ưu hóa SEO rất cao ở các trang public (Magazine View), sử dụng SSR/ISR làm chủ đạo.
2.  Trang quản trị viên (`admin`) không cần SEO, toàn bộ là CSR (Client-Side Rendering) bảo mật cao sau lớp đăng nhập.
3.  Hệ thống microservices backend yêu cầu bảo mật thông tin định danh (JWT) và hạn chế việc client gọi trực tiếp hàng loạt api nhỏ.
4.  Có luồng Booking Chat real-time thời hạn 24h và thông báo tức thời (Realtime Notifications).

Chúng ta cần chọn một kiến trúc frontend đáp ứng các tiêu chuẩn trên nhưng phải thực dụng, dễ bảo trì cho team 4 người, và tránh overengineering biến MVP thành một hệ thống NASA phức tạp vô ích.

---

## 2. QUYẾT ĐỊNH (DECISION)

Chúng tôi quyết định áp dụng mô hình **Multi-App Monorepo 5 tầng kết hợp BFF và Event-Driven SSE Chat**:

1.  **Multi-App Monorepo:** Tách biệt ứng dụng `apps/web` (Next.js) và `apps/admin` (Next.js/Vite React) ở mức compile-time. Chia sẻ tài nguyên thông qua `packages/ui` (Shared Components + Tailwind preset), `packages/contracts` (Shared Types/DTOs), và `packages/config` (ESLint/Tsconfig).
2.  **Domain-Driven inside App:** Tổ chức thư mục code theo các domain nghiệp vụ (`booking`, `chat`, `wallet`, `companion`) ngay trong mỗi app để cô lập lỗi (Change Propagation). Cấm import chéo trực tiếp giữa các domain.
3.  **Lớp BFF (Backend-For-Frontend):** Sử dụng Next.js Route Handlers đóng vai trò trung gian bảo mật. BFF nhận dạng JWT từ HttpOnly Cookie do BE lưu trữ và đính kèm vào header request trước khi chuyển tiếp lên API Gateway. Browser tuyệt đối không tiếp xúc trực tiếp với raw JWT hay địa chỉ microservices nội bộ.
4.  **Event-Driven SSE Chat & Notifications:** Thay vì dùng WebSockets phức tạp về mặt hạ tầng, chúng tôi sử dụng **SSE (Server-Sent Events)** kết hợp **HTTP POST**. 
    *   Nhận dữ liệu/tin nhắn mới: Qua kết nối SSE stream unidirectional từ BFF.
    *   Gửi tin nhắn: Qua HTTP POST thông thường.
    *   Đồng bộ trạng thái: Các sự kiện SSE kích hoạt cơ chế `queryClient.invalidateQueries` của React Query để refetch dữ liệu tự động, thay vì viết logic merge cache thủ công.
5.  **Tailwind CSS + Design Tokens:** Map trực tiếp các biến CSS variables (định nghĩa Design Tokens ở `packages/ui`) vào config Tailwind dùng chung để đảm bảo theme-ready sẵn sàng cho Dark mode sau này.

---

## 3. CÁC PHƯƠNG ÁN ĐÃ CÂN NHẮC (ALTERNATIVES)

### Phương án A: Single Monolithic Next.js Application
*   *Ưu điểm:* Setup ban đầu siêu nhanh, chỉ có 1 dự án duy nhất.
*   *Nhược điểm:* Phình to code, khó phân tách quyền hạn truy cập của Admin và Client. Lỗi giao diện phía web khách hàng có thể kéo sập dashboard admin và ngược lại. Khó tách biệt tối ưu SEO cho trang public và bảo mật CSR cho admin.

### Phương án B: Runtime Microfrontends (Module Federation / Webpack)
*   *Ưu điểm:* Độc lập tuyệt đối khi deploy ở runtime, các team có thể tự do chọn framework.
*   *Nhược điểm:* **Overengineering cực nặng cho MVP**. Quá phức tạp trong việc duy trì cấu hình Webpack/Vite, mất Type-safety ở runtime, tăng bundle size và làm chậm tốc độ tải trang ban đầu. Không phù hợp với quy mô team 4 người.

---

## 4. HỆ QUẢ & TRADE-OFFS (CONSEQUENCES)

*   **Tích cực (Pros):**
    *   Cô lập lỗi cực tốt: Thay đổi ở `admin` hoặc một domain cụ thể không ảnh hưởng dây chuyền đến các thành phần khác.
    *   Bảo mật tuyệt đối: Triệt tiêu hoàn toàn nguy cơ mất token JWT nhờ cơ chế HttpOnly Cookie + BFF.
    *   Hạ tầng siêu nhẹ: SSE chạy trực tiếp trên HTTP/2, không cần tốn tài nguyên quản lý kết nối WebSocket hai chiều hay sticky sessions trên API Gateway.
    *   Phát triển độc lập: Dễ dàng mock API tại BFF để FE chạy trước khi BE hoàn thiện.
*   **Tiêu cực / Điểm đánh đổi (Cons):**
    *   Độ phức tạp Monorepo: Lập trình viên cần làm quen với việc quản lý packages và chạy lệnh qua npm/pnpm workspaces.
    *   Chat gửi/nhận bất đối xứng: FE phải xử lý việc gửi tin nhắn bằng request POST riêng và nhận tin nhắn qua SSE stream riêng thay vì một kênh kết nối WebSocket duy nhất. Tuy nhiên, React Query và Optimistic Updates sẽ bù đắp hoàn hảo độ trễ này.
