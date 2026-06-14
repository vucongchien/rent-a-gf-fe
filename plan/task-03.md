# Kế Hoạch Triển Khai TASK-03 (Bản Cập Nhật): Trình Hiển Thị Ảnh CompanionGallery & Lightbox Modal bằng Intercepting Routes

Kế hoạch này được thiết kế lại nhằm tận dụng tối đa sức mạnh của **Next.js App Router (Parallel Routes & Intercepting Routes)** cho trải nghiệm Lightbox và tối ưu hóa tốc độ chuyển đổi ảnh qua cơ chế **DOM Preloading**.

---

## 1. Mục Tiêu & Yêu Cầu Kỹ Thuật

- **Tốc độ chuyển đổi Thumbnail (Instant Swap):**
  - Loại bỏ hoàn toàn độ trễ mạng (fetch delay) và độ trễ server-roundtrip khi click đổi thumbnail.
  - Triển khai cơ chế **DOM Preloading**: Render tất cả hình ảnh trong Album vào DOM ngay từ đầu (ẩn các ảnh không hoạt động bằng CSS `opacity-0 absolute` hoặc `hidden`). Trình duyệt sẽ tự động tải trước (preload) toàn bộ album về bộ nhớ đệm. Khi click thumbnail, việc đổi ảnh chính xảy ra ngay lập tức (0ms).
- **Lightbox qua Intercepting Routes (Next.js Modal):**
  - Khi click ảnh chính, điều hướng URL sang `/explore/[companionId]/photo/[photoIndex]`.
  - Next.js sẽ chặn (intercept) hành động này bằng slot `@modal/(.)photo/[photoIndex]` và render Lightbox dạng overlay đè lên trang chi tiết hiện tại.
  - Khi F5 (Hard Refresh) hoặc truy cập trực tiếp URL này, trang sẽ render chế độ độc lập (Standalone Photo Page) hiển thị ảnh trung tâm trên nền tối kèm nút quay lại.
- **Tích hợp Design System:** Cung cấp demo gallery đầy đủ tính năng trong trang `/design-system`.

---

## 2. Kiến Trúc Định Tuyến & Luồng Đi Của Dữ Liệu (Next.js App Router)

```
explore/[companionId]/
├── @modal/
│   └── (.)photo/
│       └── [photoIndex]/
│           └── page.tsx  <-- [Intercepted Route] Render Lightbox đè lên nền trang hiện tại
├── photo/
│   └── [photoIndex]/
│       └── page.tsx      <-- [Standalone Route] Render ảnh full-screen khi reload F5
└── page.tsx              <-- Trang chi tiết chính
```

### Tại sao lại chọn thiết kế này? (Why before How)
1. **Trải nghiệm Lightbox chuẩn Next.js:** 
   - Giữ nguyên trạng thái (state) và vị trí scroll của trang chi tiết nền phía sau khi mở/đóng Lightbox.
   - Hỗ trợ nút Back/Forward của trình duyệt để đóng/mở Lightbox một cách tự nhiên.
   - Hỗ trợ chia sẻ link ảnh trực tiếp (`/explore/comp-1/photo/2`).
2. **DOM Preloading vs Server Route Params:**
   - Sử dụng Server Route params cho việc chuyển đổi thumbnail sẽ gây ra một khoảng trễ nhỏ (server-side rendering và network latency).
   - Bằng cách render tất cả thẻ `<img>` của album vào DOM ngay lập tức và quản lý bằng local state `activeIndex`, việc chuyển ảnh chỉ là đổi class CSS (instant swap) mang lại cảm giác cực kỳ mượt mà.

---

## 3. Các File Cần Triển Khai & Cấu Trúc Chi Tiết

### 1. `CompanionGallery` (Server Component)
- **Đường dẫn:** `src/app/(marketing)/explore/[companionId]/components/CompanionGallery.tsx`
- **Nhiệm vụ:** Ráp khung layout cấu trúc, nhận dữ liệu `albumUrls` và truyền xuống Client component `CompanionGalleryClient`.

### 2. `CompanionGalleryClient` (Client Component - Island tương tác)
- **Đường dẫn:** `src/app/(marketing)/explore/[companionId]/components/CompanionGalleryClient.tsx`
- **Nhiệm vụ:**
  - Quản lý state `activeIndex` (chỉ số ảnh đang hiển thị).
  - Khối Stage (Ảnh chính):
    - Chứa một thẻ `<Link href={/explore/${companionId}/photo/${activeIndex}} scroll={false}>` bọc ngoài ảnh chính.
    - Render tất cả `albumUrls` song song bằng Next.js `Image`. Thẻ ảnh không active sẽ có class `opacity-0 pointer-events-none absolute inset-0 transition-opacity duration-200`. Thẻ ảnh active sẽ có `opacity-100 duration-200`.
  - Khối Thumbnails (Ảnh nhỏ):
    - Hiển thị danh sách ảnh nhỏ dưới dạng nút bấm. Click vào nút sẽ set `activeIndex` ngay lập tức.
  - Hiển thị nút nghe thử giọng nói `VoiceIntroCard` đè lên góc dưới ảnh chính.

### 3. Slot Intercepted Lightbox Page
- **Đường dẫn:** `src/app/(marketing)/explore/[companionId]/@modal/(.)photo/[photoIndex]/page.tsx`
- **Nhiệm vụ:**
  - Đọc `photoIndex` và `companionId`. Fetch dữ liệu companion.
  - Hiển thị component `<LightboxModal>` (Client Component) trùm lên toàn màn hình (Overlay), hiển thị ảnh lớn với khả năng điều hướng trái/phải và nút đóng.

### 4. Standalone Photo Page (Fallback khi F5)
- **Đường dẫn:** `src/app/(marketing)/explore/[companionId]/photo/[photoIndex]/page.tsx`
- **Nhiệm vụ:**
  - Một trang Server Component đơn giản hiển thị ảnh lớn ở trung tâm, nền đen tối giản, có nút quay lại trang chi tiết.

---

## 4. Chiến Lược Caching & Tối Ưu Hóa Tải Ảnh

- **Image Caching:** Next.js Image component sẽ tự động tối ưu hóa (resize, convert sang WebP/AVIF) và cache các biến thể ảnh trên server.
- **Preload Link:** Đối với các ảnh thumbnail tiếp theo, ta có thể chủ động render chúng trong thẻ `<img>` có thuộc tính `loading="eager"` (hoặc thuộc tính `priority` cho ảnh đầu tiên) để kích hoạt tải song song ngay khi HTML vừa được parse.
- **Page Caching:** Cả trang chi tiết `/explore/[companionId]` lẫn trang ảnh `/explore/[companionId]/photo/[photoIndex]` đều được hưởng lợi từ cache tĩnh `'use cache'` và revalidateTag khi cập nhật thông tin companion.

---

## 5. Tích Hợp Vào Design System
- Trong trang `/design-system`, chúng ta sẽ nhúng component `CompanionGallery` hoàn chỉnh với ảnh mẫu Pinterest thật: `https://i.pinimg.com/1200x/f2/09/dc/f209dc1c3506cd738d03458c0fa8da8b.jpg`.
- Vì trang `/design-system` không chạy trên route `/explore/[companionId]`, chúng ta sẽ giả lập link click ảnh chính để hiển thị một Client Lightbox Modal thông qua state nội bộ thay vì điều hướng URL thực để tránh làm gián đoạn trang thiết kế.
