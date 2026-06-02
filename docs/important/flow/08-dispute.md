# DISPUTE FLOW SPECIFICATION

**Domain:** Operations & Safety (Vận hành & An toàn)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client/Companion Workspace) & `apps/admin` (Dashboard Control)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Quy trình khiếu nại cuộc hẹn từ phía Client hoặc Companion (Ví dụ: Đối phương No-show sau 30 phút, thái độ tệ, lừa đảo). Hệ thống lập tức đóng băng số dư Escrow và chuyển quyền phân định về phía Admin.
*   **Business Goal:** Ngăn chặn việc tự động Payout sai sót khi xảy ra tranh chấp, tăng tính công bằng, triệt tiêu động cơ lừa đảo trên nền tảng.
*   **UX Goal:** Nút khiếu nại (Report) dễ tìm nhưng tránh click nhầm, form điền bằng chứng rõ ràng, cập nhật trạng thái phân định minh bạch.

---

## 2. Entry Points
*   Nút "Report Violation" trên trang chi tiết cuộc hẹn ở trạng thái `ACCEPTED` (`/bookings`).
*   Trang xử lý tranh chấp của Admin `apps/admin/disputes`.

---

## 3. Preconditions
*   Cuộc hẹn đang ở trạng thái `ACCEPTED`.
*   Thời gian hiện tại đã vượt quá `start_time` cộng thêm 30 phút (đối với lỗi No-show) hoặc cuộc hẹn đang diễn ra/đã kết thúc nhưng chưa quá `end_time + 12h` (chưa tự động payout).

---

## 4. Main Flow
```text
Client/Companion clicks "Report Violation"
→ Confirm modal opens to prevent accidental clicks
→ Form opens: Select reason (e.g., No-show, Attitude) & Enter details
→ Submit report request with Evidence details
→ BFF updates Booking State to DISPUTED (Escrow balance frozen)
→ Chat Room is locked immediately (BR-15)
→ Admin receives alert in Admin Dashboard
→ Admin reviews dispute details, chat logs, and evidence
→ Admin makes decision:
  → Choice A: REFUND to Client (Booking State to CANCELLED, Review is HIDDEN)
  → Choice B: PAYOUT to Companion (Booking State to COMPLETED, Review stays VISIBLE)
→ System executes transaction, SSE notifies both parties
```

---

## 5. UI State Matrix
| State | UI Behavior |
| :--- | :--- |
| **idle** | Nút "Report" hiển thị màu đỏ nhạt trong Drawer chi tiết booking. |
| **loading** | Click submit report -> Drawer chi tiết hiển thị Spinner lớn kèm text "Freezing Escrow & Submitting Dispute...". |
| **success** | Thẻ cuộc hẹn đổi tag sang màu đỏ đậm chữ trắng *Disputed*. Vô hiệu hóa nút Chat và các nút Action khác. Hiển thị thông báo: "Khiếu nại của bạn đang được Admin xem xét." |
| **validation_error** | Ô nhập mô tả chi tiết viền đỏ nếu người dùng nhập ít hơn 20 ký tự (Yêu cầu mô tả chi tiết để tránh spam report). |
| **network_error** | Toast báo lỗi kết nối. Giao dịch Escrow vẫn giữ nguyên trạng thái cũ ở server. |
| **timeout** | Nếu API dispute treo > 15s, tự động hủy request, cảnh báo người dùng và gợi ý gọi hỗ trợ khẩn cấp qua hotline. |

---

## 6. Hidden Flows
*   **Ẩn/Hiện Review tự động sau Dispute (BR-08a, BR-08b):** Client đã viết review đánh giá Companion ngay khi hết giờ hẹn (`end_time`). Sau đó, xảy ra Dispute và Admin phân định kết quả.
    *   *Xử lý ở FE:* 
        *   Nếu Admin chọn **REFUND cho Client**: Hệ thống backend tự động chuyển review sang trạng thái `HIDDEN`. Khi khách hàng khác lướt xem profile của Companion đó, review này sẽ lập tức biến mất khỏi public view.
        *   Nếu Admin chọn **PAYOUT cho Companion (Companion không sai)**: Review được giữ nguyên trạng thái `VISIBLE`.
        *   FE Admin hiển thị rõ ràng tác động này trước khi Admin bấm nút quyết định giải quyết Dispute để Admin nắm được thông tin.

---

## 7. Dangerous Flows
*   **Spam Report (Báo cáo ảo liên tục):** Người dùng bấm report liên tục nhằm mục đích đóng băng ví Companion phá hoại.
    *   *Biện pháp bảo vệ:* Một booking chỉ được phép gửi Report duy nhất một lần. Ngay khi request đầu tiên được gửi đi thành công, trạng thái booking chuyển sang `DISPUTED` ở database. Bất kỳ request report trùng lặp nào gửi lên sau sẽ bị server từ chối ngay lập tức. FE vô hiệu hóa hoàn toàn nút "Report" nếu trạng thái booking đã là `DISPUTED`.
*   **Race Condition - Admin giải quyết Dispute đúng lúc Client đang F5:**
    *   *Biện pháp bảo vệ:* Khi Admin đưa ra quyết định giải quyết (Refund hoặc Payout), SSE stream lập tức đẩy sự kiện `DISPUTE_RESOLVED` về cả 2 thiết bị Client và Companion. UI tự động cập nhật số dư ví tức thì và hiển thị popup thông báo kết quả phân định cụ thể từ Admin: "Khiếu nại số #123 đã được giải quyết. Kết quả: [Hoàn tiền 100% về ví của bạn]."

---

## 8. Recovery Strategy
*   Nếu hệ thống xử lý dispute bị lỗi timeout nhưng thực tế Escrow đã bị đóng băng trên DB: SSE event sẽ tự động đồng bộ lại UI của cả Client và Companion về trạng thái `DISPUTED` ngay khi kết nối được thiết lập lại.

---

## 9. Mobile-specific UX
*   **Desktop:** Nút "Report" nằm ở góc phải phía dưới của Drawer chi tiết cuộc hẹn. Form điền report hiển thị dạng Modal nhỏ gọn ở trung tâm màn hình.
*   **Mobile:** Nút "Report" hiển thị màu đỏ lớn ở cuối Bottom Sheet chi tiết. Click vào sẽ trượt mở một Fullscreen Sheet nhập thông tin báo cáo để đảm bảo dễ dàng nhập liệu bằng bàn phím di động.

---

## 10. Performance Notes
*   **Preserve Evidence Integrity:** Khi booking bị chuyển sang trạng thái `DISPUTED`, phòng chat tương ứng được khóa ở chế độ Read-only nhưng FE Admin Dashboard được cấp quyền truy cập đặc biệt (Moderator access) để stream toàn bộ lịch sử tin nhắn của phòng chat đó về màn hình Admin phục vụ công tác thanh tra mà không vi phạm quyền riêng tư của các phòng chat hoạt động bình thường.
