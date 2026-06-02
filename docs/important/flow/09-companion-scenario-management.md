# COMPANION SCENARIO MANAGEMENT SPECIFICATION

**Domain:** Companion Workspace (Không gian làm việc Companion)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Companion Dashboard)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Luồng giúp Companion hoàn toàn chủ động tự định nghĩa các kịch bản trải nghiệm (Scenarios) của mình, thiết lập Phí dịch vụ ( Kano-Coin), thời lượng, địa điểm đề xuất và trạng thái hoạt động trực tiếp tại Dashboard cá nhân.
*   **Business Goal:** Khuyến khích Companion tạo ra nhiều gói dịch vụ phong phú, tự định giá tương xứng với công sức, giúp Client có nhiều sự lựa chọn cá nhân hóa.
*   **UX Goal:** Giao diện quản lý danh sách trực quan, thao tác Thêm/Sửa/Xóa diễn ra nhanh gọn, an toàn giao dịch nhờ kiểm soát dữ liệu chặt chẽ từ phía BFF và client.

---

## 2. Entry Points
*   Dashboard của Companion tại `/dashboard`.
*   Truy cập trực tiếp qua menu sidebar/tab bar: `/dashboard/profile/scenarios`.

---

## 3. Preconditions
*   Người dùng đã đăng nhập và được gán role `companion`.
*   Tài khoản Companion đã được duyệt ở trạng thái hoạt động (`APPROVED`).

---

## 4. Main Flow
```text
Truy cập /dashboard/profile/scenarios
→ Xem danh sách kịch bản hiện có (Active/Inactive)
→ A. Thêm kịch bản mới:
  → Click "Thêm kịch bản mới"
  → Nhập Tên kịch bản, Mô tả chi tiết, Thời lượng (phút), Giá tiền (Kano-Coin), Địa điểm đề xuất
  → Chọn dấu tích "Đặt làm kịch bản nổi bật" (Featured) nếu muốn
  → Click "Lưu kịch bản"
  → Client gửi request POST kèm Idempotency Key
  → Cập nhật danh sách, hiển thị Toast thành công

→ B. Chỉnh sửa kịch bản:
  → Click "Chỉnh sửa" trên card kịch bản mong muốn
  → Thay đổi thông tin (Tên, Giá, Mô tả, Địa điểm, Trạng thái Hoạt động/Ẩn)
  → Click "Cập nhật"
  → Client gửi request PUT kèm Idempotency Key
  → Đồng bộ dữ liệu, hiển thị Toast thành công

→ C. Xóa kịch bản:
  → Click "Xóa" trên card kịch bản
  → Confirm Modal hiển thị cảnh báo: "Bạn có chắc chắn muốn xóa kịch bản này? Các đơn đặt lịch cũ đang chạy vẫn giữ nguyên thông tin kịch bản cũ."
  → Click "Xác nhận xóa"
  → Client gửi request DELETE
  → Cập nhật danh sách, hiển thị Toast thành công
```

---

## 5. Hidden Flows
*   **Xử lý kịch bản nổi bật (Featured Scenario):** Card của Companion trên trang khám phá `/explore` hiển thị kịch bản nổi bật. 
    *   *Xử lý ở FE:* Khi Companion thêm kịch bản mới và tích chọn `isFeatured`, hoặc bấm sửa một kịch bản thành `isFeatured`, toàn bộ các kịch bản khác của Companion đó sẽ tự động được gạt bỏ tích `isFeatured = false` trên UI và lưu lại.
    *   *Tự chọn Featured mới:* Nếu Companion xóa hoặc ẩn (isActive = false) kịch bản nổi bật hiện tại, hệ thống BFF sẽ tự động thiết lập kịch bản có giá trị Kano-Coin thấp nhất còn lại làm kịch bản nổi bật để tránh vỡ giao diện card ở trang chủ `/explore`.
*   **Thay đổi thông tin khi có Booking đang chạy:** Companion thay đổi giá hoặc xóa kịch bản trong khi Client đã gửi booking (PENDING / ACCEPTED).
    *   *Xử lý:* Hệ thống backend đã áp dụng cơ chế Snapshotting (Chụp ảnh thông tin kịch bản tại thời điểm đặt). Do đó, FE chỉ cần gửi request cập nhật kịch bản gốc bình thường. Các booking đang hoạt động vẫn hiển thị đúng giá tiền và thông tin cũ từ snapshot, loại bỏ hoàn toàn rủi ro desync ví.

---

## 6. Dangerous Flows
*   **Nhập giá kịch bản bất hợp lệ:** Companion cố tình nhập giá kịch bản là số âm, số quá lớn, hoặc bỏ trống.
    *   *Biện pháp bảo vệ:* Form validate trực tiếp trên client ở các trường nhập liệu:
        *   Tên kịch bản: Tối thiểu 5 ký tự, tối đa 50 ký tự.
        *   Thời lượng: Chỉ cho phép số nguyên dương từ `60` phút đến `480` phút (1h - 8h).
        *   Giá kịch bản: Chỉ cho phép số nguyên dương từ `100` coin đến `10000` coin.
        *   Địa điểm: Không trống, giới hạn tối đa 100 ký tự.
*   **Spam nút Lưu liên tục (Double Submit):** Companion click liên tục vào nút lưu do mạng chậm, gây tạo nhiều kịch bản trùng lặp.
    *   *Biện pháp bảo vệ:* 
        1. Khóa cứng nút "Lưu" (disabled = true) ngay khi click chuột đầu tiên.
        2. Mỗi lần mở form, client sinh ra một **UUIDv4 làm Idempotency Key**. Gửi key này ở header `X-Idempotency-Key` của API request để BFF/Redis khóa trùng lặp.

---

## 7. Mobile-specific UX
*   **Desktop:** Danh sách kịch bản dạng Grid 3 cột. Click Thêm/Sửa sẽ mở Slide-over Drawer từ cạnh phải màn hình để thao tác trực quan.
*   **Mobile:** 
    *   Danh sách kịch bản cuộn dọc 1 cột. Mỗi kịch bản có menu action 3 chấm ở góc để chọn Sửa/Xóa.
    *   Hỗ trợ thao tác vuốt sang trái (Swipe-to-delete/Swipe-to-edit) trên card kịch bản để thao tác cực nhanh bằng một tay.
    *   Form Thêm/Sửa kịch bản hiển thị dưới dạng **Fullscreen Bottom Sheet** vuốt từ dưới lên, giúp tận dụng không gian dọc của màn hình và tránh bị bàn phím ảo che khuất các nút nhập liệu.
