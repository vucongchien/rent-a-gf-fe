import type { Metadata } from "next";
import { Lora, Cherry_Bomb_One, Geist_Mono } from "next/font/google";
import { MockProvider } from "@/mocks/components/MockProvider";
import "./globals.css";

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
        <MockProvider>{children}</MockProvider>
      </body>
    </html>
  );
}
