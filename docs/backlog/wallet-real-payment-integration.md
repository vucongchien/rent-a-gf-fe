# Backlog Plan — Tích hợp cổng thanh toán VNPay thực tế cho Ví (Wallet)

Tài liệu này mô tả chi tiết kế hoạch chuyển đổi từ hệ thống **Wallet Modal Mock (Nạp tiền in-place)** hiện tại sang **Cổng thanh toán thực tế (VNPay)** khi backend chính hoàn thiện, đảm bảo kiến trúc sạch sẽ và giảm thiểu tối đa rủi ro ảnh hưởng lan truyền (Change Propagation).

---

## 1. Kiến trúc hệ thống khi tích hợp VNPay thật

Khi tích hợp thanh toán thực tế, luồng hoạt động sẽ không còn xử lý in-place (tức thì tại Modal) nữa mà sẽ chuyển sang luồng chuyển hướng (Redirect Flow) an toàn:

```
[FE - Wallet Modal]
      ↓ (1. Click Nạp tiền - amount)
[BFF NextJS (Route Handler)]
      ↓ (2. Gọi Backend chính tạo URL VNPay & mã giao dịch txId)
[Backend chính (Laravel/Spring/Node)] ──→ (3. Tạo link thanh toán VNPay)
      ↓ (4. Trả về paymentUrl & txId)
[FE - Client] 
      ↓ (5. Redirect trình duyệt window.location.href = paymentUrl)
[VNPay Payment Gateway] (Người dùng quét mã QR / nhập OTP ngân hàng)
      ↓ (6a. Redirect client về page Return /processing?txId=...)
[FE - /wallet/topup/processing] 
      ↓ (7. Polling status liên tục tới BFF)
[BFF /api/wallet/topup/[txId]/status]
      ↓ (8. Check Backend chính xem IPN Webhook đã ghi nhận thành công chưa)
[FE - /wallet/topup/return] (Hiển thị kết quả Success/Failed/Pending)
```

---

## 2. Các bước triển khai chi tiết (Backlog Tasks)

### Bước 1: Kích hoạt lại các Route trung gian trên Next.js
Tạo code xử lý cho các thư mục route rỗng đã chuẩn bị sẵn cấu trúc:
1. **`src/app/(client)/wallet/topup/processing/page.tsx`**: Trang loading trung gian. Khi VNPay redirect client về, trang này lấy `txId` từ URL và thực hiện Short Polling (gọi API `/api/wallet/topup/[txId]/status` mỗi 2s, tối đa 5 lần) để chờ đợi backend nhận được IPN webhook từ VNPay.
2. **`src/app/(client)/wallet/topup/return/page.tsx`**: Trang hiển thị kết quả cuối cùng (Thành công/Thất bại/Pending xử lý).

### Bước 2: Cập nhật hàm `topup` trong `WalletContext`
Thay thế logic gọi API in-place cũ:
```diff
// TRƯỚC (Mock in-place):
const topup = async (amount: number) => {
  setIsLoading(true);
  const success = await api.topupInitiate(amount); // Trực tiếp cộng tiền local mock
  await fetchWallet(); // Tải lại số dư mới
  setIsLoading(false);
  return success;
};

// SAU (Real Payment):
const topup = async (amount: number) => {
  setIsLoading(true);
  const { paymentUrl, txId } = await api.topupInitiate(amount); // Lấy URL VNPay từ BFF
  if (paymentUrl) {
    // Chuyển hướng người dùng sang VNPay thật
    window.location.href = paymentUrl; 
    return true;
  }
  setIsLoading(false);
  return false;
};
```

### Bước 3: Sửa đổi BFF Route Handlers (hoặc Adapter API)
Thay thế Mock MSW handlers bằng kết nối trực tiếp đến API Backend chính:
- `GET /api/wallet` → Lấy số dư và lịch sử từ database thật.
- `POST /api/wallet/topup/initiate` → BFF thực hiện ký mã hóa đơn hàng VNPay (hashing checksum) và tạo URL VNPay.
- `GET /api/wallet/topup/[txId]/status` → Trả về trạng thái giao dịch thực tế từ Database.

---

## 3. Các kịch bản lỗi & Cách xử lý ở FE (Edge Cases)

1. **Race Condition giữa IPN Webhook và Page Return**:
   - *Rủi ro*: Người dùng thanh toán xong, VNPay redirect trình duyệt về trang kết quả nhanh hơn lúc server VNPay gọi Webhook IPN đến Backend của chúng ta. Nếu check số dư ngay sẽ thấy chưa tăng, làm khách hàng hoang mang.
   - *Xử lý*: Trang `/wallet/topup/processing` chính là giải pháp. Nó hiển thị loading chờ tối đa 10s. Nếu sau 10s check trạng thái giao dịch vẫn là pending, FE điều hướng sang trang Return hiển thị trạng thái "Pending Success" (Thanh toán thành công, số dư sẽ cập nhật trong 1-5 phút) thay vì báo lỗi.

2. **Người dùng nhấn nút Back trên trình duyệt khi đang ở VNPay**:
   - *Rủi ro*: Đang ở cổng thanh toán VNPay nhưng bấm back quay lại, đơn hàng ở trạng thái treo.
   - *Xử lý*: Do ta redirect thay thế tab hiện tại, khi quay lại bằng nút Back, React state ở Header/Modal sẽ nhận biết và gửi API clean up các pending transaction chưa thanh toán để tránh rác DB.

3. **Trùng lặp callback (F5 liên tục trang Return)**:
   - *Rủi ro*: F5 liên tục trang `/wallet/topup/return` có đính kèm các query checksum của VNPay để cố tình nạp tiền nhiều lần.
   - *Xử lý*: Backend kiểm tra trạng thái giao dịch trong DB. Nếu đã được xử lý (`PROCESSED`), backend trả về mã `ALREADY_PROCESSED`. FE nhận mã này và hiển thị thông báo "Giao dịch đã được ghi nhận trước đó", đồng thời vô hiệu hóa việc tăng tiền.

---

## 4. Tại sao việc chuyển đổi này lại dễ dàng?
- **UI không đổi**: Giao diện hiển thị của nút Header, Wallet Modal, và hiệu ứng số chạy tăng dần (`useAnimatedNumber`) hoàn toàn phụ thuộc vào state `balance` nhận được từ Context. Khi số dư ví từ backend thật cập nhật, số dư trên màn hình tự động chạy tăng mượt mà mà không cần sửa bất kỳ dòng CSS/HTML nào của UI.
- **Tính đóng gói cao**: Toàn bộ logic giao dịch được đóng gói 100% trong `WalletContext`. Mọi thay đổi về cách thức nạp tiền (thay cổng VNPay sang Stripe, PayOS hoặc ngân hàng trực tiếp) chỉ cần sửa đổi hàm `topup` trong Context.
