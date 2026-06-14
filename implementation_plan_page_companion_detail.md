# Kế hoạch thiết kế lại trang Chi tiết Companion

**Stack**: Next.js 16.2.6 · React 19 · Tailwind CSS v4 · Vitest

---

## Mục tiêu

Xóa component cũ, thiết kế lại `/explore/[companionId]` theo phong cách **Scrapbook** (layout nghiêng, Polaroid, note dán) — sử dụng **toàn bộ** tính năng Next.js 16 + React 19 theo kiến trúc chuẩn.

---

## Phase 0 — Xóa file cũ

```
[DELETE] components/CompanionGallery.tsx
[DELETE] components/CompanionGalleryClient.tsx
[DELETE] components/CompanionInfoCard.tsx
[DELETE] components/ScenarioSelector.tsx
[DELETE] components/CompanionGallery.test.tsx
[DELETE] components/ScenarioSelector.test.tsx

[KEEP]   components/LightboxModal.tsx
[KEEP]   @modal/default.tsx
[KEEP]   @modal/(.)photo/[photoIndex]/page.tsx
[KEEP]   photo/[photoIndex]/page.tsx
[KEEP]   layout.tsx
```

---

## Phase 1 — PPR & Cấu hình Next.js 16

> [!NOTE]
> Trong Next.js 16, Partial Prerendering (PPR) là tính năng mặc định và được quản lý thông qua cấu hình `cacheComponents: true` (đã được thiết lập sẵn trong [next.config.ts](file:///e:/LEARN/rent-a-gf-fe/my-app/next.config.ts)).
> Do đó, ta **không cần** thêm tùy chọn `experimental.ppr` trong `next.config.ts` và cũng không cần bật thủ công nữa.

---

## Phase 2 — `page.tsx` — Server Component (PPR + SEO + after())

```tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import type { Metadata } from 'next'
import { companionService } from '@/shared/services/companionService'
import { CompanionCoverBlock } from './components/CompanionCoverBlock'
import { PolaroidGallery } from './components/PolaroidGallery'
import { ProfileNote } from './components/ProfileNote'
import { ScenesSelectorClient } from './components/ScenesSelectorClient'
import { ScenesSkeleton } from './components/ScenesSkeleton'
import { ReviewsWall } from './components/ReviewsWall'
import { ReviewsSkeleton } from './components/ReviewsSkeleton'

// SEO đầy đủ với generateMetadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const { companionId } = await params
  const result = await companionService.getCompanionDetail(companionId)
  if (!result?.data) return { title: 'Companion not found' }
  const c = result.data
  return {
    title: `${c.displayName} · Sổ tay hẹn hò`,
    description: c.bio,
    openGraph: {
      title: c.displayName,
      description: c.bio,
      images: c.albumUrls[0] ? [{ url: c.albumUrls[0] }] : [],
    },
  }
}

export default async function CompanionDetailPage({ params }) {
  const { companionId } = await params
  const result = await companionService.getCompanionDetail(companionId)
  if (!result?.data) notFound()
  const companion = result.data

  // after(): chạy SAU khi response đã stream về client — không block render
  after(async () => {
    console.log(`[analytics] view:companion/${companionId}`)
  })

  const albumUrls = companion.albumUrls.length > 0
    ? companion.albumUrls : ['/placeholder.png']

  return (
    <main className="max-w-[1180px] mx-auto px-4 md:px-8 py-10 space-y-16 pb-32">

      <CompanionCoverBlock companion={companion} />

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
            companionId={companion.id}
            companionName={companion.displayName}
            scenarios={companion.scenarios}
          />
        </Suspense>
      </section>

      <section id="reviews" className="scroll-mt-6">
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsWall
            reviews={companion.recentReviews ?? []}
            ratingAvg={companion.ratingAvg}
            reviewCount={companion.reviewCount}
            companionName={companion.displayName}
          />
        </Suspense>
      </section>

    </main>
  )
}
```

---

## Phase 3 — Loại bỏ Application Layer thừa

> [!NOTE]
> Để tránh trùng lặp cache và giữ codebase tinh gọn (Simplicity First), ta loại bỏ file `getCompanionPage.ts` và gọi trực tiếp `companionService.getCompanionDetail` (vì Service này đã được tích hợp sẵn `'use cache'`, `cacheLife`, và `cacheTag` thích hợp).

---

## Phase 4 — Booking Flow: @modal + Server Actions

### Tại sao dùng @modal thay vì client dialog?

| | Client `<dialog>` | `@modal/(.)booking` |
|---|---|---|
| URL thay đổi | No | Yes (shareable link) |
| Reload mở lại modal | No | Yes |
| Server render form | No | Yes |
| Progressive Enhancement | No | Yes |
| SEO / OG tags | No | Yes |

### Cấu trúc file booking:

```
[companionId]/
  booking/
    page.tsx          ← standalone fallback (reload / direct link)
    actions.ts        ← Server Actions (dùng chung cho cả 2 page)
  @modal/
    (.)booking/
      page.tsx        ← intercepting route: overlay trên detail page
  components/
    BookingModalWrapper.tsx  ← Client island: scrim + close
```

### `booking/types.ts` — Khai báo Types riêng biệt

```ts
export type BookingActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; bookingId: string }
```

### `booking/actions.ts` — Server Actions

```ts
'use server'
import { bookingService } from '@/shared/services/bookingService'
import { revalidateTag } from 'next/cache'
import type { BookingActionState } from './types'

export async function createBookingAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const companionId = formData.get('companionId') as string
  const scenarioId = formData.get('scenarioId') as string
  const scheduledAt = formData.get('scheduledAt') as string
  const note = (formData.get('note') as string) || undefined

  if (!companionId || !scenarioId || !scheduledAt)
    return { status: 'error', message: 'Vui lòng điền đầy đủ thông tin.' }

  try {
    const result = await bookingService.createBooking({
      companionId, scenarioId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      note,
    })
    revalidateTag('bookings')
    return { status: 'success', bookingId: result.id }
  } catch {
    return { status: 'error', message: 'Đặt lịch thất bại. Vui lòng thử lại.' }
  }
}
```

### `@modal/(.)booking/page.tsx` — Intercepting Route (Server)

```tsx
import { notFound } from 'next/navigation'
import { companionService } from '@/shared/services/companionService'
import { BookingModalWrapper } from '../../components/BookingModalWrapper'
import { BookingForm } from '@/shared/components/molecules/BookingForm'

export default async function InterceptedBookingPage({ params, searchParams }) {
  const { companionId } = await params
  const { scenarioId } = await searchParams
  const result = await companionService.getCompanionDetail(companionId)
  if (!result?.data) notFound()
  const companion = result.data
  const scenario = companion.scenarios.find(s => s.id === scenarioId) ?? companion.scenarios[0]

  return (
    <BookingModalWrapper>
      <div className="note-card max-w-md w-full p-8">
        <h2 className="font-serif text-3xl text-brand mb-2">Đặt lịch hẹn</h2>
        <p className="text-sm text-neutral-600 mb-6">{scenario.name} · với {companion.displayName}</p>
        <BookingForm
          companionId={companion.id}
          companionName={companion.displayName}
          scenarioId={scenario.id}
          scenarioName={scenario.name}
          priceInCoin={scenario.priceInCoin}
          durationMinutes={scenario.durationMinutes}
        />
      </div>
    </BookingModalWrapper>
  )
}
```

### `components/BookingModalWrapper.tsx` — Client Island

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { CloseButton } from '@/shared/components/atoms/CloseButton'

export function BookingModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const handleClose = () => router.back()

  useEffect(() => { dialogRef.current?.showModal() }, [])

  return (
    <dialog
      ref={dialogRef}
      className="modern-dialog backdrop:bg-neutral-900/40 backdrop:backdrop-blur-sm
                 max-w-md w-full m-auto rounded-2xl p-0 border-0"
      onClose={handleClose}
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <CloseButton onClick={handleClose} onClose={handleClose}
        variant="outline" size={16}
        className="absolute top-4 right-4 z-10 rounded-xl"
        aria-label="Đóng" />
      {children}
    </dialog>
  )
}
```

### `src/shared/components/molecules/BookingForm.tsx` — Client (React 19)

Đặt vào shared vì dùng ở cả `booking/page.tsx` lẫn `@modal/(.)booking/page.tsx`.

```tsx
'use client'
import { useActionState, useState, useEffect } from 'react' // React 19
import { useFormStatus } from 'react-dom'                    // React 19
import { useRouter } from 'next/navigation'
import { createBookingAction } from '@/app/(marketing)/explore/[companionId]/booking/actions'
import { SpinnerIcon, ClockIcon, CoinIcon } from '@/shared/components/atoms/Icons'
import { Button } from '@/shared/components/atoms/Button'
import { useWallet } from '@/shared/contexts/WalletContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import type { BookingActionState } from '@/app/(marketing)/explore/[companionId]/booking/types'

// useFormStatus tự detect pending từ form parent — không cần prop
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant="primary" size="md"
      className="rounded-full w-full justify-center">
      {pending ? <SpinnerIcon size={18} /> : 'Xác nhận & Thanh toán ♡'}
    </Button>
  )
}

