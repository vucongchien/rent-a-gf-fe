import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { companionService } from "@/shared/services/companionService";
import { ChevronRightIcon } from "@/shared/components/atoms/Icons";

interface StandalonePhotoPageProps {
  params: Promise<{
    companionId: string;
    photoIndex: string;
  }>;
}

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OdPPQAIpgNlpFMqGwAAAABJRU5ErkJggg==";

export default async function StandalonePhotoPage({ params }: StandalonePhotoPageProps) {
  const { companionId, photoIndex } = await params;
  const index = parseInt(photoIndex, 10);

  const companionData = await companionService.getCompanionDetail(companionId);
  if (!companionData || !companionData.data) {
    notFound();
  }

  const companion = companionData.data;
  const activeUrl = companion.albumUrls[index];

  if (!activeUrl) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative select-none">
      
      {/* Header back button */}
      <header className="absolute top-6 left-6 z-10">
        <Link
          href={`/explore/${companionId}`}
          className="inline-flex items-center gap-2 font-sans font-bold text-sm text-neutral-400 hover:text-white px-4 py-2 border-2 border-neutral-800 bg-neutral-900 rounded-[12px] shadow-[2px_2px_0_rgba(255,255,255,0.1)] transition-all"
        >
          <ChevronRightIcon size={16} className="rotate-180 stroke-[2.5px]" />
          Back to {companion.displayName}'s Profile
        </Link>
      </header>

      {/* Main Image Container */}
      <main className="relative max-w-4xl w-full h-[75vh] md:h-[80vh] flex items-center justify-center">
        <div className="relative w-full h-full rounded-[26px] overflow-hidden border-2 border-neutral-800 bg-neutral-900 shadow-[8px_8px_0_rgba(255,255,255,0.1)] max-h-full">
          <Image
            src={activeUrl}
            alt={`${companion.displayName} ảnh chính size lớn`}
            fill
            sizes="800px"
            className="object-contain"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </div>
      </main>

      {/* Image navigation hints */}
      <footer className="absolute bottom-6 flex gap-4 text-xs font-mono text-neutral-500">
        <span>Image {index + 1} of {companion.albumUrls.length}</span>
        <span>·</span>
        <span>Press Back button to exit</span>
      </footer>
    </div>
  );
}
