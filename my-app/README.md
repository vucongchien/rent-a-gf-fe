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

### Hướng dẫn cấu hình API Backend thật trên Vercel / Production

Dự án sử dụng API Gateway backend thật. Để ứng dụng hoạt động chính xác:

1. **Thêm Biến Môi Trường (Environment Variable)**:
   Trên Vercel Dashboard của dự án, truy cập vào mục **Settings** -> **Environment Variables** và thêm biến sau:
   - **Key**: `API_URL`
   - **Value**: `https://api.moibuocmotduyen.site` (hoặc URL backend tương ứng)
2. **Cấu hình AUTH_COOKIE_NAME (Tùy chọn)**:
   Mặc định, cookie xác thực trên BFF là `access_token`. Bạn có thể thay đổi bằng biến `AUTH_COOKIE_NAME`.

---

## Quy tắc Kiểm tra Giao diện UI (UI Linting Rules)

Chi tiết về các quy tắc quét giao diện tự động (SVG, Button, Color, Font) và cách sửa lỗi khi gặp cảnh báo của linter, vui lòng xem tại tài liệu:
👉 **[Quy tắc Kiểm tra Giao diện UI (UI Linting Rules)](./docs/ui-lint.md)**

---

## Cơ chế Xác thực Client - Server (BFF Pattern)

Ứng dụng sử dụng mô hình BFF (Backend for Frontend):
- **Client-side**: Giao tiếp với BFF thông qua các Route Handlers Next.js (`/api/*`) hoặc Server Actions, sử dụng cookie HttpOnly để bảo vệ JWT session.
- **Server-side (BFF)**: Route Handlers và Server Components chuyển tiếp token từ cookie trình duyệt sang Backend thực tế thông qua helper `serverFetch`, bảo đảm an toàn dữ liệu và tuân thủ nguyên tắc Server First.
 
---

## Trang Đăng nhập Việt hóa & Thiết kế Thân thiện

Trang đăng nhập (`/login`) đã được tinh chỉnh thiết kế và Việt hóa toàn bộ nội dung nhằm nâng cao trải nghiệm người dùng:
- **Nhận diện thương hiệu**: Tích hợp Logo văn bản `RentGF 💖` với font chữ display `Cherry Bomb One` phong cách anime lãng mạn.
- **Ngôn ngữ**: Việt hóa 100% nội dung cùng nút đăng nhập OAuth Google (`Tiếp tục với Google`), sử dụng các câu từ ấm áp, lịch thiệp.
- **Lưu ý rõ ràng**: Loại bỏ các lưu ý mẫu của doanh nghiệp, thay vào đó là các cam kết bảo mật thông tin và hướng dẫn sử dụng chế độ Giả lập (Mock Mode) chi tiết để người dùng dễ dàng làm quen.


