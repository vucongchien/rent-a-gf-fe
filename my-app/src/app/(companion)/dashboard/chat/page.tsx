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
    <div className="h-[calc(100vh-96px)] overflow-hidden md:h-[calc(100vh-84px)] md:overflow-hidden bg-neutral-50/40 pt-20 pb-4 md:pt-4 md:pb-6 px-0 md:px-8 flex flex-col">
      {/* Container chính rộng 5xl tương tự Client để giao diện đối xứng */}
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-4 md:gap-4 flex-1 min-h-0">
        

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

