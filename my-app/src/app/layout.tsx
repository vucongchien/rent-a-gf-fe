import type { Metadata } from "next";
import { Lora, Cherry_Bomb_One, Geist_Mono } from "next/font/google";
import { authService } from "@/shared/services/authService";
import "./globals.css";
import React, { Suspense } from "react";

import RootClientLayout from "./RootClientLayout";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
});

const cherryBomb = Cherry_Bomb_One({
  weight: "400",
  variable: "--font-cherry-bomb",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rent-a-Girlfriend",
  description: "Companion booking platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userResponse = await authService.getMe().catch((err) => {
    console.error("[RootLayout] Lỗi lấy thông tin user me từ server:", err);
    return { data: null };
  });
  const user = userResponse?.data || null;

  return (
    <html
      lang="vi"
      className={`${lora.variable} ${cherryBomb.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text">
        <Suspense fallback={null}>
          <RootClientLayout initialUser={user}>{children}</RootClientLayout>
        </Suspense>
      </body>
    </html>
  );
}