export interface BookingFormProps {
  companionId: string
  companionName: string
  scenarioId: string
  scenarioName: string
  priceInCoin: number
  durationMinutes: number
}

export function BookingForm(props: BookingFormProps) {
  const { companionId, companionName, scenarioId, scenarioName, priceInCoin, durationMinutes } = props
  const router = useRouter()
  const { balance, open: openWallet, fetchWallet } = useWallet()
  const { user, login } = useAuth()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState('')

  const [state, action] = useActionState(createBookingAction, { status: 'idle' } as BookingActionState)

  // Xử lý khi đặt lịch thành công
  useEffect(() => {
    if (state.status === 'success') {
      // Refresh ví để cập nhật số dư bị đóng băng
      fetchWallet()
      // Chuyển hướng sau 1.5s
      const timer = setTimeout(() => {
        router.push('/bookings')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.status, fetchWallet, router])

  // Chuyển sang bước 2 (đối soát ví & xác nhận)
  const handleNextStep = () => {
    if (!scheduledAt) {
      setValidationError('Vui lòng chọn ngày giờ hẹn.')
      return
    }
    const minTime = Date.now() + 3600 * 1000 // Sau 1 tiếng
    if (new Date(scheduledAt).getTime() < minTime) {
      setValidationError('Thời gian đặt lịch phải sau thời điểm hiện tại ít nhất 1 giờ.')
      return
    }
    setValidationError('')
    setStep(2)
  }

  // Màn hình thành công (Love Letter & Confetti Effect)
  if (state.status === 'success') {
    return (
      <div className="text-center py-10 px-4 space-y-4 animate-[bounce_1s_infinite]">
        <div className="text-6xl animate-pulse">💌</div>
        <h3 className="font-serif text-2xl text-brand font-black">Đặt hẹn thành công!</h3>
        <p className="text-sm text-neutral-600 max-w-xs mx-auto">
          Yêu cầu đã được gửi đến <b>{companionName}</b>. Tiền đặt cọc tạm thời đã được giữ trong két an toàn (Escrow).
        </p>
        <div className="text-xs text-neutral-400">Đang chuyển bạn đến trang quản lý lịch hẹn...</div>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="companionId" value={companionId} />
      <input type="hidden" name="scenarioId" value={scenarioId} />
      <input type="hidden" name="scheduledAt" value={scheduledAt} />
      <input type="hidden" name="note" value={note} />

      {step === 1 ? (
        <>
          {/* STEP 1: ĐIỀN THÔNG TIN LỊCH HẸN */}
          <div className="bg-white/60 rounded-2xl p-4 space-y-2 text-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Kịch bản:</span>
              <span className="font-bold text-neutral-800">{scenarioName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Thời lượng:</span>
              <span className="font-bold text-neutral-800 flex items-center gap-1">
                <ClockIcon size={13} /> {durationMinutes} phút
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-2 mt-2">
              <span className="text-neutral-500">Phí dịch vụ:</span>
              <span className="font-bold text-brand flex items-center gap-1">
                <CoinIcon size={13} /> {priceInCoin} Coin
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Ngày giờ hẹn</label>
            <input 
              type="datetime-local" 
              value={scheduledAt}
              onChange={e => {
                setScheduledAt(e.target.value)
                setValidationError('')
              }}
              required
              min={new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16)}
              className="w-full border-2 border-neutral-200 rounded-xl px-4 py-2.5 text-sm
                         focus:border-brand focus:outline-none transition-colors" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Ghi chú (tuỳ chọn)</label>
            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Địa điểm, yêu cầu đặc biệt..."
              className="w-full border-2 border-neutral-200 rounded-xl px-4 py-2.5 text-sm
                         resize-none focus:border-brand focus:outline-none transition-colors" 
            />
          </div>

          {validationError && (
            <p className="text-error text-xs bg-error/10 rounded-lg px-3 py-2 border border-error/20">{validationError}</p>
          )}

          <Button 
            type="button" 
            variant="primary" 
            size="md"
            className="rounded-full w-full justify-center"
            onClick={handleNextStep}
          >
            Tiếp tục đặt lịch ♡
          </Button>
        </>
      ) : (
        <>
          {/* STEP 2: ĐỐI SOÁT VÍ & XÁC NHẬN */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-xs text-neutral-400 tracking-wider uppercase">Tóm tắt lịch hẹn</h4>
            
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-2.5 text-sm border border-neutral-100">
              <div className="flex justify-between">
                <span className="text-neutral-500">Bạn đồng hành:</span>
                <span className="font-bold text-neutral-800">{companionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kịch bản:</span>
                <span className="font-bold text-neutral-800">{scenarioName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Thời gian hẹn:</span>
                <span className="font-bold text-neutral-800">
                  {new Date(scheduledAt).toLocaleString('vi-VN', { 
                    hour: '2-digit', minute: '2-digit', 
                    day: '2-digit', month: '2-digit', year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-neutral-200 pt-2.5">
                <span className="text-neutral-500">Tổng chi phí:</span>
                <span className="font-black text-brand flex items-center gap-1 text-base">
                  <CoinIcon size={14} /> {priceInCoin} Coin
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-sm">
              <span className="text-neutral-500">Số dư ví của bạn:</span>
              <span className={`font-bold ${balance < priceInCoin ? 'text-error' : 'text-neutral-800'}`}>
                {balance} Coin
              </span>
            </div>

            {/* Check Authentication */}
            {!user ? (
              <div className="space-y-3">
                <div className="text-xs text-center text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-200/50">
                  🔒 Bạn chưa đăng nhập. Vui lòng đăng nhập Google để lưu sổ hẹn.
                </div>
                <Button 
                  type="button" 
                  variant="accent" 
                  size="md"
                  className="rounded-full w-full justify-center"
                  onClick={() => login('client')}
                >
                  Đăng nhập bằng Google 🔑
                </Button>
              </div>
            ) : balance < priceInCoin ? (
              /* Check Ví tiền */
              <div className="space-y-3">
                <div className="text-xs text-center text-error bg-error/5 rounded-xl p-3 border border-error/20">
                  ⚠️ Số dư ví không đủ để thanh toán. Vui lòng nạp thêm coin.
                </div>
                <Button 
                  type="button" 
                  variant="accent" 
                  size="md"
                  className="rounded-full w-full justify-center"
                  onClick={() => openWallet()}
                >
                  Nạp thêm Kano-Coin 🪙
                </Button>
              </div>
            ) : (
              /* Đủ điều kiện thanh toán */
              <SubmitButton />
            )}

            <Button 
              type="button" 
              variant="outline" 
              size="md"
              className="rounded-full w-full justify-center border-neutral-300 text-neutral-600"
              onClick={() => setStep(1)}
            >
              Quay lại chỉnh sửa
            </Button>
          </div>
        </>
      )}

      {state.status === 'error' && (
        <p className="text-error text-sm bg-error/10 rounded-lg px-3 py-2 border border-error/20">{state.message}</p>
      )}
    </form>
  )
}
```

---

## Phase 5 — ScenesSelectorClient

Single-select. BookingBar dùng `<Link>` → trigger `@modal/(.)booking`.

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ClockIcon } from '@/shared/components/atoms/Icons'
import type { CompanionScenario } from '@/shared/types'

const NOTE_PALETTE = [
  { bg: '#cfe3ef', ink: '#2f5f7a' },
  { bg: '#f0d9b8', ink: '#8a5a26' },
  { bg: '#ddd4ef', ink: '#5b4a86' },
  { bg: '#cfe6d8', ink: '#2f6b4f' },
  { bg: '#fce9e9', ink: '#b94a52' },
] as const

const SCENE_TILTS = ['-2.2deg', '1.8deg', '-1.4deg', '2.4deg', '-2deg']

function fmtDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60
  if (h && m) return `${h}t ${m}ph`
  return h ? `${h} tiếng` : `${m} phút`
}

function SceneCard({ sc, index, isSelected, onToggle }: {
  sc: CompanionScenario; index: number; isSelected: boolean; onToggle: () => void
}) {
  const color = NOTE_PALETTE[index % NOTE_PALETTE.length]
  const tilt = SCENE_TILTS[index % SCENE_TILTS.length]
  return (
    <article
      id={`scene-${sc.id}`}
      onClick={onToggle}
      role="button"
      aria-pressed={isSelected}
      className={`note-card cursor-pointer flex flex-col min-h-[220px]
                  ${isSelected ? 'outline outline-2 outline-neutral-900 outline-offset-2' : ''}`}
      style={{ transform: `rotate(${tilt})`, background: color.bg, color: color.ink }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-3xl" aria-hidden>📅</span>
        <span className="text-xs font-bold bg-white/60 px-2 py-1 rounded-full flex items-center gap-1">
          <ClockIcon size={11} />{fmtDuration(sc.durationMinutes)}
        </span>
      </div>
      <h3 className="font-sans font-bold text-lg mb-1 leading-tight">{sc.name}</h3>
      <p className="text-sm opacity-85 mb-4 flex-1 leading-relaxed">{sc.description}</p>
      <div className="flex items-center justify-between border-t border-current/20 pt-3 mt-auto">
        <span className="font-bold text-xl">{sc.priceInCoin} Coin</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors
          ${isSelected ? 'bg-neutral-900 text-white' : 'bg-white/60'}`}>
          {isSelected ? '✓ Đã chọn' : '+ Chọn'}
        </span>
      </div>
      <span className="corner-tag" style={{ background: color.ink }}>
        {sc.name.split(' ')[0].toUpperCase().slice(0, 6)}
      </span>
    </article>
  )
}

export function ScenesSelectorClient({ companionId, companionName, scenarios }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const active = scenarios.find(s => s.id === selectedId)

  return (
    <>
      <div className="flex items-start gap-4 mb-8">
        <span className="bg-brand text-neutral-900 font-bold text-sm px-3 py-1 rounded-lg flex-none"
              style={{ transform: 'rotate(-3deg)' }}>02</span>
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-neutral-900">Kịch bản dẫn đi chơi</h2>
          <p className="text-xs text-neutral-400 tracking-[3px] uppercase mt-1">Choose your date</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {scenarios.filter(s => s.isActive).map((sc, i) => (
          <SceneCard key={sc.id} sc={sc} index={i}
            isSelected={selectedId === sc.id}
            onToggle={() => setSelectedId(prev => prev === sc.id ? null : sc.id)} />
        ))}
      </div>

      {/* BookingBar: slide in khi có selectedId, Link kích hoạt @modal intercept */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4
                      transition-transform duration-300 ease-out
                      ${selectedId ? 'translate-y-0' : 'translate-y-[120%]'}`}
           aria-hidden={!selectedId}>
        <div className="w-full max-w-[760px] bg-neutral-900 text-white rounded-2xl
                        px-5 py-3.5 flex items-center justify-between gap-4
                        shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <div className="min-w-0">
            <p className="font-sans font-bold text-sm truncate">{active?.name}</p>
            <p className="text-xs opacity-70">
              {active && fmtDuration(active.durationMinutes)} · {active?.priceInCoin} Coin
            </p>
          </div>
          <Link
            href={`/explore/${companionId}/booking?scenarioId=${selectedId}`}
            scroll={false}
            className="btn-base btn-primary btn-md rounded-full whitespace-nowrap flex-none"
            tabIndex={selectedId ? 0 : -1}
          >
            Đặt hẹn với {companionName} ♡
          </Link>
        </div>
      </div>
    </>
  )
}
```

---

## Phase 6 — PolaroidGallery (Server)

`heroTilt` và `thumbTilt` là props — config từ ngoài, không hardcode.

```tsx
import Link from 'next/link'
import type { ReactNode } from 'react'
import { MediaSlot } from '@/shared/components/atoms/MediaSlot'

function PolaroidFrame({ href, tilt, caption, children }: {
  href: string; tilt: string; caption?: string; children: ReactNode
}) {
  return (
    <Link href={href} scroll={false}
      className="polaroid-frame block relative group cursor-zoom-in"
      style={{ transform: `rotate(${tilt})` }}
      aria-label="Xem ảnh lớn hơn">
      {children}
      {caption && <p className="text-center text-xs text-neutral-400 mt-2 px-1">{caption}</p>}
    </Link>
  )
}

interface PolaroidGalleryProps {
  companionId: string; companionName: string; albumUrls: string[]
  heroTilt?: string      // default: "-2deg"
  thumbTilt?: number     // default: 2.5 (deg), xen ke +/-
}

export function PolaroidGallery({
  companionId, companionName, albumUrls,
  heroTilt = '-2deg', thumbTilt = 2.5
}: PolaroidGalleryProps) {
  return (
    <div className="flex flex-col gap-4 relative">
      <PolaroidFrame href={`/explore/${companionId}/photo/0`}
        tilt={heroTilt} caption='"người yêu tạm thời" ♡'>
        <MediaSlot src={albumUrls[0]} alt={`${companionName} ảnh bìa`}
          aspectRatio="4/3" radius="xs" priority
          sizes="(max-width: 768px) 100vw, 400px" />
      </PolaroidFrame>

      {albumUrls.slice(1, 4).length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          {albumUrls.slice(1, 4).map((url, i) => (
            <PolaroidFrame key={i}
              href={`/explore/${companionId}/photo/${i + 1}`}
              tilt={i % 2 === 0 ? `-${thumbTilt}deg` : `${thumbTilt}deg`}>
              <MediaSlot src={url} alt={`${companionName} ảnh ${i + 2}`}
                aspectRatio="1/1" radius="xs" sizes="130px" />
            </PolaroidFrame>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Phase 7 — ProfileNote (Server)

```tsx
import { VoiceButton } from '@/shared/components/atoms/VoiceButton'
import { StarIcon, MapPinIcon } from '@/shared/components/atoms/Icons'
import type { CompanionDetail } from '@/shared/types'

interface ProfileNoteProps {
  companion: CompanionDetail
  tilt?: string  // default: "0.6deg"
}

export function ProfileNote({ companion, tilt = '0.6deg' }: ProfileNoteProps) {
  return (
    <div className="note-card bg-[--color-cream] p-6 md:p-8 space-y-4"
         style={{ transform: `rotate(${tilt})` }}>

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-sans font-black text-3xl md:text-4xl text-neutral-900 leading-none">
          {companion.displayName}
        </h2>
        {companion.metadata[0] && <span className="chip-tag">{companion.metadata[0]}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
        <span className="flex items-center gap-1 font-bold">
          <StarIcon size={14} />
          {companion.ratingAvg > 0 ? companion.ratingAvg.toFixed(1) : 'Mới'}
        </span>
        · <span>{companion.reviewCount} đánh giá</span>
        · <span className="flex items-center gap-1"><MapPinIcon size={14} />{companion.city}</span>
      </div>

      <p className="text-sm text-neutral-600 leading-relaxed">{companion.bio}</p>

      <div className="flex flex-wrap gap-2">
        {companion.metadata.map(tag => <span key={tag} className="chip-tag">{tag}</span>)}
      </div>

      <div className="border-t-2 border-dashed border-neutral-200 pt-5
                      flex items-center justify-between gap-4 flex-wrap">
        {companion.voiceIntroUrl && (
          <VoiceButton soundUrl={companion.voiceIntroUrl} label="Nghe giới thiệu" />
        )}
        <a href="#scenes" className="btn-base btn-primary btn-md rounded-full">
          Chọn kịch bản hẹn →
        </a>
      </div>
    </div>
  )
}
```

---

## Phase 8 — ReviewsWall (Server)

`tilt` và `noteColor` truyền từ parent thông qua mapping index — không hardcode trong card.

```tsx
import { Avatar } from '@/shared/components/atoms/Avatar'
import { StarIcon } from '@/shared/components/atoms/Icons'
import type { CompanionReview } from '@/shared/types'

const NOTE_PALETTE = [
  { bg: '#cfe3ef', ink: '#2f5f7a' },
  { bg: '#f0d9b8', ink: '#8a5a26' },
  { bg: '#ddd4ef', ink: '#5b4a86' },
  { bg: '#cfe6d8', ink: '#2f6b4f' },
  { bg: '#fce9e9', ink: '#b94a52' },
]
const REVIEW_TILTS = ['-3deg', '2.4deg', '-1.6deg', '1.8deg', '-2.6deg']

function ReviewCard({ review, tilt, noteColor }: {
  review: CompanionReview
  tilt: string
  noteColor: { bg: string; ink: string }
}) {
  return (
    <article className="note-card break-inside-avoid mb-6 inline-block w-full"
             style={{ transform: `rotate(${tilt})`, background: noteColor.bg, color: noteColor.ink }}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={null} name={review.authorName} size={48} />
        <div>
          <p className="font-sans font-bold text-sm">{review.authorName}</p>
          <div className="flex gap-0.5 mt-0.5">
            {[1,2,3,4,5].map(i => (
              <StarIcon key={i} size={11}
                className={i <= review.rating ? 'opacity-100' : 'opacity-20'} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-3">"{review.comment}"</p>
      <p className="text-xs opacity-60">{review.postedAt}</p>
      <span className="corner-tag" style={{ background: noteColor.ink }}>
        {review.authorName.split(' ').pop()?.slice(0, 4).toUpperCase()}
      </span>
    </article>
  )
}

export function ReviewsWall({ reviews, ratingAvg, reviewCount, companionName }) {
  return (
    <section>
      <div className="flex items-start gap-4 mb-6">
        <span className="bg-brand text-neutral-900 font-bold text-sm px-3 py-1 rounded-lg flex-none"
              style={{ transform: 'rotate(-3deg)' }}>03</span>
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-neutral-900">Lời nhắn của các nàng</h2>
          <p className="text-xs tracking-[3px] uppercase text-neutral-400 mt-1">L · O · V · E · notes</p>
        </div>
      </div>
      <p className="text-sm text-neutral-500 mb-8">
        ★ <b>{ratingAvg}/5</b> từ {reviewCount} buổi hẹn đã đi qua ♡
      </p>
      {reviews.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {reviews.map((rv, i) => (
            <ReviewCard key={rv.id} review={rv}
              tilt={REVIEW_TILTS[i % REVIEW_TILTS.length]}
              noteColor={NOTE_PALETTE[i % NOTE_PALETTE.length]} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-400 italic text-sm">
          Chưa có đánh giá. Hãy là người đầu tiên trải nghiệm!
        </p>
      )}
    </section>
  )
}
```

---

## Phase 9 — CSS vào `globals.css`

Thêm vào `@theme {}`:
```css
--shadow-note: 0 6px 18px rgba(74, 54, 30, 0.18);
--shadow-note-hover: 0 14px 34px rgba(74, 54, 30, 0.28);
--color-tape: rgba(255, 255, 255, 0.55);
```

Thêm `@utility`:
```css
@utility note-card {
  position: relative;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-note);
  padding: 1.25rem;
  transition: transform 0.28s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.28s;
  &:hover {
    transform: rotate(0deg) translateY(-4px) scale(1.012) !important;
    box-shadow: var(--shadow-note-hover);
    z-index: 8;
  }
}
@utility polaroid-frame {
  background: #fffdf6;
  padding: 10px 10px 32px;
  border-radius: 4px;
  box-shadow: var(--shadow-note);
  transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s;
  &:hover {
    transform: rotate(0deg) scale(1.02) !important;
    box-shadow: var(--shadow-note-hover);
    z-index: 6;
  }
}
@utility corner-tag {
  position: absolute;
  bottom: -9px; right: 14px;
  font-weight: 700; font-size: 0.7rem; letter-spacing: 0.1em;
  color: white; padding: 3px 12px; border-radius: 999px;
  transform: rotate(-4deg);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}
@utility chip-tag {
  display: inline-flex; align-items: center;
  font-family: var(--font-sans); font-weight: 600; font-size: 0.75rem;
  padding: 4px 12px; border-radius: 999px;
  background: rgba(255,255,255,0.65);
  border: 1.5px dashed var(--color-border);
  color: var(--color-text-muted);
}
```

---

## File map đầy đủ

```
[KEEP]   next.config.ts                              Giữ nguyên (đã bật cacheComponents: true)

[DELETE] components/CompanionGallery.tsx
[DELETE] components/CompanionGalleryClient.tsx
[DELETE] components/CompanionInfoCard.tsx
[DELETE] components/ScenarioSelector.tsx
[DELETE] components/CompanionGallery.test.tsx
[DELETE] components/ScenarioSelector.test.tsx

[KEEP]   components/LightboxModal.tsx
[KEEP]   @modal/default.tsx + (.)photo/**
[KEEP]   photo/** + layout.tsx

[MODIFY] page.tsx                                    generateMetadata + after() (không cần experimental_ppr)
[MODIFY] globals.css                                 thêm 4 utilities

[NEW]    loading.tsx                                 skeleton cho route segment
[NEW]    components/CompanionCoverBlock.tsx          Server
[NEW]    components/PolaroidGallery.tsx              Server
[NEW]    components/ProfileNote.tsx                  Server
[NEW]    components/ScenesSelectorClient.tsx         Client (single-select + BookingBar)
[NEW]    components/BookingModalWrapper.tsx          Client (sử dụng CloseButton atomic)
[NEW]    components/ReviewsWall.tsx                  Server
[NEW]    components/ScenesSkeleton.tsx               Server
[NEW]    components/ReviewsSkeleton.tsx              Server
[NEW]    booking/types.ts                            Định nghĩa BookingActionState riêng
[NEW]    booking/page.tsx                            Server (standalone fallback)
[NEW]    booking/actions.ts                          Server Actions (import state từ types.ts)
[NEW]    @modal/(.)booking/page.tsx                  Intercepting Route (Server)
[NEW]    src/shared/components/molecules/BookingForm.tsx   Client (sử dụng Button atomic và BookingActionState)
```

---

## Next.js 16 + React 19 Features đã sử dụng

| Feature | File |
|---|---|
| Cấu hình `cacheComponents: true` (PPR mặc định) | `next.config.ts` |
| `generateMetadata()` | `page.tsx` |
| `after()` (next/server) | `page.tsx` — analytics post-response |
| `'use cache'` + `cacheLife` + `cacheTag` | `companionService.ts` |
| `Suspense` streaming | `page.tsx` (scenes + reviews) |
| `loading.tsx` | route-level skeleton |
| Server Actions (`'use server'`) | `booking/actions.ts` |
| `revalidateTag` | trong Server Action sau booking |
| `useActionState` (React 19) | `BookingForm.tsx` |
| `useFormStatus` (React 19) | `BookingForm.tsx > SubmitButton` |
| Parallel Routes `@modal` | booking overlay |
| Intercepting Routes `(.)booking` | booking overlay |
| `router.back()` | `BookingModalWrapper` đóng modal |

---

## Anti-patterns (tuyệt đối tránh)

1. `fetch('/api/bookings')` trong Client → dùng Server Action
2. `useState + isSubmitting` cho form → dùng `useActionState` + `useFormStatus`
3. `<dialog>` client-side cho booking → dùng `@modal/(.)booking`
4. Multi-select scenario → single-select (`string | null`)
5. Hardcode tilt/màu trong card → config từ array constant ở parent
6. Import chéo giữa domain → chỉ import từ `@/shared/`
7. Tạo lại VoiceButton / Avatar / MediaSlot → import từ `@/shared/`
