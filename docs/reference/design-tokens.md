# Design Tokens — Tóm tắt

Nguồn: [designtokenscourse.com](https://designtokenscourse.com/) (Brad Frost & Ian Frost).

## 1. Design token là gì?

Biến lưu **quyết định thiết kế** (màu, font, spacing, radius, shadow, motion…) ở dạng dữ liệu, dùng chung cho design tool và code.

> Token = nguồn sự thật duy nhất giữa Figma ↔ Web ↔ iOS ↔ Android.

**Giải quyết:** multi-brand, multi-platform, dark mode, rebrand, i18n, white-label.

## 2. Kiến trúc 3 tầng (Tiered architecture)

| Tier | Tên gọi khác | Mục đích | Ví dụ |
|------|--------------|----------|-------|
| 1. Primitive | Global / Reference / Core | Bảng màu/giá trị thô, không gắn ngữ cảnh | `color.blue.500 = #2563EB` |
| 2. Semantic | Alias / System | Gắn ý nghĩa sử dụng | `color.text.primary = {color.gray.900}` |
| 3. Component | Component-specific | Áp cho component cụ thể | `button.primary.bg = {color.action.default}` |

**Quy tắc:** component → semantic → primitive. **Không** cho component tham chiếu thẳng primitive.

## 3. Naming convention

Cấu trúc đề xuất:

```
[category].[concept].[property].[variant].[state].[scale]
```

| Vị trí | Ví dụ |
|--------|-------|
| category | `color`, `space`, `font`, `radius` |
| concept | `text`, `bg`, `border`, `action` |
| property | `primary`, `secondary`, `danger` |
| variant | `subtle`, `bold` |
| state | `hover`, `pressed`, `disabled` |
| scale | `sm`, `md`, `lg` / `100`–`900` |

**Nguyên tắc:**
- Đặt từ **tổng quát → cụ thể**.
- Dùng từ mô tả **mục đích**, không mô tả **giá trị** (`color.text.primary` ✅, `color.gray-900` ❌ ở tầng semantic).
- Nhất quán đơn vị (`space.4` = 4 đơn vị base).

## 4. Loại token phổ biến

| Category | Token mẫu |
|----------|-----------|
| Color | `color.bg.surface`, `color.text.muted`, `color.border.subtle` |
| Typography | `font.family.sans`, `font.size.body`, `font.weight.bold`, `line-height.tight` |
| Spacing | `space.0` … `space.10` (thường thang 4 hoặc 8) |
| Sizing | `size.icon.sm`, `size.control.md` |
| Radius | `radius.sm`, `radius.full` |
| Shadow | `shadow.sm`, `shadow.overlay` |
| Border | `border.width.thin`, `border.style.solid` |
| Motion | `duration.fast`, `easing.standard` |
| Z-index | `z.modal`, `z.toast` |
| Breakpoint | `breakpoint.md` |

## 5. Format chuẩn — W3C Design Tokens (DTCG)

File `.json`, key đặc biệt: `$value`, `$type`, `$description`.

```json
{
  "color": {
    "brand": {
      "primary": { "$value": "#2563EB", "$type": "color" }
    },
    "text": {
      "primary": { "$value": "{color.brand.primary}", "$type": "color" }
    }
  }
}
```

| `$type` | Giá trị |
|---------|---------|
| `color` | hex/rgb/hsl |
| `dimension` | `16px`, `1rem` |
| `fontFamily` | string / array |
| `duration` | `200ms` |
| `cubicBezier` | `[0.4, 0, 0.2, 1]` |
| `shadow`, `typography`, `border` | composite token |

## 6. Tooling

| Mục đích | Công cụ |
|----------|---------|
| Tạo & quản lý ở Figma | **Figma Variables**, Tokens Studio |
| Transform → CSS/iOS/Android | **Style Dictionary** (Amazon) |
| Đồng bộ Figma ↔ Git | Tokens Studio, Specify, Supernova |
| Phân phối | npm package, Figma Team Library |
| Lint / validate | DTCG schema, custom Style Dictionary actions |

**Đầu ra Style Dictionary:** CSS vars, SCSS, JS, iOS (Swift), Android (XML), Tailwind config…

## 7. Workflow

```
Design quyết định ──► Figma Variables ──► Export JSON (DTCG)
                                              │
                                              ▼
                                       Style Dictionary
                                              │
                ┌──────────────┬──────────────┼──────────────┐
                ▼              ▼              ▼              ▼
              CSS vars       iOS            Android       Docs site
```

1. Định nghĩa primitive trong Figma.
2. Tạo semantic alias → bind vào primitive.
3. Export DTCG JSON → commit vào repo tokens.
4. Style Dictionary build các platform output.
5. Publish npm + Figma library, version theo SemVer.
6. Consumer (app) cập nhật version.

## 8. Publishing & Versioning

| Thay đổi | Bump |
|----------|------|
| Sửa giá trị primitive ảnh hưởng UI | **major** |
| Thêm token mới | **minor** |
| Sửa mô tả, không đổi value | **patch** |

- Phát hành dạng **npm package** (`@org/tokens`).
- Figma Library publish song song, **đồng bộ version**.
- Có **changelog** + **migration guide** mỗi major.

## 9. Adoption

- Bắt đầu bằng **pilot project** (1 team, 1 sản phẩm).
- Refactor component dùng token thay vì hardcode.
- Cấm hardcode value qua linter (Stylelint, ESLint plugin).
- Tài liệu hoá: ý nghĩa token, khi nào dùng cái nào.

## 10. Governance

| Vai trò | Trách nhiệm |
|---------|-------------|
| Token owner | Duyệt thay đổi, quản version |
| Contributor | Đề xuất token mới qua PR/RFC |
| Consumer | Báo cáo gap, không tự sửa primitive |

- RFC template cho thay đổi lớn.
- Review định kỳ (quarterly) dọn token rác.

## 11. Advanced

| Use case | Cách dùng token |
|----------|-----------------|
| Dark mode | Cùng semantic name, đổi value theo theme |
| Multi-brand | Swap primitive layer, giữ semantic |
| Rebrand | Đổi primitive → propagate toàn hệ thống |
| i18n | Token cho line-height, font-family theo script |
| AI / agent | LLM đọc DTCG JSON để generate UI đúng hệ |

## 12. Anti-patterns

- Đặt tên theo giá trị (`color.red`) ở tầng semantic.
- Component token tham chiếu thẳng primitive.
- Không version, push thẳng vào main.
- Trùng lặp: vừa có `color.primary` vừa `brand.main`.
- Token cho mọi thứ → noise. Chỉ token hoá thứ **tái sử dụng**.

## 13. Checklist khởi tạo

- [ ] Định nghĩa scale base (4 hoặc 8).
- [ ] Primitive palette: color ramp 50–900, spacing 0–10.
- [ ] Semantic layer: text/bg/border/action × default/hover/disabled.
- [ ] DTCG JSON file trong repo riêng.
- [ ] Style Dictionary build → CSS vars.
- [ ] Figma Variables sync.
- [ ] Lint rule cấm hardcode.
- [ ] SemVer + changelog.
