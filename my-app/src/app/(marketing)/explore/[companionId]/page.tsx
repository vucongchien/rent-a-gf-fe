import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import type { Metadata } from 'next'
import { companionService } from '@/shared/services/companionService'
import { PolaroidGallery } from './components/PolaroidGallery'
import { ProfileNote } from './components/ProfileNote'
import { ScenesSelectorClient } from './components/ScenesSelectorClient'
import { ScenesSkeleton } from './components/ScenesSkeleton'
import { ReviewsWall } from './components/ReviewsWall'
import { ReviewsSkeleton } from './components/ReviewsSkeleton'
import { RelatedCompanions, RelatedCompanionsSkeleton } from './components/RelatedCompanions'

interface PageProps {
  params: Promise<{ companionId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { companionId } = await params
  const companion = await companionService.getCompanionDetail(companionId)
  if (!companion) return { title: 'Không tìm thấy người đồng hành', robots: { index: false } }
  const c = companion
  const title = `${c.displayName} · Sổ tay hẹn hò`
  const description = c.biography?.slice(0, 200) || `Đặt lịch hẹn cùng ${c.displayName} trên Mỗi Bước Một Duyên.`
  const url = `/explore/${companionId}`

  // OG image được generate động bởi opengraph-image.tsx cùng thư mục — không override images ở đây.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      title,
      description,
      url,
      siteName: 'Mỗi Bước Một Duyên',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CompanionDetailPage({ params }: PageProps) {
  const { companionId } = await params
  const companion = await companionService.getCompanionDetail(companionId)
  if (!companion) notFound()

  after(async () => {
    console.log(`[analytics] view:companion/${companionId}`)
  })

  const albumUrls = companion.albumUrls.length > 0
    ? companion.albumUrls : ['/placeholder.png']

  return (
      <main className="max-w-[1180px] mx-auto px-4 md:px-8 py-10 space-y-16 pb-32">


        <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,0.85fr)_1.15fr] gap-8 md:gap-12 items-start">
          <PolaroidGallery
            companionId={companionId}
            companionName={companion.displayName}
            albumUrls={albumUrls}
          />
          <ProfileNote companion={companion} />
        </div>

        <section id="scenes" className="scroll-mt-6">
          <Suspense fallback={<ScenesSkeleton />}>
            <ScenesSelectorClient
              companionId={companion.companionId}
              companionName={companion.displayName}
              scenarios={companion.scenarios}
            />
          </Suspense>
        </section>

        <section id="reviews" className="scroll-mt-6">
          <Suspense fallback={<ReviewsSkeleton />}>
            <ReviewsWall
              reviews={companion.recentReviews ?? []}
              ratingAvg={companion.averageRating}
              reviewCount={companion.totalReviews}
              companionName={companion.displayName}
            />
          </Suspense>
        </section>

        {/* Bạn đồng hành liên quan */}
        <section className="scroll-mt-6">
          <Suspense fallback={<RelatedCompanionsSkeleton />}>
            <RelatedCompanions currentId={companionId} city={companion.availableCities[0]} />
          </Suspense>
        </section>


        {/* Hỏi đáp FAQ */}
        <section className="space-y-6 pt-10 border-t border-neutral-200">
          <div className="space-y-2">
            <h2 className="font-sans text-3xl text-neutral-900 font-bold leading-tight">Giải đáp thắc mắc</h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 border border-neutral-200 rounded-2xl bg-white space-y-1.5">
              <h4 className="font-sans font-bold text-neutral-900 text-sm">
                Tôi có thể hủy lịch hẹn không?
              </h4>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Có. Bạn được hủy lịch miễn phí trước 24 giờ. Coin sẽ được tự động hoàn trả 100% vào ví của bạn mà không có bất kì thủ tục phức tạp nào.
              </p>
            </div>
            <div className="p-5 border border-neutral-200 rounded-2xl bg-white space-y-1.5">
              <h4 className="font-sans font-bold text-neutral-900 text-sm">
                Làm thế nào để liên lạc với bạn gái?
              </h4>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Sau khi yêu cầu đặt lịch được chấp nhận, kênh chat riêng giữa hai bạn sẽ tự động được kích hoạt để trao đổi và thống nhất chi tiết cuộc hẹn.
              </p>
            </div>
            <div className="p-5 border border-neutral-200 rounded-2xl bg-white space-y-1.5">
              <h4 className="font-sans font-bold text-neutral-900 text-sm">
                Hệ thống Kano-Coin bảo mật và an toàn như thế nào?
              </h4>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Tuyệt đối an toàn. Kano-Coin chỉ giải ngân sau khi cuộc hẹn diễn ra thành công. Ngoài ra, tất cả các bạn gái đều được xác minh hồ sơ và phong cách nghiêm ngặt để đảm bảo dịch vụ uy tín nhất.
              </p>
            </div>
          </div>
        </section>

      </main>
  )
}
