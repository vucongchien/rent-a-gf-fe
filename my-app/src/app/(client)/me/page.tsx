import React, { Suspense } from 'react';
import { authService } from '@/shared/services/authService';
import { walletService } from '@/shared/services/walletService';
import { ProfileInfoCard } from './components/ProfileInfoCard';
import { WalletDashboard } from '@/shared/components/organisms/WalletDashboard';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionList } from './components/TransactionList';
import { TransactionSkeleton } from './components/TransactionSkeleton';

interface PageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
  }>;
}

export default async function MePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const filterType = resolvedSearchParams.type || 'ALL';
  const filterStatus = resolvedSearchParams.status || 'ALL';

  // Gom các request quan trọng của trang để fetch song song tránh fetch waterfall
  const [user, wallet] = await Promise.all([
    authService.getMe(),
    walletService.getWallet(),
  ]);

  if (!user) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 border border-rose-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </div>
        <h2 className="font-sans font-bold text-lg text-neutral-800 mb-1">Yêu cầu đăng nhập</h2>
        <p className="font-sans text-sm text-neutral-500 max-w-[320px]">
          Bạn cần đăng nhập để xem thông tin tài khoản và lịch sử giao dịch.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pt-6 md:pt-4 pb-12">
      {/* Container Grid chia làm 12 cột */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Cột trái (Sidebar): Chiếm 4 cột trên desktop, hiển thị thông tin và ví */}
        <aside className="col-span-1 md:col-span-4 flex flex-col gap-6">
          <ProfileInfoCard user={user} />
          {wallet && (
            <div className="hidden md:block">
              <WalletDashboard
                balance={wallet.availableBalance}
                frozenBalance={wallet.frozenBalance}
              />
            </div>
          )}
        </aside>



        {/* Cột phải: Chiếm 8 cột trên desktop, hiển thị Lịch sử giao dịch */}
        <main className="col-span-1 md:col-span-8 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-4">
            <h2 className="font-sans font-bold text-base sm:text-lg text-neutral-900">
              Lịch sử giao dịch
            </h2>
            <p className="font-sans text-[12.5px] text-neutral-500 mt-[1px]">
              Tra cứu lịch sử nạp tiền và thanh toán đặt lịch của bạn
            </p>
          </div>

          {/* Bộ lọc giao dịch - Client Island */}
          <TransactionFilters />

          {/* Danh sách giao dịch được stream bằng Suspense để cải thiện FCP/LCP */}
          <div className="mt-4">
            <Suspense 
              key={`${filterType}-${filterStatus}`} 
              fallback={<TransactionSkeleton />}
            >
              <TransactionList type={filterType} status={filterStatus} />
            </Suspense>
          </div>
        </main>

      </div>
    </div>
  );
}

