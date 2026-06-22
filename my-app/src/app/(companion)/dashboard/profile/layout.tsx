import React from 'react';
import { ProfileTabs } from './ProfileTabs';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-md mx-auto px-4 pt-4 pb-24">
      <ProfileTabs />
      {children}
    </main>
  );
}
