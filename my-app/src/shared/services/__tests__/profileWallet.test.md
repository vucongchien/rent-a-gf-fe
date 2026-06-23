# Tài Liệu Kiểm Thử Wallet và Transactions

Tài liệu này mô tả chi tiết các kịch bản kiểm thử (Test Cases) được viết cho dịch vụ ví và giao dịch `walletService`.

## Mục Lục Kiểm Thử

- [Kịch Bản 1: Lấy thông tin ví (getWallet)](#kịch-bản-1-lấy-thông-tin-ví-getwallet)
- [Kịch Bản 2: Lấy lịch sử giao dịch (getTransactions)](#kịch-bản-2-lấy-lịch-sử-giao-dịch-gettransactions)
- [Kịch Bản 3: Khởi tạo nạp tiền (initiateTopup)](#kịch-bản-3-khởi-tạo-nạp-tiền-initiatetopup)
- [Cách chạy kiểm thử](#cách-chạy-kiểm-thử)

---

## Chi Tiết Kịch Bản

### Kịch Bản 1: Lấy thông tin ví (getWallet)

- **Test Case 1.1: Lấy thông tin ví thành công ở Mock Mode**
  - *Mô tả*: Khi `isMockMode()` trả về `true`, `walletService.getWallet()` phải trả về dữ liệu mock của `mockWallet` mà không cần gọi API client.
  - *Kết quả mong đợi*: Nhận về đối tượng chứa `walletId`, `userId`, `availableBalance` và `frozenBalance`.

- **Test Case 1.2: Lấy thông tin ví thành công từ Server API**
  - *Mô tả*: Khi không ở mock mode, hàm thực hiện gửi request GET tới `/finance/wallet`.
  - *Kết quả mong đợi*: API trả về dữ liệu ví thật của người dùng.

---

### Kịch Bản 2: Lấy lịch sử giao dịch (getTransactions)

- **Test Case 2.1: Lấy danh sách giao dịch ở Mock Mode**
  - *Mô tả*: Khi `isMockMode()` trả về `true`, hàm phải trả về danh sách giao dịch mẫu từ ví mock.
  - *Kết quả mong đợi*: Trả về mảng chứa 4 giao dịch (gồm các giao dịch CREDIT/DEBIT, SUCCESS/PENDING).

- **Test Case 2.2: Lấy danh sách giao dịch từ Server API**
  - *Mô tả*: Khi không ở mock mode, hàm thực hiện gửi request GET tới `/finance/transactions`.
  - *Kết quả mong đợi*: Trả về đúng danh sách giao dịch nhận từ API.

---

### Kịch Bản 3: Khởi tạo nạp tiền (initiateTopup)

- **Test Case 3.1: Khởi tạo nạp tiền thành công ở Mock Mode**
  - *Mô tả*: Gọi `walletService.initiateTopup({ amount })` khi ở mock mode.
  - *Kết quả mong đợi*: Trả về `paymentUrl` chứa tham số amount đã truyền.

- **Test Case 3.2: Khởi tạo nạp tiền thành công qua Server API**
  - *Mô tả*: Gọi API POST tới `/finance/topup` kèm body `{ amount }`.
  - *Kết quả mong đợi*: Gửi thành công body và nhận về `paymentUrl` từ VNPAY do API server cung cấp.

---

## Cách Chạy Kiểm Thử

Chạy lệnh sau từ thư mục `my-app` để thực thi suite test:

```bash
pnpm test src/shared/services/__tests__/profileWallet.test.ts
```
