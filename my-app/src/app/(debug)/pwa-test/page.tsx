import PushSubscriptionManager from '@/shared/components/organisms/PushSubscriptionManager';

export default function PWATestPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
          Cổng Kiểm Thử PWA
        </h1>
        <p className="text-sm text-slate-400 max-w-sm">
          Trang kiểm thử đăng ký và đẩy tin nhắn thông báo (Web Push) trên thiết bị di động.
        </p>
      </div>

      <PushSubscriptionManager />
      
      <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-500 space-y-2 leading-relaxed">
        <div className="font-semibold text-slate-400">💡 Hướng dẫn kiểm thử nhanh trên di động:</div>
        <ol className="list-decimal pl-4 space-y-1.5">
          <li>Đảm bảo điện thoại và máy tính kết nối <strong>chung một mạng Wi-Fi</strong>.</li>
          <li>Chạy lệnh dev server: <code className="bg-slate-950 px-1 py-0.5 rounded text-rose-400 font-mono">pnpm dev --experimental-https</code>.</li>
          <li>Tìm IP nội bộ của máy tính (ví dụ: <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono">192.168.1.XX</code>) và truy cập trên trình duyệt điện thoại bằng link: <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono">https://192.168.1.XX:3000/pwa-test</code>.</li>
          <li>If trình duyệt cảnh báo chứng chỉ không an toàn (do SSL tự ký), chọn <strong>Nâng cao (Advanced)</strong> → <strong>Tiếp tục truy cập (Proceed)</strong>.</li>
          <li><strong>Trên iOS (Safari):</strong> Nhấp nút <strong className="text-slate-300">Chia sẻ (Share)</strong> → Chọn <strong className="text-slate-300">Thêm vào màn hình chính (Add to Home Screen)</strong>. Sau đó mở app từ màn hình chính để đăng ký nhận Push.</li>
          <li>Nhấn <strong className="text-slate-300">Kích Hoạt Nhận Thông Báo</strong>, đồng ý cấp quyền và nhập tin nhắn để test tính năng Đẩy Thông Báo chạy ngầm!</li>
        </ol>
      </div>
    </main>
  );
}
