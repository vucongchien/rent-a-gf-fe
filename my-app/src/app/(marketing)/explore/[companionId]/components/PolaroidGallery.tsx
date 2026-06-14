'use client'

import * as React from 'react'
import { MediaSlot } from '@/shared/components/atoms/MediaSlot'
import { LightboxModal } from './LightboxModal'

interface PolaroidFrameProps {
  href: string
  tilt: string
  caption?: string
  onClick: (e: React.MouseEvent) => void
  children: React.ReactNode
}

function PolaroidFrame({ href, tilt, caption, onClick, children }: PolaroidFrameProps) {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className="polaroid-frame block relative group cursor-zoom-in"
      style={{ transform: `rotate(${tilt})` }}
      aria-label="Xem ảnh lớn hơn"
    >
      {children}
      {caption && (
        <div className="text-center mt-2.5">
          <span className="inline-block px-3 py-1 bg-amber-50/80 border border-dashed border-amber-200/50 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)] rotate-[-1deg] font-mono text-[11px] text-[#5c4a42] tracking-wide">
            {caption.includes('♡') ? (
              <>
                <span>{caption.replace('♡', '')}</span>
                <span className="text-chizuru-600 font-semibold ml-0.5">♡</span>
              </>
            ) : caption}
          </span>
        </div>
      )}
    </a>
  )
}

interface PolaroidGalleryProps {
  companionId: string
  companionName: string
  albumUrls: string[]
  heroTilt?: string      // default: "-2deg"
  thumbTilt?: number     // default: 2.5 (deg), xen ke +/-
}

export function PolaroidGallery({
  companionId,
  companionName,
  albumUrls,
  heroTilt = '-2deg',
  thumbTilt = 2.5
}: PolaroidGalleryProps) {
  const displayAlbum = albumUrls.length > 0 ? albumUrls : ['/placeholder.png']

  // Quản lý trạng thái mở Lightbox ở Client
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)

  // Hàm mở Lightbox và cập nhật URL vào history stack (để nút Back hoạt động)
  const handleOpen = React.useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault() // Chặn Next.js router load trang chậm chạp
    setActiveIndex(index)
    setIsOpen(true)
    
    // Đẩy URL mới vào history
    window.history.pushState(
      { modalOpen: true },
      "",
      `/explore/${companionId}/photo/${index}`
    )
  }, [companionId])

  // Hàm đóng Lightbox và khôi phục URL profile
  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    window.history.replaceState(
      null,
      "",
      `/explore/${companionId}`
    )
  }, [companionId])

  // Lắng nghe sự kiện popstate (nhấn nút Back/Forward của trình duyệt)
  React.useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname
      if (!pathname.includes('/photo/')) {
        setIsOpen(false)
      } else {
        const match = pathname.match(/\/photo\/(\d+)/)
        if (match) {
          setActiveIndex(parseInt(match[1], 10))
          setIsOpen(true)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="flex flex-col gap-4 relative">
      <PolaroidFrame 
        href={`/explore/${companionId}/photo/0`} 
        tilt={heroTilt} 
        caption='"người bạn đồng hành" ♡'
        onClick={(e) => handleOpen(0, e)}
      >
        <MediaSlot 
          src={displayAlbum[0]} 
          alt={`${companionName} ảnh bìa`}
          aspectRatio="4/3" 
          radius="xs" 
          priority
          sizes="(max-width: 768px) 100vw, 400px" 
        />
      </PolaroidFrame>

      {displayAlbum.slice(1, 4).length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          {displayAlbum.slice(1, 4).map((url, i) => (
            <PolaroidFrame 
              key={i}
              href={`/explore/${companionId}/photo/${i + 1}`}
              tilt={i % 2 === 0 ? `-${thumbTilt}deg` : `${thumbTilt}deg`}
              onClick={(e) => handleOpen(i + 1, e)}
            >
              <MediaSlot 
                src={url} 
                alt={`${companionName} ảnh ${i + 2}`}
                aspectRatio="1/1" 
                radius="xs" 
                sizes="130px" 
              />
            </PolaroidFrame>
          ))}
        </div>
      )}

      {/* Hiển thị Lightbox Modal ngay tại client (0ms delay) */}
      {isOpen && (
        <LightboxModal
          companionId={companionId}
          companionName={companionName}
          albumUrls={displayAlbum}
          photoIndex={activeIndex}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
