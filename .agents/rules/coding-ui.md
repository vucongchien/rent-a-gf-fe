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
