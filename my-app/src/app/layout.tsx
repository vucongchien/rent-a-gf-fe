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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                const register = function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      console.log('ServiceWorker registered with scope: ', reg.scope);
                    })
                    .catch(function(err) {
                      console.error('ServiceWorker registration failed: ', err);
                    });
                };
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                  register();
                } else {
                  window.addEventListener('load', register);
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

