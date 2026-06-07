---
trigger: always_on
---

# Next.js App Router + PPR Architecture Rule

## Core Philosophy

Luôn thiết kế theo thứ tự:

Data → Render Strategy → Cache Strategy → Interaction → UI

Không được thiết kế từ UI trước.

Sai:

Page
├─ Gallery
├─ Review
├─ Booking
└─ Related

Đúng:

Data Sources
↓
Critical Content
↓
Deferred Content
↓
Client Interactions

---

# 1. Server First Rule

Mặc định mọi component là Server Component.

Chỉ chuyển sang Client Component khi có ít nhất một trong các điều kiện:

* onClick
* onChange
* useState
* useEffect
* useRef
* localStorage
* window
* document
* WebSocket
* Browser API
* Animation library yêu cầu DOM

Nếu component chỉ render dữ liệu:

* Text
* Avatar
* Image
* List
* Metadata

=> PHẢI là Server Component.

---

# 2. URL As State Rule

Business State phải nằm trong URL.

Ví dụ:

?page=2

?sort=rating

?category=anime

?scenarioId=sc-1

Không được dùng:

* Context
* Redux
* Zustand

cho các state có thể biểu diễn bằng URL.

UI State không được đưa vào URL.

Ví dụ:

* Lightbox open
* Tooltip
* Hover
* Accordion expand
* Dropdown open

=> dùng local state.

---

# 3. Page Data Aggregation Rule

Page không được gọi nhiều service trực tiếp.

Sai:

page.tsx

const companion = await companionService.getCompanion()
const reviews = await reviewService.getReviews()
const favorite = await favoriteService.getFavorite()

Đúng:

const data = await getCompanionPage()

---

Application Layer phải tồn tại.

Ví dụ:

application/
├─ companion/
│   ├─ getCompanionPage.ts
│   ├─ getExplorePage.ts
│   └─ getBookingPage.ts

Service Layer phản ánh Backend.

Application Layer phản ánh Use Case.

---

# 4. PPR Analysis Rule

Mỗi màn hình phải chia dữ liệu thành:

Critical Content

Deferred Content

Critical Content:

* Hero
* Title
* Main Info
* Price
* CTA

Deferred Content:

* Reviews
* Related Items
* Recommendations
* Analytics
* Activity Feed

Deferred Content phải được stream bằng Suspense.

Ví dụ:

<Suspense fallback={<ReviewSkeleton />}> <ReviewSection /> </Suspense>

---

# 5. Cache Strategy Rule

Trước khi fetch phải trả lời:

Dữ liệu thay đổi khi nào?

Không được trả lời:

"Em chưa biết"

---

Nếu thay đổi hiếm:

Profile
Companion
Category

=> cache dài

Ví dụ:

revalidate: 3600

---

Nếu thay đổi trung bình:

Review Summary
Explore Page

=> cache ngắn

Ví dụ:

revalidate: 60

---

Nếu realtime:

Notification
Chat
Wallet Balance

=> dynamic

Ví dụ:

export const dynamic = "force-dynamic"

---

# 6. Cache Tag Rule

Mọi dữ liệu có thể update phải có tag.

Ví dụ:

companion-123

reviews-123

user-456

booking-789

---

Không dùng:

revalidatePath("/explore")

cho mọi trường hợp.

Ưu tiên:

revalidateTag()

---

Sai:

revalidatePath("/")

Đúng:

revalidateTag("companion-123")

---

# 7. Route Handler Rule

Server Component không được gọi Route Handler của chính Next.js.

Sai:

Page
↓
fetch("/api/companions/123")

Đúng:

Page
↓
companionService.getCompanion()

---

Route Handler chỉ dành cho:

* Browser API
* Mutation
* Chat
* Upload
* Payment
* Webhook

---

# 8. Client Boundary Rule

Không hydrate toàn bộ page.

Sai:

Gallery (Client)

ReviewSection (Client)

ProfileCard (Client)

Đúng:

GalleryGrid (Server)

GalleryLightbox (Client)

ReviewSection (Server)

FavoriteButton (Client)

BookingButton (Client)

---

Hydrate nhỏ nhất có thể.

---

# 9. Image Rule

Gallery Grid:

thumbnail

Lightbox:

full size

Không load ảnh full size cho grid.

Không fetch ảnh khi click.

Không rerender server khi mở lightbox.

---

# 10. Loading Rule

Mỗi route phải có:

loading.tsx

Skeleton phải phản ánh layout thật.

Không dùng spinner toàn màn hình.

---

# 11. Fetch Waterfall Rule

Không được:

const companion = await ...
const reviews = await ...
const favorite = await ...

Ưu tiên:

Promise.all()

---

Agent phải phát hiện fetch waterfall.

---

# 12. PPR Smell Detection

Bất kỳ component nào:

* fetch dữ liệu
* không quan trọng cho first paint

=> đề xuất Suspense.

Ví dụ:

ReviewSection

RelatedCompanions

RecommendationSection

TrendingSection

---

# 13. Dynamic Smell Detection

Nếu page chứa:

Notification

Chat

Wallet

Realtime Status

KHÔNG được đánh dấu toàn page:

force-dynamic

Phải cô lập thành island riêng.

---

# 14. SEO Rule

Page phải có:

generateMetadata()

OpenGraph

Twitter Card

Structured Data nếu phù hợp.

---

# 15. Architecture Review Checklist

Trước khi merge:

[ ] Server Component mặc định
[ ] Client island tối thiểu
[ ] Không gọi internal API từ Server Component
[ ] Có Application Layer
[ ] Có Cache Tags
[ ] Có Suspense cho dữ liệu phụ
[ ] Không fetch waterfall
[ ] URL là source of truth cho business state
[ ] Loading skeleton tồn tại
[ ] Metadata đầy đủ
[ ] Không force-dynamic toàn page nếu không cần
[ ] RevalidateTag ưu tiên hơn RevalidatePath
[ ] Ảnh thumbnail và full-size tách biệt
[ ] Không hydrate component chỉ để render text
