import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChatContainer } from '@/shared/components/organisms/ChatContainer';
import { SpinnerIcon } from '@/shared/components/atoms/Icons';

export const metadata: Metadata = {
  title: 'Hộp thư tin nhắn | Kanojo',
  description: 'Trò chuyện thời gian thực và trao đổi trực tiếp với Companion của bạn trên ứng dụng Kanojo.',
};

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-96px)] md:h-auto md:min-h-screen bg-neutral-50/40 pt-6 pb-4 md:pt-4 md:pb-6 px-0 md:px-8 flex flex-col">
      {/* Container chính rộng 5xl tối ưu cho giao diện chat 2 cột */}
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-4 md:gap-4 flex-1 min-h-0 md:flex-none">


        {/* Khung chat chính */}
        <main className="flex-1 min-h-0 h-full md:flex-none md:h-[calc(100vh-120px)]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-white rounded-3xl border border-neutral-100/85">
                <SpinnerIcon size={32} className="text-neutral-300" />
              </div>
            }
          >
            <ChatContainer role="CLIENT" />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

