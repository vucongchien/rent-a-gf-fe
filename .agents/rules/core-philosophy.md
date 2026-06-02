---
trigger: always_on
---

- ** Cấm import trực tiếp chéo giữa các domain (ví dụ: Component trong `domains/booking` không được import file từ `domains/wallet`). 
*   Nếu cần chia sẻ logic hoặc component, chúng bắt buộc phải được đẩy lên thư mục `Shared` của App hoặc chuyển hẳn thành package dùng chung ở `packages/ui` hoặc `packages/contracts`.
- ** Luôn update tài liệu **: 