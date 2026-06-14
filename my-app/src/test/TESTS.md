# Hướng dẫn Kiểm thử (Testing Documentation)

Tài liệu này đóng vai trò như một mục lục để giúp các developers tra cứu và dễ dàng chạy các bộ test trong hệ thống, đặc biệt tập trung vào các domain được phân chia độc lập.

## 1. Mục tiêu kiểm thử

-   Đảm bảo chất lượng các Components độc lập (Atomic Design).
-   Cô lập dữ liệu mock thông qua MSW, đảm bảo hệ thống render chuẩn.
-   Đảm bảo luồng đi và logic không bị sai sót khi tích hợp vào Page.

## 2. Cách chạy test

Dự án sử dụng `vitest` kết hợp với `@testing-library/react`.

-   Chạy test một lần: `pnpm test`
-   Chạy test chế độ watch: `pnpm test:watch`
-   Chạy UI test (Vitest UI): `pnpm test:ui`
-   Đoạn coverage: `pnpm coverage`

## 3. Mục lục các Test Suite

### Phase 1: Mock Context & Providers
| Tên Module | File Test | Ý nghĩa kiểm thử |
|---|---|---|
| **AuthContext** | `src/shared/contexts/AuthContext.test.tsx` | Kiểm tra luồng trạng thái xác thực bằng mock MSW. Đảm bảo UI nhận và chuyển đổi role (guest/client/companion) chính xác. |
| **Companions MSW** | `src/mocks/handlers/companions.test.tsx` | Fake fetch request gọi vào server MSW, xác thực response trả về đúng schema và pagination cho logic companion grid. |

### Phase 2: Components
| Tên Component | File Test | Ý nghĩa kiểm thử |
|---|---|---|
| **CompanionBadge** | `src/shared/components/atoms/CompanionBadge.test.tsx` | Đảm bảo Badge ghép text bằng dấu `·` chuẩn xác, và áp dụng màu gradient đúng đắn cho các traits kết hợp. |
| **CompanionCard** | `src/shared/components/molecules/CompanionCard.test.tsx` | Kiểm tra UI Molecule, đảm bảo thẻ render đủ avatar, tags, meta data, và nhận diện tốt các trigger events như click Like, click Voice, click Meet Me. |

### Phase 3: Integration
| Tên Page | File Test | Ý nghĩa kiểm thử |
|---|---|---|
| **ExplorePage** | `src/app/(marketing)/explore/page.test.tsx` | Integration testing mô phỏng thao tác fetch companions lúc mounted, click trên FilterChip có cập nhật URL params và làm mới grid chính xác theo cơ chế MSW. |

### Companion Detail Page Components (Phases 5, 6, 7, 8)
| Tên Component | File Test | Ý nghĩa kiểm thử |
|---|---|---|
| **ScenesSelectorClient** | `src/app/(marketing)/explore/[companionId]/components/ScenesSelectorClient.test.tsx` | Đảm bảo hiển thị đúng tất cả các kịch bản hẹn hò, thời lượng, chi phí Kano-Coin, và link Đặt lịch với companion. |
| **PolaroidGallery** | `src/app/(marketing)/explore/[companionId]/components/PolaroidGallery.test.tsx` | Kiểm tra render ảnh chính, các ảnh thu nhỏ thumbnail dưới dạng khung Polaroid, xử lý fallback ảnh trống. |
| **ProfileNote** | `src/app/(marketing)/explore/[companionId]/components/ProfileNote.test.tsx` | Kiểm tra render chi tiết bio, rating, reviews, thành phố, các tags đặc trưng, nút phát audio giới thiệu VoiceButton, và nút CTA cuộn trang `#scenes`. |
| **ReviewsWall** | `src/app/(marketing)/explore/[companionId]/components/ReviewsWall.test.tsx` | Kiểm tra render danh sách reviews của bạn gái dưới dạng masonry, hiển thị thông tin rating trung bình, avatar, nội dung đánh giá và trạng thái rỗng. |
