# BOOKING CREATION FLOW SPECIFICATION

**Domain:** Booking (Đặt lịch)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client-facing Next.js App Router)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Khách hàng khởi tạo một yêu cầu đặt lịch Companion theo kịch bản cụ thể, thực hiện đóng băng ví Kano-Coin (Freeze balance) để đảm bảo khả năng thanh toán.
*   **Business Goal:** Bảo vệ giao dịch C2C, tránh tình trạng đặt lịch ảo không thanh toán, đảm bảo tính cam kết.
*   **UX Goal:** Luồng đặt lịch diễn ra trơn tru, không làm mất ngữ cảnh trang cá nhân đang xem, phản hồi tức thời về mặt tài chính.

---

## 2. Entry Points
*   Nút CTA "Book Now" nổi bật tại trang của Companion (`/explore/[companionId]`).
*   Nút đặt lịch nhanh từ danh sách kịch bản yêu thích.

---

## 3. Preconditions
*   Người dùng đã đăng nhập (Authenticated) và có vai trò `client`.
*   Tài khoản Companion ở trạng thái hoạt động (`APPROVED`).

---

## 4. Main Flow
```text
Tới trang Companion
xem các scenario có sẵn
click vào 1 scenario
click "Book Now"
→ Next.js intercepts route, opens `@modal/(.)booking`
→ Select Scenario ( lấy thông tin từ việc xem và chọn ở trên, nhưng vẫn có thể sửa kịch bản nhưng mà giá tiền sẽ có thể thay đổi theo )
→ Select meeting date & time
→ Click "Book now" (nhưng mà chưa trừ tiền)
→ Verify balance (BFF background check)
→ nếu số dư k đủ thì hiển thị banner "Số dư ví không đủ. Vui lòng nạp thêm tiền."
→ Show thông tin chi tiết của đơn hàng, include thời gian địa điểm, scenario, giá tiền 
→ Click "Confirm & Pay"
→ luồng thanh toán
→ Close modal
→ Trigger success Lottie animation
→ Redirect to /bookings (Client Area)
```

---

## 5. UI State Matrix
| State | UI Behavior |
| :--- | :--- |
| **idle** | Form hiển thị các trường nhập liệu trống hoặc điền sẵn scenario. Nút "Confirm & Pay" hiển thị số tiền Kano-Coin sẽ bị khóa. |
| **loading** | Khóa toàn bộ input fields (readonly), nút "Confirm & Pay" chuyển sang trạng thái disabled kèm Spinner và text "Processing Escrow...". |
| **success** | Đóng Modal. Hiển thị màn hình Lottie Animation chúc mừng thành công trong 1.5s trước khi tự động điều hướng sang `/bookings`. |
| **validation_error** | Hiển thị thông điệp lỗi inline dưới từng trường dữ liệu (Ví dụ: "Thời gian đặt lịch phải sau thời điểm hiện tại ít nhất 2 giờ"). Nút submit disabled. |
| **network_error** | Toast báo lỗi: "Mất kết nối mạng. Giao dịch chưa được thực hiện." Khôi phục form về trạng thái cho phép người dùng click submit lại. |
| **timeout** | Nếu API không phản hồi sau 15s, hủy request phía FE, hiển thị thông báo: "Giao dịch đang chờ xử lý từ hệ thống, vui lòng không gửi lại request." |
| **stale_state** | Nếu số dư ví của Client thay đổi ở tab khác trong lúc đang mở modal, hệ thống tự động refetch số dư ngầm và hiển thị cảnh báo nếu không đủ tiền. |

---

## 6. Hidden Flows
*   **User Hard Refresh (F5) khi đang mở Modal:** URL hiện tại là `/explore/[companionId]/booking`. Khi F5, cơ chế Intercepting Route của Next.js không hoạt động. Next.js sẽ render trực tiếp file `app/(marketing)/explore/[companionId]/booking/page.tsx` dưới dạng **Full-page Booking Form**. Dữ liệu form tạm thời trước đó sẽ được khôi phục từ `sessionStorage` để người dùng không phải nhập lại từ đầu.
*   **Thoát Modal đột ngột:** Người dùng click ra ngoài modal hoặc bấm phím `Esc` khi request tạo booking đang được xử lý ở server. 
    *   *Xử lý:* Hệ thống hiển thị một Modal cảnh báo phụ: "Giao dịch đang được xử lý. Việc đóng cửa sổ có thể dẫn đến việc đặt lịch vẫn được tạo. Bạn chắc chắn muốn đóng?". Nếu người dùng đồng ý đóng, khi backend hoàn thành giao dịch thành công và gửi thông báo qua SSE, client sẽ hiển thị Toast thông báo: "Đặt lịch số #XYZ đã được tạo thành công" kèm nút điều hướng đến `/bookings`.

---

## 7. Dangerous Flows
*   **Double Submit (Đặt lịch trùng lặp):** Client click liên tục vào nút đặt lịch do giao diện phản hồi chậm, dẫn đến việc tạo nhiều booking trùng lặp và bị trừ tiền ví nhiều lần.
    *   *Biện pháp bảo vệ:* 
        1. Ngay khi click submit, nút bấm lập tức bị khóa (`disabled = true`) ở mức DOM.
        2. Mỗi lần mở modal đặt lịch, client sinh ra một **UUIDv4 đóng vai trò Idempotency Key** và lưu trong state. Khi submit, key này được đính kèm vào header `X-Idempotency-Key` của API request. Backend sử dụng Redis Lock để đảm bảo chỉ có duy nhất 1 request có key này được xử lý trong vòng 5 phút.
*   **Race Condition biến động số dư ví:** Client đang mở modal đặt lịch có giá 500 coin, ví có đúng 500 coin. Lúc đó ở tab khác, một booking cũ của Client bị hủy muộn dẫn đến bị trừ 100 coin phạt. Lúc này ví thực tế chỉ còn 400 coin nhưng UI modal đặt lịch vẫn hiện 500 coin.
    *   *Biện pháp bảo vệ:* Khi click "Confirm & Pay", BFF thực hiện giao dịch ví bằng một **Database Transaction** nguyên tử (Atomic). Nếu số dư thực tế không đủ, transaction lập tức rollback, API trả về mã lỗi `ERR_INSUFFICIENT_BALANCE`. FE nhận mã này, hiển thị modal gợi ý nạp thêm tiền và unfreeze UI.

---

## 8. Recovery Strategy
*   Nếu request bị timeout ở client nhưng thực tế server đã xử lý thành công (Network drop ở chiều phản hồi): Khi kết nối mạng ổn định trở lại, SSE stream sẽ đẩy trạng thái booking mới về, React Query tự động invalidates cache `['bookings']` và đồng bộ lại UI, loại bỏ rủi ro desync.

---

## 9. Mobile-specific UX
*   **Desktop:** Hiện dạng Centered Modal nổi trên nền Magazine View mờ (backdrop-blur). Nhấp vùng trống để đóng.
*   **Mobile:** Bỏ qua Intercepting Route. Chuyển hướng hoàn toàn sang route full-screen `/explore/[companionId]/booking` để tận dụng toàn bộ không gian màn hình dọc. Nút "Xác nhận & Thanh toán" được ghim cố định ở cạnh dưới màn hình (Sticky Bottom Bar) để dễ dàng thao tác bằng một ngón tay cái.

---

## 10. Performance Notes
*   **Dynamic Importing:** Toàn bộ form đặt lịch phức tạp cùng thư viện Lottie animation được lazy load bằng `next/dynamic` chỉ khi người dùng click nút "Book Now", giúp giảm 45kb dung lượng JS ban đầu tải trang profile.
