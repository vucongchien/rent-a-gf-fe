# ADR 0002: ĐIỀU HƯỚNG VÀ QUẢN LÝ LUỒNG GIAO DIỆN (ROUTE-DRIVEN UX FLOWS) TRÊN NEXT.JS APP ROUTER

*   **Trạng thái:** Đã duyệt (Approved)
*   **Tác giả:** Principal Frontend Architect & Developer
*   **Ngày:** 2026-05-17

---

## 1. BỐI CẢNH (CONTEXT)

Hệ thống Rent-a-Girlfriend có các luồng giao diện (UX Flows) phức tạp liên quan mật thiết đến ngữ cảnh (context preservation) và sự tiện dụng trên nhiều loại thiết bị (responsive continuity):
1.  **Luồng Đặt Lịch (Booking Creation Flow):** Khách hàng đang ở trang hồ sơ chi tiết (Magazine View) của Companion. Việc chuyển hướng hoàn toàn sang một trang mới làm mất ngữ cảnh cuộn trang, gây đứt gãy trải nghiệm.
2.  **Hệ Thống Chat Realtime (Persistent Chat):** Chat cần hoạt động liên tục, không bị ngắt kết nối hay tắt tab chat khi người dùng điều hướng qua các trang khác (Explore, Wallet, Profile).
3.  **Chi Tiết Booking (Booking Detail):** Cần hiển thị đầy đủ thông tin cuộc hẹn, chat shortcut, form review hoặc nút khiếu nại (report) mà không làm loãng luồng quản lý danh sách booking chính (`/bookings`).

Chúng tôi cần đưa ra quyết định kỹ thuật cụ thể về cách tổ chức Route, Rendering Strategy và responsive patterns trên Next.js App Router nhằm giải quyết triệt để các vấn đề trên.

---

## 2. QUYẾT ĐỊNH (DECISION)

Chúng tôi quyết định áp dụng 4 mô hình điều hướng và quản lý trạng thái giao diện sau:

### Quyết định 1: Tạo Booking bằng URL-driven Modal qua Intercepting & Parallel Routes
*   **Cấu trúc thư mục:**
    ```text
    app/(marketing)/explore/[companionId]/
    ├── page.tsx                             # Magazine View (Dynamic SSR)
    ├── booking/
    │   └── page.tsx                         # Full-page Booking Fallback (CSR)
    ├── @modal/
    │   └── (.)booking/
    │       └── page.tsx                     # Intercepting Route Modal
    └── layout.tsx                           # Layout chứa {children} và {modal}
    ```
*   **Hành vi:**
    *   **Desktop:** Khi nhấp vào "Book Now" trên profile, URL đổi thành `/explore/[companionId]/booking` nhưng Next.js sẽ chặn (intercept) và hiển thị form đặt lịch dưới dạng **Centered Modal** đè lên trên trang Magazine View. Background vẫn giữ nguyên, scroll position không đổi. Nhấn nút back hoặc click ngoài modal sẽ đóng modal và quay lại URL cũ.
    *   **Mobile:** Trên màn hình nhỏ, Centered Modal rất khó thao tác nhập liệu do bàn phím ảo che khuất. Chúng tôi sẽ bỏ qua intercepting modal trên mobile và chuyển hướng (hard navigate) thẳng sang trang `/explore/[companionId]/booking` dưới dạng một trang full-screen độc lập để tối ưu không gian nhập liệu.
    *   **Hard Refresh (F5 / Direct Link):** Nếu người dùng reload trang modal hoặc truy cập trực tiếp qua link chia sẻ, Next.js sẽ bỏ qua `@modal` và render thẳng trang full-page `/explore/[companionId]/booking`. Giao diện trang này được thiết kế tương đương với một form đặt lịch độc lập.

### Quyết định 2: Global Persistent Chat Layout tại Root Layout
*   **Cấu trúc:**
    ```tsx
    // app/layout.tsx (Root Layout)
    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html>
          <body>
            <Providers>
              {children}
              <ChatPopupSystem /> {/* Floating chat tabs ở góc dưới bên phải */}
            </Providers>
          </body>
        </html>
      );
    }
    ```
