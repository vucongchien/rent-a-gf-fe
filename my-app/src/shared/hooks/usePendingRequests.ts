import { useState } from 'react';
import type { BookingListItem } from '@/shared/types';
import { acceptBookingAction, rejectBookingAction } from '@/app/(companion)/dashboard/actions';
import { useToast } from '../components/atoms/ToastNotification';

export const usePendingRequests = (initialBookings: BookingListItem[]) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingListItem[]>(
    initialBookings.filter((b) => b.status === 'PENDING')
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAccept = async (bookingId: string) => {
    setLoadingId(bookingId);
    try {
      const result = await acceptBookingAction(bookingId);
      if (result.status === 'error') {
        toast({ message: result.message });
        return;
      }
      toast({ message: 'Đã chấp nhận yêu cầu đặt lịch!' });
      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
    } catch {
      toast({ message: 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setLoadingId(bookingId);
    try {
      const result = await rejectBookingAction(bookingId);
      if (result.status === 'error') {
        toast({ message: result.message });
        return;
      }
      toast({ message: 'Đã từ chối yêu cầu.' });
      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
    } catch {
      toast({ message: 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setLoadingId(null);
    }
  };

  return {
    bookings,
    loadingId,
    handleAccept,
    handleReject,
  };
};
