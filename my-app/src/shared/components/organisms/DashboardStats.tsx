import React from 'react';
import { EarningsCard } from '../molecules/EarningsCard';
import { QuickActions } from './QuickActions';

interface DashboardStatsProps {
  balance: number;
  pendingCount: number;
  upcomingCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  balance,
  pendingCount,
  upcomingCount,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Grid Quick Actions */}
      <QuickActions pendingCount={pendingCount} upcomingCount={upcomingCount} />
    </div>
  );
};
