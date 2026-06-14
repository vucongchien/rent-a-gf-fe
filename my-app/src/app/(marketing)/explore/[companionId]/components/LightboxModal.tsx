'use client';

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { XIcon, ChevronRightIcon } from "@/shared/components/atoms/Icons";
import { Button } from "@/shared/components/atoms/Button";

export interface LightboxModalProps {
  companionId: string;
  companionName: string;
  albumUrls: string[];
  photoIndex: number;
  onClose?: () => void;
}

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OdPPQAIpgNlpFMqGwAAAABJRU5ErkJggg==";

export const LightboxModal: React.FC<LightboxModalProps> = ({
  companionId,
  companionName,
  albumUrls,
  photoIndex,
  onClose,
}) => {
  const router = useRouter();
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Quản lý index hiện tại bằng client state và đồng bộ khi prop photoIndex thay đổi
  const [prevPhotoIndex, setPrevPhotoIndex] = React.useState(photoIndex);
  const [currentIndex, setCurrentIndex] = React.useState(photoIndex);

  if (photoIndex !== prevPhotoIndex) {
    setPrevPhotoIndex(photoIndex);
    setCurrentIndex(photoIndex);
  }

  const activeUrl = albumUrls[currentIndex] || "/placeholder.png";
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < albumUrls.length - 1;

  // Xử lý đóng modal
  const handleClose = React.useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [router, onClose]);

  // Hàm chuyển ảnh và cập nhật URL shallow
  const navigateTo = React.useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < albumUrls.length) {
      setCurrentIndex(newIndex);
      window.history.replaceState(
        null,
        "",
        `/explore/${companionId}/photo/${newIndex}`
      );
    }
  }, [companionId, albumUrls.length]);

  // Lắng nghe phím bấm (Escape, Mũi tên trái/phải)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        navigateTo(currentIndex - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        navigateTo(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Khóa cuộn trang khi mở modal
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [currentIndex, hasPrev, hasNext, handleClose, navigateTo]);

  // Click ra ngoài để đóng
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md animate-fade-in pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Xem ảnh lớn của ${companionName}`}
    >
      <div ref={modalRef} className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center p-4 md:p-8 pointer-events-none">
        
        {/* Nút đóng */}
        <Button
          variant="outline"
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 !w-[42px] !h-[42px] !p-0 !rounded-[12px] flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 active:scale-95 !shadow-[2px_2px_0_var(--color-neutral-900)] focus:outline-none"
          aria-label="Đóng ảnh phóng to"
        >
          <XIcon size={20} className="stroke-[2.5px]" />
        </Button>

        {/* Khung ảnh chính */}
        <div className="relative w-full h-[75vh] md:h-[80vh] pointer-events-auto max-w-3xl flex items-center justify-center">
          <div className="relative w-full h-full rounded-[26px] overflow-hidden border-2 border-neutral-900 bg-neutral-900 shadow-[8px_8px_0_var(--color-neutral-900)] max-h-full">
            <Image
              src={activeUrl}
              alt={`${companionName} ảnh lớn`}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
              priority
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>
        </div>

        {/* Nút Previous (Mũi tên trái) */}
        {hasPrev && (
          <Button
            variant="outline"
            onClick={() => navigateTo(currentIndex - 1)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 !w-11 !h-11 !p-0 !rounded-[12px] flex items-center justify-center pointer-events-auto !shadow-[2px_2px_0_var(--color-neutral-900)] transition-transform hover:scale-105 focus:outline-none"
            aria-label="Ảnh trước"
          >
            <ChevronRightIcon size={20} className="rotate-180 stroke-[2.5px] mr-0.5" />
          </Button>
        )}

        {/* Nút Next (Mũi tên phải) */}
        {hasNext && (
          <Button
            variant="outline"
            onClick={() => navigateTo(currentIndex + 1)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 !w-11 !h-11 !p-0 !rounded-[12px] flex items-center justify-center pointer-events-auto !shadow-[2px_2px_0_var(--color-neutral-900)] transition-transform hover:scale-105 focus:outline-none"
            aria-label="Ảnh sau"
          >
            <ChevronRightIcon size={20} className="stroke-[2.5px] ml-0.5" />
          </Button>
        )}

        {/* Bộ đếm ảnh */}
        <div className="absolute bottom-4 bg-neutral-900/60 border border-neutral-800 text-white font-mono text-xs font-semibold px-4 py-1.5 rounded-full pointer-events-auto">
          {currentIndex + 1} / {albumUrls.length}
        </div>
      </div>
    </div>
  );
};

LightboxModal.displayName = "LightboxModal";
