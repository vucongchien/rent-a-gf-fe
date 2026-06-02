# COMPANION UPGRADE & APPROVAL SPECIFICATION

**Domain:** Companion Onboarding & Operations (Đăng ký & Vận hành)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client Area) & `apps/admin` (Dashboard Control)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Luồng tối giản giúp loại bỏ hoàn toàn ma sát (friction) khi đăng nhập lần đầu. Người dùng đăng nhập qua Google OAuth lập tức trở thành **Client** và sử dụng hệ thống bình thường. Khi một Client có nhu cầu kiếm tiền, họ có thể nộp đơn xin nâng cấp tài khoản thành **Companion** thông qua Wizard từng bước (Upload ảnh, Voice Intro, thiết lập kịch bản ban đầu) và chờ Admin duyệt thủ công.
*   **Business Goal:** Tối đa hóa tỷ lệ giữ chân khách hàng (Activation Rate) bằng cách cho phép lướt explore và booking ngay lập tức. Chỉ Companion thực sự cam kết mới cần điền hồ sơ duyệt.
*   **UX Goal:** Loại bỏ màn hình chọn role khi đăng nhập. Hướng dẫn Client nâng cấp thành Companion bằng Wizard rõ ràng, an toàn lưu nháp, phản hồi tiến độ duyệt minh bạch.

---

## 2. Entry Points
*   Client truy cập trang cá nhân `/profile`, click nút "Đăng ký trở thành Companion" (Become a Companion).
*   Chuyển hướng đến đường dẫn `/onboarding/companion/apply`.
*   Trang quản trị phê duyệt của Admin ở `apps/admin/companions/pending`.

---

## 3. Preconditions
*   Người dùng đã đăng nhập thành công qua Google OAuth (Mặc định được gán role `client`).
*   Trạng thái đơn đăng ký hiện tại là `companionApplicationStatus === 'idle'` hoặc `'rejected'`.
*   (Nếu trạng thái là `pending`, người dùng bị khóa ở màn hình chờ duyệt và không thể vào lại trang apply).

---

## 4. Main Flow
```text
Client truy cập /profile
→ Click "Đăng ký làm Companion"
→ Chuyển hướng sang Wizard apply: `/onboarding/companion/apply`
→ Bước 1: Điền thông tin cơ bản (Nickname, Thành phố hoạt động)
→ Bước 2: Upload 1 Ảnh đại diện + tối đa 4 Ảnh album lên CDN
→ Bước 3: Upload Voice Intro (MP3, dài <30s, dung lượng <5MB)
→ Bước 4: Tạo các kịch bản trải nghiệm ban đầu (Tên, Mô tả, Thời lượng, Giá tiền, Địa điểm)
→ Click "Gửi hồ sơ đăng ký"
→ BFF cập nhật companionApplicationStatus thành PENDING
→ Chuyển hướng sang màn hình chờ duyệt: `/onboarding/companion/pending`
→ (Trong suốt thời gian chờ duyệt, người dùng vẫn giữ role 'client', có thể quay lại explore/wallet...)

→ Admin đăng nhập vào apps/admin
→ Xem danh sách hồ sơ đang chờ duyệt (Pending Applications)
→ Xem chi tiết ảnh album, nghe thử Voice Intro, duyệt kịch bản của ứng viên
→ Click "Approve" (Đồng ý) hoặc "Reject" (Từ chối kèm lý do)

→ NẾU ADMIN ĐỒNG Ý (APPROVE):
  → Backend cập nhật role của người dùng thành 'companion' và companionApplicationStatus thành 'approved'
  → Gửi thông báo SSE đến browser
  → Client tự động invalidates auth query, chuyển màn hình sang Dashboard Companion (`/dashboard`)

→ NẾU ADMIN TỪ CHỐI (REJECT):
  → Backend giữ nguyên role 'client' và companionApplicationStatus thành 'rejected' kèm lý do từ chối
  → Gửi thông báo SSE đến browser
  → Mở khóa màn hình, hiển thị thông báo lý do đỏ trên trang `/onboarding/companion/rejected`
  ➔ Cho phép sửa đổi dữ liệu đã điền (lưu trong local state) và nộp lại hồ sơ.
```

---

## 5. Hidden Flows
*   **Admin Từ chối hồ sơ (Reject) kèm lý do:** Admin duyệt thấy ảnh album không rõ mặt hoặc file voice intro không nghe rõ. Admin nhập lý do từ chối cụ thể.
    *   *Xử lý ở FE:* browser nhận sự kiện từ SSE -> Tự động redirect người dùng sang `/onboarding/companion/rejected`. Tại đây hiển thị lý do từ chối dạng banner đỏ và cho phép click "Chỉnh sửa hồ sơ" để quay lại form apply đã được điền sẵn dữ liệu cũ (lấy từ local state/local storage) để sửa và gửi lại, không bắt người dùng nhập lại từ đầu.
*   **Đồng bộ tức thời khi được duyệt (SSE Sync):** Người dùng đang lướt explore với tư cách client thì Admin bấm duyệt hồ sơ của họ.
    *   *Xử lý ở FE:* Trình lắng nghe SSE nhận sự kiện `ONBOARDING_APPROVED` -> Kích hoạt invalidate query `['auth-me']` -> React Query refetch thông tin user mới -> Nhận diện `role === 'companion'` -> Hiện Toast chúc mừng: "Tài khoản của bạn đã được nâng cấp thành Companion thành công!" kèm nút điều hướng đến `/dashboard`.

---

## 6. Dangerous Flows
*   **Upload đứt quãng giữa chừng (Interrupted Upload):** Client đang upload dở các ảnh album thì mất kết nối.
    *   *Biện pháp bảo vệ:* FE upload từng ảnh độc lập, nhận secure URL từ Cloudinary, lưu URL này vào `sessionStorage` ngay lập tức. Khi kết nối lại, FE chỉ upload các ảnh còn thiếu.
*   **Double Submitting hồ sơ nâng cấp:** Client click nút submit dồn dập.
    *   *Biện pháp bảo vệ:* Khóa cứng UI nút submit ngay lần click đầu tiên, tạo **Idempotency Key** UUIDv4 gửi kèm API request để backend/BFF chống tạo bản ghi trùng lặp.

---

## 7. Mobile-specific UX
*   **Desktop:** Wizard hiển thị thanh ngang các bước rõ ràng, danh sách kịch bản hiển thị dạng lưới. Cho phép xem trước ảnh album kích thước lớn.
*   **Mobile:** 
    *   Thanh điều hướng chuyển thành các dấu chấm (Dots indicator).
    *   Kéo thả để sắp xếp ảnh hiển thị.
    *   Nút "Gửi hồ sơ" sticky ở đáy màn hình giúp dễ bấm.
