import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChatContainer } from '@/shared/components/organisms/ChatContainer';
import { SpinnerIcon } from '@/shared/components/atoms/Icons';

export const metadata: Metadata = {
  title: 'Tin nhắn khách hàng | Kanojo Dashboard',
  description: 'Quản lý tin nhắn, trao đổi thông tin và thảo luận kịch bản với khách hàng của bạn.',
};

export default function CompanionChatPage() {
  return (
    <div className="min-h-[calc(100vh-84px)] md:min-h-screen bg-neutral-50/40 pt-20 pb-24 md:pt-24 md:pb-12 px-0 md:px-8">
      {/* Container chính rộng 5xl tương tự Client để giao diện đối xứng */}
      <div className="max-w-5xl mx-auto flex flex-col gap-4 md:gap-6 h-[calc(100vh-170px)] min-h-[500px] md:h-[650px] lg:h-[700px]">
        
        {/* Header ẩn trên mobile, hiện trên desktop */}
        <div className="hidden md:flex flex-col gap-1 px-4 md:px-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
            Tin nhắn khách hàng
          </h1>
          <p className="text-xs text-neutral-500 font-normal leading-relaxed">
            Hộp thư trao đổi nhanh các chi tiết hẹn hò với khách hàng đã đặt lịch.
          </p>
        </div>

        {/* Khung chat chính */}
        <main className="flex-1 min-h-0 h-full">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-white rounded-3xl border border-neutral-100/85">
                <SpinnerIcon size={32} className="text-neutral-300" />
              </div>
            }
          >
            <ChatContainer role="COMPANION" />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

