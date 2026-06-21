'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';

interface ChatInputAreaProps {
  isLocked: boolean;
  role: 'CLIENT' | 'COMPANION';
  onSend: (text: string) => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  isLocked,
  role,
  onSend,
}) => {
  const [text, setText] = useState('');
  const isClientMode = role === 'CLIENT';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLocked) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (isLocked) {
    return (
      <div className="p-4 border-t border-neutral-100/60 bg-neutral-50/50 flex items-center justify-center font-sans text-xs text-neutral-400 font-medium select-none text-center leading-relaxed">
        🔒 Phòng chat này đã bị khóa theo quy định của hệ thống.
      </div>
    );
  }

  // Chọn style nút gửi dựa theo vai trò (Client = Hồng, Companion = Vàng)
  const submitButtonVariant = isClientMode ? 'primary' : 'accent';
  const inputBorderFocus = isClientMode
    ? 'focus:border-chizuru-400 focus:ring-1 focus:ring-chizuru-100'
    : 'focus:border-mami-400 focus:ring-1 focus:ring-mami-100';

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white border-t border-neutral-100/80 flex items-center gap-3 font-sans shrink-0"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn..."
        className={`flex-1 h-10 px-4 rounded-xl border border-neutral-200 text-[13.5px] outline-none transition-all placeholder-neutral-400 bg-neutral-50/20 ${inputBorderFocus}`}
      />
      <Button
        type="submit"
        disabled={!text.trim()}
        variant={submitButtonVariant}
        className="h-10 px-5 text-[13.5px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
      >
        Gửi
      </Button>
    </form>
  );
};
