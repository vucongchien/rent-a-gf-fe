import React from 'react';
import { redirect } from 'next/navigation';
import { authService } from '@/shared/services/authService';
import { AdminSidebar } from '@/shared/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await authService.getMe();

  if (!user) {
    redirect('/login');
  }
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-surface-muted text-neutral-900">
      <AdminSidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
