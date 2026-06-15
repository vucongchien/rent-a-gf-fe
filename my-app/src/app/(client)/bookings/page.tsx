import { MobileHeader } from '@/shared/components/organisms/MobileHeader';

export default function BookingsPage() {
  return (
    <div className="flex flex-col h-full bg-surface">
      <MobileHeader
        left={<h1 className="text-xl font-bold text-neutral-900 px-4">Bookings</h1>}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-neutral-500">
        <p>Chưa có lịch sử giao dịch nào.</p>
      </div>
    </div>
  );
}
