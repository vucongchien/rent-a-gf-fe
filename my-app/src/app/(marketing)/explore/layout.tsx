import React from 'react';

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1200px] mx-auto px-[16px] md:px-[28px] py-[22px] pb-[80px] bg-white min-h-screen font-sans text-neutral-900 p-4">
      {children}
    </div>
  );
}
