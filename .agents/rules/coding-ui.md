---
trigger: model_decision
description: When coding UI
---

# DESIGN TOKEN ENFORCEMENT RULES

## Mục tiêu

Toàn bộ UI phải đi qua Design Token System.

Cấm:

* hardcode màu
* hardcode spacing
* hardcode radius
* hardcode shadow
* hardcode z-index
* hardcode animation timing


# 16. ARCHITECTURE PRINCIPLE

UI không được phụ thuộc vào visual implementation.

UI phải phụ thuộc vào semantic contract.

```text
Component
    ↓
Semantic Token
    ↓
Raw Palette
```

Không được:

```text
Component
    ↓
Hex Color
```

Đó là cách codebase tránh biến thành nghĩa địa của:

```tsx
text-[#E91E63]
bg-[#121212]
rounded-[13px]
```

mà không ai còn nhớ tại sao chúng tồn tại.

# QUY TẮC BỔ SUNG VỀ COMPONENTS & ICONS TÁI SỬ DỤNG

## 1. Trích xuất Atoms cho tương tác lặp lại
- Đối với các phần tử UI tương tác xuất hiện ở nhiều component lớn (như nút Đóng `CloseButton`, ảnh đại diện `Avatar`), **BẮT BUỘC** phải trích xuất thành các Atom riêng biệt trong thư mục `atoms/`.
- Cấm tự code inline hoặc lặp lại cấu trúc JSX/CSS của các tương tác này ở nhiều nơi.

## 2. Quản lý SVG Icons tập trung
- Cấm vẽ inline các path SVG thô (`<svg>...<path d="..." />...</svg>`) trực tiếp bên trong các page hoặc các component phân cấp cao (Molecules, Organisms).
- Tất cả các icon thông dụng phải được định nghĩa trong `my-app/src/shared/components/atoms/Icons.tsx` dưới dạng các component React (ví dụ `SearchIcon`, `LogOutIcon`, `ChevronDownIcon`) và tái sử dụng bằng cách import.

## 3. Tuân thủ tuyệt đối quy tắc Radius & Color Tokens
- Quy tắc thiết kế: **Height / 4 = Radius**. Khi thiết kế component, hãy chọn các giá trị bo góc đã định nghĩa sẵn trong system token (như `rounded-md` cho h-8, `rounded-xl` cho h-16) tương ứng với chiều cao của nó.
- Tuyệt đối không tự ý viết các giá trị pixel ad-hoc như `rounded-[10px]`, `rounded-[14px]` hoặc padding tùy tiện `px-[12px]`, `py-[11px]` nếu không có lý do layout đặc thù và được chấp thuận. Hãy sử dụng các class Tailwind chuẩn (`rounded-md`, `rounded-xl`, `px-3`, `py-2.5`, `gap-3`).

