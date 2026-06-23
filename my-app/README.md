This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

### Hướng dẫn cấu hình đăng nhập trên Vercel (Demo Mode)

Dự án sử dụng **Mock Service Worker (MSW)** ở client-side để giả lập API backend (bao gồm đăng nhập, đăng xuất, nạp tiền ví coin, đặt lịch...). Để ứng dụng chạy demo đầy đủ chức năng sau khi deploy lên Vercel:

1. **Thêm Biến Môi Trường (Environment Variable)**:
   Trên Vercel Dashboard của dự án, truy cập vào mục **Settings** -> **Environment Variables** và thêm biến sau:
   - **Key**: `NEXT_PUBLIC_MOCK_ENABLED`
   - **Value**: `true`
2. **Deploy**: Tiến hành deploy. Vì file `/public/mockServiceWorker.js` đã có sẵn trong source code, khi người dùng truy cập trang web trên Vercel, service worker sẽ tự động khởi chạy, cho phép bạn bấm nút **Đăng nhập**, nạp coin vào ví và trải nghiệm toàn bộ luồng nghiệp vụ.

---

## Quy tắc Kiểm tra Giao diện UI (UI Linting Rules)

Chi tiết về các quy tắc quét giao diện tự động (SVG, Button, Color, Font) và cách sửa lỗi khi gặp cảnh báo của linter, vui lòng xem tại tài liệu:
👉 **[Quy tắc Kiểm tra Giao diện UI (UI Linting Rules)](./docs/ui-lint.md)**

---

## Cơ chế Đóng Vai (Mock Role Switcher) và Đồng bộ Client - Server

Trong môi trường phát triển (Mock Mode `NEXT_PUBLIC_MOCK_ENABLED=true`), ứng dụng sử dụng MSW (Mock Service Worker) ở client-side để chuyển đổi vai trò (Client, Companion, Admin, Guest).

Do Next.js 16 sử dụng kiến trúc Server Components chạy trực tiếp trên Server (NodeJS) không qua Service Worker của trình duyệt, trạng thái role mock cần được đồng bộ:
- **Client-side**: Khi người dùng chọn vai trò mới, MSW Client lưu giá trị role mock vào `localStorage` và cập nhật cookie `msw_mock_role`.
- **Server-side**: Khi render Server Components (như `AdminLayout`), hệ thống đọc cookie `msw_mock_role` để cập nhật trạng thái `currentMockUser` trên server tương ứng, đảm bảo kiểm tra quyền (`user.role === 'ADMIN'`) hoạt động nhất quán, tránh các lỗi redirect không mong muốn.
 
---

## Trang Đăng nhập Việt hóa & Thiết kế Thân thiện

Trang đăng nhập (`/login`) đã được tinh chỉnh thiết kế và Việt hóa toàn bộ nội dung nhằm nâng cao trải nghiệm người dùng:
- **Nhận diện thương hiệu**: Tích hợp Logo văn bản `RentGF 💖` với font chữ display `Cherry Bomb One` phong cách anime lãng mạn.
- **Ngôn ngữ**: Việt hóa 100% nội dung cùng nút đăng nhập OAuth Google (`Tiếp tục với Google`), sử dụng các câu từ ấm áp, lịch thiệp.
- **Lưu ý rõ ràng**: Loại bỏ các lưu ý mẫu của doanh nghiệp, thay vào đó là các cam kết bảo mật thông tin và hướng dẫn sử dụng chế độ Giả lập (Mock Mode) chi tiết để người dùng dễ dàng làm quen.


