# ADR 0006: TÁCH BIỆT ROUTE CHAT GIỮA CLIENT VÀ COMPANION WORSKPACE

*   **Trạng thái:** Đã duyệt (Approved)
*   **Tác giả:** AI Assistant & Lead Frontend Architect
*   **Ngày:** 2026-06-21

---

## 1. TÓM TẮT DIỄN BIẾN (WHAT HAPPENED)

Trong quá trình đồng bộ hóa phong cách icon (icon style) và cấu trúc các tab trên thanh điều hướng (`GlobalNavBar`), chúng tôi nhận thấy tab "Thu nhập" (`cp-earnings`) trên Dashboard của Companion cần được thay thế bằng tab "Chat" để đáp ứng nhu cầu giao tiếp trực tiếp của Companion với Khách hàng.

Khi thực hiện tích hợp, chúng tôi đứng trước quyết định:
1.  **Dùng chung route `/chat`:** Cả Client và Companion đều trỏ về `/chat` (sử dụng query param hoặc không).
2.  **Tách biệt route (Nhân bản code):** Tạo thêm route `/dashboard/chat` dành riêng cho Companion Workspace.

Sau khi bàn bạc và thảo luận về định hướng phát triển sản phẩm, chúng tôi quyết định chọn **Phương án 2 (Tách biệt route)**. 

---

## 2. QUYẾT ĐỊNH & LÝ DO KIẾN TRÚC (DECISION & RATIONALE)

Chúng tôi quyết định nhân bản trang chat hiện tại sang `/dashboard/chat` và thay đổi liên kết tab Chat của Companion Mode về route này.

### Lý do:
1.  **Định hướng giao diện khác biệt trong tương lai (Future Differentiation):**
    Giao diện chat của Companion (Người đi làm) và Client (Khách hàng) sẽ tiến hóa theo 2 hướng khác nhau:
    - **Companion Chat Layout:** Cần tích hợp các công cụ chuyên dụng như: cài đặt giá thuê theo giờ nhanh, gửi yêu cầu thanh toán (invoice), gửi hợp đồng cam kết dịch vụ trực tiếp vào khung chat, quản lý trạng thái lịch hẹn, ghi chú nhanh về khách hàng.
    - **Client Chat Layout:** Tập trung vào trải nghiệm tương tác tự nhiên, xem thông tin bạn gái, gửi quà tặng (gift), và đánh giá dịch vụ.
    Việc sử dụng chung một component/route sẽ tạo ra rất nhiều cấu trúc điều kiện phức tạp (`if (role === 'COMPANION')`), làm phình to code và khó tùy biến giao diện riêng biệt cho từng đối tượng.
2.  **Trải nghiệm người dùng nhất quán (UX Consistency):**
    Giữ Companion ở lại trong không gian `/dashboard` giúp NavBar giữ vững trạng thái làm việc (Work mode - màu vàng gold đặc trưng), tránh việc bị đổi màu sắc và đổi các tab điều hướng đột ngột khi chuyển trang.
3.  **Tách biệt trách nhiệm (Separation of Concerns):**
    Code của Companion Workspace nằm trọn vẹn trong `(companion)/dashboard`, giúp dễ dàng kiểm soát quyền truy cập, phân quyền (middleware) và tối ưu hóa hiệu năng render riêng.

---

## 3. DANH SÁCH FILE LIÊN QUAN (OUTLINE FILES)

```text
my-app/src/
├── app/
│   ├── (companion)/
│   │   └── dashboard/
│   │       ├── chat/
│   │       │   └── page.tsx        # [NEW] Trang chat riêng biệt của Companion
│   │       ...
│   └── (shared-authenticated)/
│       └── chat/
│           └── page.tsx            # Trang chat của Client
```

---

## 4. HƯỚNG DẪN BẢO TRÌ & NÂNG CẤP (FUTURE MAINTENANCE)

- **Giai đoạn Hiện tại:** Do giao diện chat hiện tại chỉ là mock thô ("Bạn chưa có tin nhắn nào"), việc nhân bản trang chat chỉ dừng lại ở mức tạo page `/dashboard/chat/page.tsx` hiển thị nội dung mock tương ứng của Companion.
- **Giai đoạn Tiếp theo:** Khi tích hợp chat realtime (WebSocket/SSE/Firebase), đội ngũ phát triển cần tách biệt file logic hoặc sử dụng các shared UI components (trong thư mục `shared/components/molecules/chat`) cho các phần dùng chung (như danh sách bong bóng chat, ô nhập tin nhắn) nhưng giữ layout trang chủ và các panel công cụ bên cạnh (Sidebar Tools) hoàn toàn riêng biệt giữa `/chat` (Client) và `/dashboard/chat` (Companion).
