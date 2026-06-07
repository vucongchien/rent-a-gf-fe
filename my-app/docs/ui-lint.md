# Quy tắc Kiểm tra Giao diện UI (UI Linting Rules)

Dự án áp dụng bộ quét linter tự động để kiểm soát chất lượng thiết kế giao diện, tính đồng bộ của hệ thống Design Tokens và đảm bảo khả năng bảo trì.

## Lệnh chạy kiểm tra
```bash
# Quét kiểm tra toàn bộ mã nguồn UI
pnpm run lint:ui
```

## Các Quy Tắc Bắt Buộc (Lint Rules)

| Quy tắc | Ranh giới & Hành vi (Được làm / Cấm làm) | Cách khắc phục |
| :--- | :--- | :--- |
| **SVG** | **Cấm** sử dụng thẻ `<svg>...</svg>` inline thô trong các file component/page.<br> Chỉ được định nghĩa icon trong [Icons.tsx](file:///e:/LEARN/rent-a-gf-fe/my-app/src/shared/components/atoms/Icons.tsx). | Di chuyển mã SVG thô vào `Icons.tsx` dưới dạng React Component và import sử dụng. |
| **BUTTON** | **Cấm** sử dụng thẻ `<button>` gốc của HTML.<br> Chỉ được sử dụng các Atom Button đã được tối ưu hóa như `Button`, `CloseButton`, `LikeButton`, `VoiceButton`, `FilterChip`. | Thay thế thẻ `<button>` gốc bằng các component Button Atom tương ứng. |
| **COLOR** | **Cấm** hardcode mã màu Hex (ví dụ `#fb6999`, `#121212`) trong các class hoặc CSS inline.<br> *Ngoại lệ:* Cho phép màu đen/trắng tinh (`#000`, `#fff`) trong SVG và các thẻ link anchor URL (`href="#id"`). | Thay thế bằng các class màu sắc dựa trên CSS variables được cấu hình trong theme (ví dụ: `text-brand`, `bg-surface`, `border-border`). |
| **FONT** | **Cấm** sử dụng các class font-family không chuẩn (như `font-[Roboto]`, `font-serif`) và **cấm** viết inline style `fontFamily: '...'`.<br> *Ngoại lệ:* Chỉ cho phép dùng `font-sans`, `font-display`, `font-mono`, `font-inherit` và các class weight/style chuẩn của Tailwind. | Loại bỏ các class font dư thừa (các thẻ `div`, `span`, `p`,... đã tự động kế thừa `font-sans` từ layout gốc). |

*Lưu ý:* Hệ thống CI/CD của dự án sẽ tự động chạy lệnh `pnpm run lint:ui` trước khi thực hiện deploy. Mọi bản build có lỗi lint sẽ bị từ chối tự động.