*   **Hành vi:**
    *   **Desktop:** Hệ thống chat được mount ở Root Layout, tồn tại độc lập với việc thay đổi các route con bên dưới `{children}`. Khi người dùng click chuyển route, kết nối SSE stream nhận tin nhắn và trạng thái các tab chat đang mở hoàn toàn được giữ nguyên không bị hủy (persistent state).
    *   **Mobile Fallback:** Tránh hiển thị floating tabs trên mobile vì conflict gesture và viewport. Next.js Middleware hoặc component sẽ chặn và redirect toàn bộ hành động mở chat trên mobile về route fullscreen `/messages`.

### Quyết định 3: Danh Sách Cuộc Hẹn (/bookings) Sử Dụng Drawer (Desktop) & Fullscreen Bottom Sheet (Mobile)
*   **Cấu trúc:** Sử dụng duy nhất route `/bookings` làm trung tâm quản lý (Single Page Application style bên trong Next.js route) thay vì đẻ ra các route con `/bookings/[bookingId]` để giảm thiểu việc render lại layout và chuyển trang liên tục.
*   **Hành vi:**
    *   **Desktop:** Thiết kế dạng **List + Detail Drawer**. Danh sách cuộc hẹn hiển thị dạng grid/list bên trái. Khi click vào một cuộc hẹn, Drawer chi tiết sẽ trượt ra từ bên phải màn hình (Right Drawer), giữ nguyên vị trí cuộn và danh sách đang tìm kiếm bên trái.
    *   **Mobile:** Khi click vào cuộc hẹn, hệ thống mở một **Fullscreen Bottom Sheet** (vuốt từ dưới lên chiếm 100% chiều cao màn hình) và hỗ trợ cử chỉ vuốt xuống (swipe down) để đóng.

### Quyết định 4: Đồng Bộ Trạng Thái Real-time Qua SSE và Invalidation Strategy
*   **Cơ chế:**
    1. Khi trạng thái Booking thay đổi ở backend (Companion Accept/Reject, Timeout, hoặc Admin Resolve Dispute), hệ thống gửi Event thông báo qua SSE stream.
    2. Client nhận SSE event và dùng React Query `queryClient.invalidateQueries({ queryKey: ['bookings'] })`.
    3. Việc invalidation này kích hoạt refetch ngầm (background refetch) hoàn toàn tự động cho tất cả các components đang hiển thị dữ liệu booking liên quan.
*   **Lợi ích:** Triệt tiêu hoàn toàn loading loops, loại bỏ code merge cache thủ công phức tạp ở client (giảm nguy cơ desync dữ liệu), đảm bảo UI hiển thị dữ liệu mới nhất một cách deterministic.

---

## 3. CÁC PHƯƠNG ÁN ĐÃ CÂN NHẮC (ALTERNATIVES)

### Phương án A: Sử dụng Route con `/bookings/[bookingId]` truyền thống
*   *Nhược điểm:* Mỗi lần xem chi tiết cuộc hẹn, người dùng phải đợi chuyển trang, tải lại toàn bộ danh sách cuộc hẹn (hoặc tốn công cache danh sách). Trên mobile gây cảm giác đứt quãng, giật lag khi chuyển đổi qua lại giữa list và detail.

### Phương án B: Sử dụng WebSockets cho luồng chat và SSE cho notification riêng biệt
*   *Nhược điểm:* Gây phân mảnh hạ tầng và code client. WebSocket đòi hỏi quản lý kết nối hai chiều phức tạp, khó scale trên serverless (Vercel/Next.js) và dễ bị đứt gãy kết nối khi mobile chuyển mạng. SSE chạy trên HTTP/2 hoạt động cực kỳ ổn định và nhẹ nhàng.

---

## 4. HỆ QUẢ & TRADE-OFFS (CONSEQUENCES)

*   **Tích cực (Pros):**
    *   Trải nghiệm người dùng mượt mà giống hệt ứng dụng Single Page App (SPA) cao cấp, không bị đứt gãy ngữ cảnh.
    *   URL-driven UI giúp mọi trạng thái modal đặt lịch đều có thể chia sẻ (shareable) hoặc bookmark lại được.
    *   Đồng bộ dữ liệu real-time cực kỳ nhất quán nhờ cơ chế SSE + React Query Invalidation.
*   **Tiêu cực / Điểm đánh đổi (Cons):**
    *   Độ phức tạp code tăng do phải viết các component kiểm tra viewport (Desktop vs Mobile) để quyết định render Intercepting Modal hay redirect sang full page, render Drawer hay Bottom Sheet.
    *   Quản lý bộ nhớ của Persistent Chat ở Root Layout cần được kiểm soát chặt để tránh tràn bộ nhớ khi client treo tab trong thời gian dài.

