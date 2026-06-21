export default function CompanionNotificationsPage() {
  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-neutral-500">
        <p className="font-sans font-medium text-[15px]">Bạn chưa có thông báo mới nào liên quan đến công việc.</p>
        <p className="font-sans text-[12.5px] text-neutral-400 mt-1">Thông báo về lịch hẹn, doanh thu và hệ thống sẽ xuất hiện ở đây.</p>
      </div>
    </div>
  );
}
