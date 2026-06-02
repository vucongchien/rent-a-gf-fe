# WALLET TOPUP FLOW SPECIFICATION

**Domain:** Wallet & Finance (Ví & Tài chính)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client-facing App Router)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Khách hàng thực hiện nạp tiền vào ví Kano-Coin qua cổng thanh toán VNPay bằng cách quy đổi tiền thật (1 Kano-Coin = 1,000 VNĐ). Xử lý quá trình chuyển hướng và quay lại trang an toàn.
*   **Business Goal:** Tăng nguồn thu cho hệ thống, đảm bảo quy trình nạp tiền an toàn, chính xác và không bị thất thoát giao dịch.
*   **UX Goal:** Luồng nạp tiền nhanh chóng, giảm thiểu tối đa sự hoang mang của người dùng khi phải chuyển hướng sang bên thứ ba (VNPay) rồi quay lại.

---

## 2. Entry Points
*   Trang quản lý ví cá nhân `/wallet`.
*   Banner gợi ý nạp tiền nhanh khi số dư không đủ ở Modal đặt lịch.

---

## 3. Preconditions
*   Client đã đăng nhập và được xác thực tài khoản.
*   Có tài khoản ngân hàng hoặc ví hỗ trợ thanh toán cổng VNPay Sandbox/Live.

---

## 4. Main Flow
```text
Navigate to /wallet
→ Click "Top-up"
→ Select or enter amount (e.g., 500 Kano-Coin = 500,000 VNĐ)
→ Click "Proceed to Payment"
→ BFF generates payment URL, redirects client to VNPay Gateway
→ User performs transaction on VNPay interface
→ VNPay redirects user back to /wallet/topup/return (with signature)
→ FE displays "/wallet/topup/processing" loading page
→ BFF validates signature, awaits IPN webhook from VNPay
→ Transition to "/wallet/topup/return" Success or Failure screen
```

---

## 5. UI State Matrix
| State | UI Behavior |
| :--- | :--- |
| **idle** | Form nạp tiền hiển thị các gói coin gợi ý (100, 200, 500 coin) và ô nhập tùy chỉnh số tiền. Nút submit active. |
| **loading** | Màn hình đen mờ (Overlay loader) xuất hiện khi click submit với text: "Connecting to VNPay secure gateway, please wait...". Ngăn cản mọi click quay lại. |
| **success** | Hiển thị màn hình thành công xanh lá, vẽ biểu đồ số dư mới tăng lên. Hiển thị mã giao dịch VNPay để đối chiếu. |
| **validation_error** | Báo lỗi inline nếu người dùng nhập số tiền nạp nhỏ hơn hạn mức tối thiểu (Tối thiểu 10 coin = 10,000 VNĐ) hoặc vượt quá hạn mức tối đa. |
| **network_error** | Banner đỏ hiển thị thông tin lỗi kết nối khi không thể tạo link thanh toán từ BFF. |
| **timeout** | Nếu kết nối đến VNPay gateway bị nghẽn > 20s, tự động trả về màn hình Wallet và báo lỗi timeout kèm gợi ý thử lại sau. |
| **reconnect_state** | Nếu người dùng quay lại trang web lúc mạng bị đứt, hiển thị màn hình "Đang kiểm tra kết quả giao dịch..." cho đến khi kết nối mạng được khôi phục. |

---

## 6. Hidden Flows
*   **Race Condition giữa Webhook IPN và Page Return:** Khi người dùng thanh toán xong trên VNPay, cổng VNPay sẽ thực hiện đồng thời 2 hành động:
    1. Redirect trình duyệt của Client về `/wallet/topup/return` (Page Return).
    2. Gửi một request HTTP trực tiếp từ server VNPay tới server backend của hệ thống (IPN Webhook).
    *   *Vấn đề:* Rất nhiều trường hợp Page Return diễn ra trước khi IPN Webhook tới (do độ trễ mạng). Lúc này, nếu trang `/wallet/topup/return` gọi API lấy số dư ví ngay lập tức, số dư sẽ chưa được cập nhật khiến khách hàng tưởng giao dịch bị lỗi.
    *   *Giải pháp xử lý ở FE:* Chúng tôi thiết kế một màn hình trung gian `/wallet/topup/processing`. Tại đây, FE hiển thị trạng thái Loading chờ đợi. FE sẽ mở một kết nối **SSE stream lắng nghe event giao dịch** hoặc thực hiện **Short Polling gọi API kiểm tra trạng thái giao dịch cụ thể (`/api/wallet/transactions/[txnId]`) mỗi 2 giây một lần (tối đa 5 lần)**. Chỉ khi nhận được xác nhận giao dịch đã ghi nhận thành công từ DB, FE mới chính thức chuyển hướng sang màn hình `/wallet/topup/return?status=success`.

---

## 7. Dangerous Flows
*   **User nhấn nút Back trên trình duyệt khi đang ở VNPay:** Người dùng đang thanh toán nửa chừng trên VNPay nhưng đổi ý bấm nút back của trình duyệt để quay lại trang web.
    *   *Biện pháp bảo vệ:* Trang `/wallet` của chúng tôi khi chuyển hướng sang VNPay sẽ không mở tab mới mà thay thế tab hiện tại. Khi quay lại bằng nút Back, React state sẽ nhận biết và thực hiện gọi API hủy bỏ giao dịch tạm thời (Clean up pending transaction) ở backend để tránh rác DB.
*   **Trùng lặp callback giao dịch:** Người dùng cố tình F5 liên tục trang `/wallet/topup/return` có chứa các query parameters thanh toán của VNPay nhằm tìm cách nhận coin nhiều lần.
    *   *Biện pháp bảo vệ:* Backend xử lý kiểm tra trạng thái giao dịch đã được xử lý (Processed) trong DB. Nếu giao dịch đã hoàn thành trước đó, trả về trạng thái `ALREADY_PROCESSED`. FE nhận mã này và hiển thị thông báo: "Giao dịch này đã được ghi nhận trước đó" và điều hướng người dùng về trang ví chính, tuyệt đối không cộng thêm tiền.

---

## 8. Recovery Strategy
*   Nếu sau 5 lần polling (10 giây) ở trang `/wallet/topup/processing` vẫn chưa nhận được trạng thái thành công do hệ thống IPN VNPay bị chậm: FE chuyển sang màn hình thành công tạm thời (Pending Success) kèm thông báo: "Thanh toán của bạn đã thành công. Tuy nhiên, hệ thống cần 1-5 phút để cập nhật số dư ví. Vui lòng kiểm tra lại sau ít phút."

---

## 9. Mobile-specific UX
*   **Desktop:** Hiển thị trang nạp tiền dạng layout chia cột rõ ràng, bên trái nhập số tiền, bên phải hiển thị lịch sử các giao dịch nạp tiền gần đây.
*   **Mobile:** Bố cục dạng dòng chảy dọc toàn màn hình. Khi redirect sang VNPay, tự động kích hoạt deeplink mở ứng dụng Ngân hàng (Vietcombank, Techcombank...) hoặc ví điện tử (Momo, VNPay) trên điện thoại của người dùng để quét mã QR thanh toán nhanh thay vì nhập số thẻ thủ công.

---

## 10. Performance Notes
*   **Route Handler Optimization:** BFF xử lý mã hóa và tạo link VNPay sử dụng Next.js Edge Route Handler để đảm bảo tốc độ phản hồi < 50ms từ bất kỳ vị trí địa lý nào của Client.
