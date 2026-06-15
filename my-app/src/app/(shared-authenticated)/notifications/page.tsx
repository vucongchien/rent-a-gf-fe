import { MobileHeader } from '@/shared/components/organisms/MobileHeader';

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-full bg-surface">
      <MobileHeader
        left={<h1 className="text-xl font-bold text-neutral-900 px-4">Thông báo</h1>}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-neutral-500">
        <p>Bạn không có thông báo nào mới.</p>
      </div>
    </div>
  );
}
