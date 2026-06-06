# Wallet System Tests Documentation

Tài liệu này chứa mục lục và mô tả các kịch bản kiểm thử (Test Scenarios) cho hệ thống Quản lý ví (Wallet Modal) và nạp tiền Kano-Coin của người dùng.

---

## 1. Mục lục kịch bản kiểm thử

| ID | Tên kịch bản | Mô tả kiểm thử | Loại kiểm thử |
|---|---|---|---|
| **TC-01** | Khởi tạo thông tin ví | Kiểm tra hiển thị số dư khả dụng và số dư đóng băng chính xác khi user đăng nhập. | Thủ công |
| **TC-02** | Hiển thị nút ví trên Header | Xác nhận nút ví xuất hiện trên DesktopHeader và MobileHeader khi đã đăng nhập, và biến mất khi đăng xuất. | Thủ công |
| **TC-03** | Đóng/mở Wallet Modal | Xác minh click nút ví trên Header sẽ mở Modal. Bấm ESC hoặc click overlay sẽ đóng Modal. | Thủ công |
| **TC-04** | Form nạp nhanh (Quick Select) | Click chọn các nút nạp nhanh (100, 200, 500, 1000) tự cập nhật input và số tiền VNĐ tương ứng. | Thủ công |
| **TC-05** | Nhập số tiền tùy chọn | Nhập các giá trị coin tự chọn khác nhau, cập nhật chính xác VNĐ tương ứng. | Thủ công |
| **TC-06** | Validation hạn mức tối thiểu | Báo lỗi validation nếu nhập số coin < 100 và disable nút nạp tiền. | Thủ công |
| **TC-07** | Mô phỏng nạp tiền thành công | Click "Nạp tiền" -> Show loading overlay -> API trả về thành công -> Đóng loading -> Số dư ví chạy tăng dần (animation). | Thủ công / UI |
| **TC-08** | Đồng bộ số dư tức thì | Sau khi nạp tiền thành công ở Modal, kiểm tra số dư trên Header cũng đồng bộ cập nhật chạy số mới. | Thủ công / UI |

---

## 2. Chi tiết thực hiện & các bước Verify

### TC-01: Khởi tạo thông tin ví & TC-02: Hiển thị trên Header
*   **Các bước thực hiện**:
    1. Truy cập vào trang `/explore`.
    2. Nếu chưa đăng nhập, nhấp nút "Đăng nhập" trên Header.
    3. Trình duyệt tự động mock đăng nhập user "Minh Khách".
*   **Kết quả mong muốn**:
    - Trên DesktopHeader, bên cạnh avatar hiển thị nút: `💰 1,200 Coin`.
    - Trên MobileHeader, hàng icon có thêm nút: `💰 1,200`.

### TC-03: Đóng/mở Wallet Modal
*   **Các bước thực hiện**:
    1. Click vào số dư `💰 1,200` ở Header.
*   **Kết quả mong muốn**:
    - Wallet Modal xuất hiện với hiệu ứng zoom-in và fade-in mượt mà.
    - Hiển thị số dư khả dụng to rõ ràng: `1,200 Kano-Coin` và số tiền đóng băng `650 Kano-Coin`.
    - Thử nhấn phím `Escape` hoặc nhấp vào nút "Đóng" (X) -> Modal biến mất mượt mà.

### TC-06: Validation hạn mức
*   **Các bước thực hiện**:
    1. Mở Wallet Modal.
    2. Nhập số `80` vào ô nhập Kano-Coin.
*   **Kết quả mong muốn**:
    - Bên dưới input hiện thông báo lỗi chữ đỏ: "Số tiền nạp tối thiểu là 100 Kano-Coin".
    - Nút "Nạp tiền" chuyển sang trạng thái disabled, không thể bấm được.

### TC-07: Mô phỏng nạp tiền thành công & TC-08: Hiệu ứng số chạy tăng dần
*   **Các bước thực hiện**:
    1. Mở Wallet Modal.
    2. Click vào gói nạp nhanh `500` (hoặc nhập `500`).
    3. Kiểm tra số tiền VNĐ hiển thị: `500,000 VNĐ`.
    4. Nhấp nút "Nạp tiền (500,000 VNĐ) →".
*   **Kết quả mong muốn**:
    - Nút nạp tiền hiển thị trạng thái loading quay vòng (Connect secure gateway...) trong khoảng 1.2s.
    - Sau 1.2s, loading kết thúc, xuất hiện popup/banner màu xanh lá báo nạp thành công.
    - Số dư hiển thị trên modal chạy tăng dần liên tục và mượt mà từ `1,200` lên `1,700`.
    - Số dư hiển thị trên Header đồng thời chạy tăng dần lên `1,700` mượt mà.
