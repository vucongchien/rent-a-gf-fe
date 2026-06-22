import React from 'react';
import { ProfileTabs } from './ProfileTabs';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-20 md:pt-6 pb-24">
      <ProfileTabs />
      {children}
    </main>
  );
}
