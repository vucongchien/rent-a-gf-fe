# DISCOVERY FLOW SPECIFICATION

**Domain:** Discovery (Tìm kiếm & Khám phá)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client-facing Next.js App Router)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Giúp Client tìm kiếm, lọc Companion theo các tiêu chí (Thành phố, khoảng giá, tên, địa điểm) và trải nghiệm hồ sơ chi tiết (Magazine View) có tích hợp nghe thử Voice Intro (MP3).
*   **Business Goal:** Tăng tỷ lệ chuyển đổi (Conversion Rate) từ lướt xem sang gửi yêu cầu đặt lịch bằng cách giới thiệu profile Companion sinh động, trực quan.
*   **UX Goal:** Tốc độ tải trang nhanh, cuộn mượt mà, chuyển đổi giữa danh sách và chi tiết không bị mất trạng thái lọc trước đó.

---

## 2. Entry Points
*   Trang chủ Marketing (`/`) qua ô tìm kiếm nhanh.
*   Đường dẫn trực tiếp từ URL `/explore` hoặc các link chia sẻ `/explore/[companionId]`.
*   Từ thông báo hệ thống gợi ý Companion.

---

## 3. Preconditions
*   Hệ thống không yêu cầu đăng nhập đối với luồng xem danh sách và xem profile cơ bản (Guest accessible).
*   Chỉ các Companion có trạng thái `APPROVED` bởi Admin mới được lập chỉ mục hiển thị trên `/explore`.

---

## 4. Main Flow
```text
đang ở `/`
→ search / filter ở home page
→ redirect sang `/explore`
→ load kết quả tìm kiếm
→ Click vào một companion
→ redirect sang `/explore/[companionId]`
→ xem được thông tin chi tiết của companion
→ có thể thấy được các scenario có sẵn, thông tin chi tiết và giá

```

---



---

## 6. Hidden Flows
*   **Persistent Audio Playback:** Client đang phát Voice Intro (audio 30s) trên profile Companion A, nhưng chuyển hướng quay lại trang `/explore` hoặc click xem Companion B. Nhằm bảo toàn trải nghiệm nghe liên tục, audio player không bị unmount đột ngột mà được thu nhỏ thành một mini-player nổi ở góc dưới màn hình. Trình phát nhạc chỉ dừng khi chạy hết 30s hoặc người dùng chủ động bấm pause.
*   **Stale Scenario Data:** Companion chỉnh sửa hoặc xóa Scenario ngay khi Client đang mở xem profile. Khi Client bấm "Đặt lịch", API tại BFF sẽ kiểm tra tính hiệu lực và trả về lỗi `SCENARIO_NOT_FOUND`. Giao diện Client sẽ hiển thị Toast báo lỗi: "Kịch bản trải nghiệm này đã thay đổi, trang cá nhân sẽ tự động cập nhật lại" và kích hoạt refetch profile.

---

## 7. Dangerous Flows
*   **Race Condition do Filter nhanh liên tục:** Người dùng liên tục thay đổi checkbox filter hoặc kéo thả thanh trượt khoảng giá cực nhanh khiến hàng loạt request API được gửi đi. Nếu request 2 hoàn thành trước request 3 nhưng request 3 bị trễ mạng và phản hồi sau, giao diện sẽ hiển thị sai dữ liệu của request 2.
    *   *Biện pháp bảo vệ:* Dùng cơ chế **Debouncing (300ms)** cho các thay đổi của thanh cuộn khoảng giá. Đồng thời, React Query tự động sử dụng `AbortController` để hủy bỏ (abort) các request API cũ ngay khi query key (chứa filter state) thay đổi.
*   **Stale Companion Status:** Companion vừa bị Admin khóa (ban) tài khoản lúc Client đang xem profile. 
    *   *Biện pháp bảo vệ:* Khi Client click "Book Now", request đi qua BFF. BFF kiểm tra trực tiếp trạng thái mới nhất trong DB. Nếu Companion không còn `APPROVED`, chặn thanh toán và hủy mở modal đặt lịch.

---

## 8. Recovery Strategy
*   **Lỗi tải dữ liệu Explore:** Nếu API `/explore` bị sập đột ngột, React Query tự động retry tối đa 3 lần với cơ chế tăng dần thời gian chờ (Exponential Backoff). Nếu vẫn lỗi, hiển thị Error Boundary component kèm nút reset filter về mặc định.

---

## 9. Mobile-specific UX
| Feature | Desktop | Mobile |
| :--- | :--- | :--- |
| **Bộ lọc (Filters)** | Sidebar cố định bên trái màn hình. | Ẩn mặc định. Mở bằng nút floating CTA "Bộ lọc" ở dưới màn hình. Bộ lọc chiếm trọn 100% diện tích dạng Bottom Drawer. |
| **Magazine View** | Bố cục hai cột (Cột trái thông tin cá nhân + Voice Intro, Cột phải album ảnh dạng grid + danh sách kịch bản). | Bố cục một cột cuộn dọc. Album ảnh hiển thị dạng **Swipe Carousel** có phân trang (dots indicator). |
| **Trình phát nhạc** | Player dạng ngang nằm cạnh avatar. | Player dạng tròn nổi ở góc dưới, hỗ trợ thao tác vuốt để ẩn. |

---

## 10. Performance Notes
*   **Streaming SSR & Suspense Boundaries:** Trang `/explore` sử dụng Next.js Dynamic Streaming. Khung xương (Layout, Sidebar filter) được render tĩnh từ Server và hiển thị ngay lập tức. Danh sách Cards được bọc trong `<Suspense fallback={<ExploreSkeleton />}>` và stream dần về trình duyệt ngay khi API backend trả dữ liệu.
*   **Image Optimization:** Album ảnh của Companion sử dụng component `next/image` với blur placeholder (lưu mã hash siêu nhẹ từ DB) để hiển thị ảnh mờ trước khi ảnh chất lượng cao từ Cloudinary CDN tải xong.
