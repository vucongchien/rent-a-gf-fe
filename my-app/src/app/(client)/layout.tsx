import React from 'react';

export default function ClientGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-[20px] md:px-[32px] py-[22px] pb-[80px] bg-white min-h-screen font-sans text-neutral-900 min-w-0">
      {children}
    </div>
  );
}
