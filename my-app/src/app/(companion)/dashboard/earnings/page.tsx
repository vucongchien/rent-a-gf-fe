import React, { Suspense } from 'react';
import { walletService } from '@/shared/services/walletService';
import { Button } from '@/shared/components/atoms/Button';
import { EarningsSummaryCard } from '@/shared/components/molecules/EarningsSummaryCard';
import { EarningsStatsGrid } from '@/shared/components/molecules/EarningsStatsGrid';
import { EarningsTransactionList } from '@/shared/components/organisms/EarningsTransactionList';
import { DashboardSkeleton } from '@/shared/components/organisms/DashboardSkeleton';
import type { WalletTransaction } from '@/shared/types';

function computeStats(transactions: WalletTransaction[]) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const credits = transactions.filter(
    (tx) => tx.type === 'CREDIT' && tx.status === 'SUCCESS',
  );

  const monthCredits = credits.filter(
    (tx) => new Date(tx.createdAt).getTime() >= startOfMonth,
  );
  const weekCredits = credits.filter(
    (tx) => new Date(tx.createdAt).getTime() >= startOfWeek,
  );

  const monthIncome = monthCredits.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const weeklyDelta = weekCredits.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const completedCount = monthCredits.length;
  const avgPerBooking = completedCount > 0 ? Math.round(monthIncome / completedCount) : 0;

  const tipIncome = monthCredits
    .filter((tx) => (tx.description || '').toLowerCase().includes('tip'))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return { monthIncome, weeklyDelta, completedCount, avgPerBooking, tipIncome };
}

async function EarningsContent() {
  const [wallet, transactions] = await Promise.all([
    walletService.getWallet().catch(() => ({
      walletId: '',
      userId: '',
      availableBalance: 0,
      frozenBalance: 0,
    })),
    walletService.getTransactions().catch(() => [] as WalletTransaction[]),
  ]);

  const stats = computeStats(transactions);

  return (
    <div className="w-full space-y-6 pb-16">
      <EarningsSummaryCard
        availableBalance={wallet.availableBalance}
        frozenBalance={wallet.frozenBalance}
        weeklyDelta={stats.weeklyDelta}
      />

      {/* CTA Rút tiền — stub */}
      <Button
        type="button"
        variant="unstyled"
        disabled
        className="w-full rounded-[20px] py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-sans font-bold text-[14px] shadow-sm border border-amber-300/60 opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
        title="Tính năng sắp ra mắt"
      >
        Rút tiền về ngân hàng
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] bg-white/20 px-1.5 py-0.5 rounded-full">
          Sắp ra mắt
        </span>
      </Button>

      <EarningsStatsGrid
        monthIncome={stats.monthIncome}
        completedCount={stats.completedCount}
        avgPerBooking={stats.avgPerBooking}
        tipIncome={stats.tipIncome}
      />

      <EarningsTransactionList transactions={transactions} />
    </div>
  );
}

export default function DashboardEarningsPage() {
  return (
    <main className="max-w-md mx-auto px-4 pt-4">
      <div className="mb-4 px-1">
        <h1 className="font-sans font-bold text-[22px] tracking-tight text-neutral-900">
          Thu nhập
        </h1>
        <p className="font-sans text-[12.5px] text-neutral-500 mt-0.5">
          Theo dõi số dư và lịch sử giao dịch của bạn.
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <EarningsContent />
      </Suspense>
    </main>
  );
}
