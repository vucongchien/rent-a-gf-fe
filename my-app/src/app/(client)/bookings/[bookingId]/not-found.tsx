import Link from 'next/link';
import { CalendarXIcon } from '@/shared/components/atoms/Icons';

export default function BookingNotFound() {
  return (
    <div className="w-full pt-6 md:pt-10 pb-12">
      <div className="max-w-[680px] mx-auto w-full px-4">
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-neutral-200 rounded-[24px] text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-chizuru-50 flex items-center justify-center text-chizuru-500 mb-4 border border-chizuru-100">
            <CalendarXIcon size={28} className="text-chizuru-500" />
          </div>
          <h3 className="font-sans font-bold text-neutral-800 text-lg mb-1">
            Không tìm thấy lịch hẹn
          </h3>
          <p className="font-sans text-[13.5px] text-neutral-500 max-w-sm mb-5">
            Lịch hẹn không tồn tại hoặc bạn không có quyền xem.
          </p>
          <Link
            href="/bookings"
            className="btn-base btn-primary btn-md px-6 rounded-xl hover:brightness-105"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}
