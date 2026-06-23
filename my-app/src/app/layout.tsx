import type { Metadata, Viewport } from "next";
import { Lora, Cherry_Bomb_One, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RentGF",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${lora.variable} ${cherryBomb.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text">
        <RootClientLayout>{children}</RootClientLayout>
        {process.env.NEXT_PUBLIC_PWA_ENABLED === 'true' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(function(reg) {
                    if (reg.active) reg.active.postMessage({ type: 'PWA_ENABLE' });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

