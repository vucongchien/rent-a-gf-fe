This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
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

Dự án áp dụng bộ quét linter tự động để kiểm soát chất lượng thiết kế giao diện, tính đồng bộ của hệ thống Design Tokens và đảm bảo khả năng bảo trì.

### Lệnh chạy kiểm tra
```bash
# Quét kiểm tra toàn bộ mã nguồn UI
pnpm run lint:ui
```

### Các Quy Tắc Bắt Buộc (Lint Rules)

| Quy tắc | Ranh giới & Hành vi (Được làm / Cấm làm) | Cách khắc phục |
| :--- | :--- | :--- |
| **SVG** | **Cấm** sử dụng thẻ `<svg>...</svg>` inline thô trong các file component/page.<br> Chỉ được định nghĩa icon trong [Icons.tsx](file:///e:/LEARN/rent-a-gf-fe/my-app/src/shared/components/atoms/Icons.tsx). | Di chuyển mã SVG thô vào `Icons.tsx` dưới dạng React Component và import sử dụng. |
| **BUTTON** | **Cấm** sử dụng thẻ `<button>` gốc của HTML.<br> Chỉ được sử dụng các Atom Button đã được tối ưu hóa như `Button`, `CloseButton`, `LikeButton`, `VoiceButton`, `FilterChip`. | Thay thế thẻ `<button>` gốc bằng các component Button Atom tương ứng. |
| **COLOR** | **Cấm** hardcode mã màu Hex (ví dụ `#fb6999`, `#121212`) trong các class hoặc CSS inline.<br> *Ngoại lệ:* Cho phép màu đen/trắng tinh (`#000`, `#fff`) trong SVG và các thẻ link anchor URL (`href="#id"`). | Thay thế bằng các class màu sắc dựa trên CSS variables được cấu hình trong theme (ví dụ: `text-brand`, `bg-surface`, `border-border`). |
| **FONT** | **Cấm** sử dụng các class font-family không chuẩn (như `font-[Roboto]`, `font-serif`) và **cấm** viết inline style `fontFamily: '...'`.<br> *Ngoại lệ:* Chỉ cho phép dùng `font-sans`, `font-display`, `font-mono`, `font-inherit` và các class weight/style chuẩn của Tailwind. | Loại bỏ các class font dư thừa (các thẻ `div`, `span`, `p`,... đã tự động kế thừa `font-sans` từ layout gốc). |

*Lưu ý:* Hệ thống CI/CD của dự án sẽ tự động chạy lệnh `pnpm run lint:ui` trước khi thực hiện deploy. Mọi bản build có lỗi lint sẽ bị từ chối tự động.


