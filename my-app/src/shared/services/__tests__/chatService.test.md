# Tài Liệu Kiểm Thử ChatService

Tài liệu này mô tả chi tiết các kịch bản kiểm thử (Test Cases) được viết cho dịch vụ chat `chatService`.

## Mục Lục Kiểm Thử

- [Kịch Bản 1: Lấy danh sách phòng chat (getChatRooms)](#kịch-bản-1-lấy-danh-sách-phòng-chat-getchatrooms)
  - [Vai trò CLIENT](#vai-trò-client)
  - [Vai trò COMPANION](#vai-trò-companion)
- [Kịch Bản 2: Lấy tin nhắn (getChatMessages)](#kịch-bản-2-lấy-tin-nhắn-getchatmessages)
- [Kịch Bản 3: Gửi tin nhắn (sendChatMessage)](#kịch-bản-3-gửi-tin-nhắn-sendchatmessage)
- [Cách chạy kiểm thử](#cách-chạy-kiểm-thử)

---

## Chi Tiết Kịch Bản

### Kịch Bản 1: Lấy danh sách phòng chat (getChatRooms)

Hàm `getChatRooms` sẽ lấy danh sách các phòng chat từ endpoint `/interaction/rooms` của Backend, sau đó tự động truy vấn thêm thông tin profile của đối tác chat dựa theo vai trò của người gọi.

#### Vai trò CLIENT
Khi người gọi là `CLIENT`, đối tác chat là `COMPANION`. Hệ thống sẽ fetch profile từ endpoint `/companions/{companionId}`.

- **Test Case 1.1: Lấy thành công kèm thông tin Companion**
  - *Mô tả*: Gọi `getChatRooms('CLIENT')` trả về danh sách phòng chat được map đúng `companionName` và `companionAvatarUrl` lấy từ companion profile.
  - *Mock*: 
    - `/interaction/rooms` trả về 1 room: `{ roomId: 'room-1', companionId: 'comp-1', clientId: 'client-1' }`.
    - `/companions/comp-1` trả về `{ companionId: 'comp-1', displayName: 'Chizuru Mizuhara', avatarUrl: 'chizuru.png' }`.
  - *Kết quả mong đợi*: Room được chuẩn hóa có `companionName === 'Chizuru Mizuhara'` và `companionAvatarUrl === 'chizuru.png'`.

- **Test Case 1.2: Fallback khi Companion profile bị lỗi**
  - *Mô tả*: Khi API `/companions/{companionId}` bị lỗi (ví dụ 404), hệ thống vẫn trả về phòng chat với tên đối tác là tên fallback dạng `User #xxxxxx`.
  - *Mock*: 
    - `/interaction/rooms` trả về 1 room có `companionId === 'comp-1'`.
    - `/companions/comp-1` ném lỗi 404.
  - *Kết quả mong đợi*: Room được chuẩn hóa có `companionName === 'User #comp-1'` (hoặc 6 ký tự đầu của ID).

#### Vai trò COMPANION
Khi người gọi là `COMPANION`, đối tác chat là `CLIENT`. Hệ thống sẽ fetch profile từ endpoint công khai mới được Backend hỗ trợ `/profiles/{clientId}`.

- **Test Case 1.3: Lấy thành công kèm thông tin Client**
  - *Mô tả*: Gọi `getChatRooms('COMPANION')` trả về danh sách phòng chat được map đúng `companionName` (là tên Client) và `companionAvatarUrl` lấy từ client profile.
  - *Mock*: 
    - `/interaction/rooms` trả về 1 room: `{ roomId: 'room-1', companionId: 'comp-1', clientId: 'client-1' }`.
    - `/profiles/client-1` trả về `{ clientId: 'client-1', displayName: 'Kazuya Kinoshita', avatarUrl: 'kazuya.png' }`.
  - *Kết quả mong đợi*: Room được chuẩn hóa có `companionName === 'Kazuya Kinoshita'` và `companionAvatarUrl === 'kazuya.png'`.

- **Test Case 1.4: Fallback khi Client profile bị lỗi**
  - *Mô tả*: Khi API `/profiles/{clientId}` bị lỗi, hệ thống vẫn trả về phòng chat với tên đối tác là tên fallback dạng `User #xxxxxx`.
  - *Mock*: 
    - `/interaction/rooms` trả về 1 room có `clientId === 'client-1'`.
    - `/profiles/client-1` ném lỗi 404.
  - *Kết quả mong đợi*: Room được chuẩn hóa có `companionName === 'User #client'` (hoặc 6 ký tự đầu của ID).

---

### Kịch Bản 2: Lấy tin nhắn (getChatMessages)

- **Test Case 2.1: Lấy tin nhắn thành công**
  - *Mô tả*: Gọi `getChatMessages('room-1')` trả về danh sách các tin nhắn của phòng chat đó.
  - *Mock*: `/interaction/rooms/room-1/messages` trả về mảng các `ChatMessage`.
  - *Kết quả mong đợi*: Trả về mảng tin nhắn đúng cấu trúc của Backend.

---

### Kịch Bản 3: Gửi tin nhắn (sendChatMessage)

- **Test Case 3.1: Gửi tin nhắn thành công**
  - *Mô tả*: Gọi `sendChatMessage('room-1', { text: 'Hello' })` thực hiện POST tin nhắn lên Backend và trả về tin nhắn mới tạo.
  - *Mock*: POST `/interaction/rooms/room-1/messages` trả về `ChatMessage` được tạo.
  - *Kết quả mong đợi*: Trả về object tin nhắn chứa nội dung `'Hello'`.

---

## Cách Chạy Kiểm Thử

Để chạy kiểm thử tự động cho `chatService`, chạy lệnh sau từ thư mục `my-app`:

```bash
npx vitest run src/shared/services/__tests__/chatService.test.ts
```
