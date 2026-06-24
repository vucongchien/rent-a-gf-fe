import React from 'react';
import Link from 'next/link';
import type { BookingListItem } from '@/shared/types';
import { Avatar } from '@/shared/components/atoms/Avatar';
import { Button } from '../atoms/Button';

interface PendingRequestItemProps {
  booking: BookingListItem;
  loadingId: string | null;
  onAccept: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
}

export const PendingRequestItem: React.FC<PendingRequestItemProps> = ({
  booking,
  loadingId,
  onAccept,
  onReject,
}) => {
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('vi-VN')} · ${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const isLoading = loadingId === booking.bookingId;

  return (
    <div className="bg-white border border-neutral-100 rounded-[20px] p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 select-none">
      {/* Layout giống NotificationItem: Cột trái Avatar, cột phải Nội dung */}
      <div className="flex items-start gap-3">
        {/* Cột trái: Avatar tiêu chuẩn của hệ thống */}
        <Avatar
          src={booking.partnerAvatar}
          name={booking.partnerName}
          size={44}
          className="border border-neutral-100/50 shadow-sm"
        />

        {/* Cột phải: Text & Số tiền Coin */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-sans font-bold text-[13.5px] text-neutral-900 leading-tight truncate">
              {booking.partnerName}
            </h3>
            
            {/* Số xu nhận được nổi bật nhỏ gọn phẳng */}
            <span className="font-sans font-bold text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 shrink-0">
              +{booking.price} Coin
            </span>
          </div>

          <p className="font-sans text-[11.5px] text-neutral-500 mt-1 leading-tight">
            {booking.scenarioTitle}
          </p>
        </div>
      </div>

      {/* Nhóm nút hành động và thông tin thời gian phẳng ở chân card */}
      <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100/60">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-neutral-400">
            {formatDate(booking.startTime)}
          </span>
          <Link
            href={`/dashboard/requests/${booking.bookingId}`}
            className="font-sans text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            Chi tiết
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            disabled={loadingId !== null}
            onClick={() => onReject(booking.bookingId)}
            variant="unstyled"
            className="px-2 py-1 text-[11px] font-sans font-semibold text-neutral-400 hover:text-neutral-600 active:scale-95 transition-all cursor-pointer"
          >
            Từ chối
          </Button>

          <Button
            disabled={loadingId !== null}
            onClick={() => onAccept(booking.bookingId)}
            variant="unstyled"
            className="h-7.5 px-4 rounded-full bg-chizuru-500 hover:bg-chizuru-600 text-neutral-800 font-sans font-bold text-[11px] active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-chizuru-500/10 shadow-sm"
          >
            {isLoading ? 'Đang xử lý...' : 'Chấp nhận'}
          </Button>
        </div>
      </div>
    </div>
  );
};

