# CHAT & COMMUNICATION FLOW SPECIFICATION

**Domain:** Interaction & Communication (Tương tác & Trò chuyện)  
**Hệ thống:** Rent-a-Girlfriend Platform (Monorepo `rent-a-gf-fe`)  
**Ứng dụng áp dụng:** `apps/web` (Client-facing App Router) & `apps/admin` (Dashboard CSR)  
**Tài liệu gốc:** [User Flow Document](../user-flow.md)  

---

## 1. Flow Overview
*   **Mô tả:** Hệ thống trò chuyện thời gian thực giữa Client và Companion gắn liền với từng cuộc hẹn cụ thể. Có cơ chế tự động khóa phòng chat theo quy định nghiệp vụ (BR-15).
*   **Business Goal:** Tạo kênh liên lạc an toàn, giữ chân người dùng trong nền tảng, lưu lại lịch sử trao đổi làm bằng chứng đối chiếu khi xảy ra tranh chấp (Dispute).
*   **UX Goal:** Tin nhắn gửi đi tức thì (nhờ Optimistic Update), cuộn tin nhắn mượt mà, hiển thị rõ ràng trạng thái hoạt động của phòng chat.

---

## 2. Entry Points
*   Floating Chat Popup ở góc dưới màn hình (Desktop).
*   Nút "Chat với Companion" trên thẻ chi tiết cuộc hẹn (`/bookings`).
*   Route fullscreen `/messages` (Mobile).
*   Click vào thông báo tin nhắn mới.

---

## 3. Preconditions
*   Cuộc hẹn đã được Companion chấp nhận (`state = ACCEPTED`).
*   Người dùng hiện tại là Client hoặc Companion tham gia trực tiếp vào cuộc hẹn đó.

---

## 4. Main Flow
```text
Click "Open Chat"
→ Open persistent Chat Window (Desktop popup or Mobile route)
→ nếu k có cuộc hẹn với companion này thì show lên là "You don't have any active bookings with this companion." và không hiện ô chat
→ Connect to SSE message stream (BFF EventSource)
→ Fetch message history (TanStack Query, paginated)
→ Type message & press Enter
→ Render message immediately on UI (Optimistic Update - State: sending)
→ Send message via HTTP POST
→ BFF receives, saves to DB, broadcasts via SSE
→ Update message state to "sent" on UI
```

---

## 6. Hidden Flows
*   **Tự động khóa phòng chat sau 24 giờ:** Theo quy tắc `BR-15`, phòng chat tự động khóa sau 24h kể từ khi cuộc hẹn kết thúc (`end_time`), hoặc bị khóa NGAY LẬP TỨC nếu cuộc hẹn bị Hủy (Cancel) hoặc có quyết định Refund từ Admin.
    *   *Xử lý ở FE:* FE liên tục kiểm tra thời gian thực. Khi điều kiện khóa xảy ra (hoặc nhận event khóa qua SSE):
        1. Hộp thoại chat tự động vô hiệu hóa ô nhập tin nhắn.
        2. Thay thế ô nhập tin nhắn bằng một dải thông báo màu xám: "Phòng chat này đã bị khóa theo quy định của hệ thống."
        3. Ẩn tất cả các nút gọi điện hoặc tương tác trực tiếp khác, chỉ cho phép đọc lại lịch sử trò chuyện (Read-only mode).
*   **Stale Chat Room state:** Client đang mở hộp chat, đúng lúc đó Admin xử lý Dispute của cuộc hẹn này với kết quả `REFUND` cho Client. Phòng chat lập tức bị khóa cứng ở backend.
    *   *Xử lý ở FE:* Ngay khi sự kiện `ROOM_LOCKED` được đẩy qua SSE, client lập tức cập nhật trạng thái UI hộp chat thành Read-only mà không yêu cầu người dùng phải đóng và mở lại phòng chat.

---

## 7. Dangerous Flows
*   **Duplicate Websocket/SSE Messages (Trùng lặp tin nhắn hiển thị):** Do cơ chế gửi tin nhắn bằng HTTP POST và nhận tin nhắn bằng SSE stream. Khi Client gửi tin nhắn, FE đã render tin nhắn đó bằng Optimistic Update. Ngay sau đó, SSE stream đẩy chính tin nhắn đó quay ngược lại Client (do broadcast). Nếu không xử lý khéo, tin nhắn sẽ bị hiển thị lặp lại 2 lần trên màn hình.
    *   *Biện pháp bảo vệ:* Mỗi tin nhắn do FE tạo ra bằng Optimistic Update bắt buộc phải sinh kèm một **Client-side Unique ID (clientMsgId)**. Khi BFF lưu vào DB và phát SSE broadcast, tin nhắn đó bắt buộc phải chứa đúng `clientMsgId` này. Khi FE nhận tin nhắn từ SSE stream:
        1. Kiểm tra danh sách tin nhắn hiện tại xem đã có `clientMsgId` tương ứng chưa.
        2. Nếu đã có, chỉ thực hiện cập nhật trạng thái từ "sending" sang "sent" và thay thế ID tạm thời bằng ID chính thức từ DB.
        3. Nếu chưa có (tin nhắn do đối phương gửi), thực hiện chèn tin nhắn mới vào danh sách.
*   **Stale Chat Room khi chuyển mạng di động:** Người dùng đi vào vùng mất sóng (đứt mạng) và có sóng trở lại. SSE stream bị đứt và kết nối lại nhưng tin nhắn trong thời gian mất mạng bị bỏ lỡ.
    *   *Biện pháp bảo vệ:* Khi SSE kết nối lại thành công (`onopen` event), FE lập tức gọi API refetch lịch sử tin nhắn mới nhất từ mốc thời gian của tin nhắn cuối cùng hiện tại trong store để lấp đầy khoảng trống dữ liệu bị mất (Data gap filling), đảm bảo không bỏ sót bất kỳ tin nhắn nào của đối phương.

---

## 8. Recovery Strategy
*   Khi click vào dấu chấm than đỏ (!) của tin nhắn bị lỗi gửi: Thực hiện gọi lại API POST gửi tin nhắn đó với đúng dữ liệu và ID cũ để tránh tạo tin nhắn mới.

---

## 9. Mobile-specific UX
| Feature | Desktop | Mobile |
| :--- | :--- | :--- |
| **Giao diện hộp chat** | Floating Chat Popups nổi ở góc dưới bên phải màn hình. Cho phép mở tối đa 3 tab chat song song. | Chuyển hướng hoàn toàn sang route `/messages`. Hộp chat hiển thị toàn màn hình (Fullscreen route). |
| **Keyboard Handling** | Không ảnh hưởng. | Cực kỳ phức tạp. FE sử dụng CSS `visualViewport` API để tự động co dãn (resize) chiều cao của container hộp chat tương ứng với chiều cao của bàn phím ảo khi nó trượt lên, tránh hiện tượng bàn phím che khuất ô nhập tin nhắn hoặc đẩy toàn bộ trang web lên trên gây vỡ layout. |
| **Gesture** | Không hỗ trợ cử chỉ đặc biệt. | Vuốt từ cạnh trái màn hình sang phải để quay lại danh sách cuộc trò chuyện. |

---

## 10. Performance Notes
*   **Infinite Scroll with Virtualization:** Hộp chat sử dụng cơ chế cuộn ngược vô tận (Infinite scroll). Khi người dùng cuộn lên trên cùng, React Query sẽ tự động gọi API lấy trang tiếp theo của lịch sử tin nhắn. Sử dụng cơ chế virtual list để đảm bảo dù có 10,000 tin nhắn trong phòng chat, trình duyệt vẫn mượt mà không bị giật lag.
