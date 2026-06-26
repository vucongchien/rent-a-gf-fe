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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Mỗi Bước Một Duyên";
const DEFAULT_TITLE = "Mỗi Bước Một Duyên · Sổ tay hẹn hò";
const DEFAULT_DESCRIPTION =
  "Nền tảng đặt lịch hẹn hò cùng người đồng hành — tìm bạn gái, lên kịch bản hẹn và thanh toán an toàn bằng Kano-Coin.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s · Mỗi Bước Một Duyên",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RentGF",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/SEO_APP.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/SEO_APP.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
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
