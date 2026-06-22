import React from 'react';
import { ProfileTabs } from './ProfileTabs';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-3xl mx-auto px-4 pt-20 md:pt-6 pb-24">
      <ProfileTabs />
      {children}
    </main>
  );
}
