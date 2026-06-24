"use client";

import React from "react";
import { Button } from "@/shared/components/atoms/Button";
import { Typography } from "@/shared/components/atoms/Typography";
import { MediaSlot } from "@/shared/components/atoms/MediaSlot";
import { VoiceButton } from "@/shared/components/atoms/VoiceButton";
import { LikeButton } from "@/shared/components/atoms/LikeButton";
import { StatusBadge } from "@/shared/components/atoms/StatusBadge";
import { ToastProvider, useToast } from "@/shared/components/atoms/ToastNotification";
import { BookingForm } from "@/shared/components/molecules/BookingForm";
import { ScenesSelectorClient } from "@/app/(marketing)/explore/[companionId]/components/ScenesSelectorClient";
import { useWallet } from "@/shared/contexts/WalletContext";
import { useAuth } from "@/shared/contexts/AuthContext";
import { WipeReveal } from "@/shared/components/atoms/WipeReveal";

function DesignSystemContent() {
  const { toast } = useToast();
  const [isLikedDemo, setIsLikedDemo] = React.useState(false);
  const [isLikedDemoUncontrolled, setIsLikedDemoUncontrolled] = React.useState(false);
  const [replayKey, setReplayKey] = React.useState(0);
  
  const { balance, topup } = useWallet();
  const { user, logout } = useAuth();

  const handleShowToast = () => {
    toast({
      message: "Nice! We'll set up a meet-and-greet with <em>Mochi</em> 🐾",
      duration: 2600,
    });
  };

  return (
    <div className="min-h-screen py-12 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
            Rent-a-Girlfriend FE Architecture
          </span>
          <Typography variant="h1" font="display" className="text-rose-950 font-extrabold text-5xl tracking-tight">
            Design Tokens & UI System
          </Typography>
          <Typography variant="body1" className="text-neutral-500 leading-relaxed">
            Hệ thống Design Tokens tinh gọn, mang đậm phong cách pastel ngọt ngào, lãng mạn từ bộ ảnh gốc của Rent-a-Girlfriend.
          </Typography>
        </div>

        {/* 1. Color System */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-brand rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              1. Bảng Màu Nhân Vật (Pastel Palette)
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <ColorSwatch 
              name="Chizuru (Brand)" 
              sub="Hồng ngọt ngào" 
              hex="#FFB6C1"
              className="bg-brand text-rose-950" 
            />
            <ColorSwatch 
              name="Ruka (Secondary)" 
              sub="Xanh Mint tươi trẻ" 
              hex="#88D8C0"
              className="bg-secondary text-emerald-950" 
            />
            <ColorSwatch 
              name="Mami (Accent)" 
              sub="Vàng nhạt năng động" 
              hex="#FCE883"
              className="bg-accent text-amber-950" 
            />
            <ColorSwatch 
              name="Sumi (Pink)" 
              sub="Hồng tím dịu dàng" 
              hex="#FF91A4"
              className="bg-sumi-500 text-rose-950" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <ColorSwatch 
              name="Surface White" 
              sub="Trắng tinh khiết" 
              hex="#FFFFFF"
              className="bg-surface text-neutral-800 border border-neutral-200" 
            />
            <ColorSwatch 
              name="Surface Muted" 
              sub="Nền xám nhạt tối giản" 
              hex="#FAFAFA"
              className="bg-surface-muted text-neutral-800 border border-neutral-200" 
            />
            <ColorSwatch 
              name="Surface Inverted" 
              sub="Màu tối tương phản" 
              hex="#171717"
              className="bg-surface-inverted text-white" 
            />
          </div>
        </section>

        {/* 2. Typography */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-secondary rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              2. Kiểu Chữ (Typography)
            </Typography>
          </div>
          
          <div className="space-y-6 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono">Font: Lora (Default Sans/Serif)</span>
              <Typography variant="h1" className="text-neutral-900 font-extrabold">
                Heading 1 (Lora Main Typography)
              </Typography>
            </div>
            <hr className="border-neutral-50" />
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono">Font: Cherry Bomb One (Display / Anime Sticker)</span>
              <Typography variant="h1" font="display" className="text-rose-500 text-stroke-black text-shadow-pop tracking-wider font-normal">
                Kanojo, Okarishimasu! ⭐
              </Typography>
            </div>
            <hr className="border-neutral-50" />
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono">Font: Lora (Default Sans/Serif)</span>
              <Typography variant="h2" className="text-neutral-900 font-semibold">
                Heading 2 (Lora Main Typography)
              </Typography>
            </div>
            <hr className="border-neutral-50" />
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono">Font: Lora</span>
              <Typography variant="body1" className="text-neutral-700">
                Body 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Typography>
            </div>
            <hr className="border-neutral-50" />
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono">Font: Geist Mono</span>
              <Typography variant="caption" font="mono" className="text-rose-600 block">
                Caption Mono: System and interactive status messages.
              </Typography>
            </div>
          </div>
        </section>

        {/* 3. Atomic Buttons */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-accent rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              3. Nút Bấm Atom (3D Solid Shadow)
            </Typography>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-8">
            <div className="space-y-4">
              <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                Variants (Được tinh chỉnh theo style 3D neobrutalism mượt mà)
              </Typography>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary (Brand Pink)</Button>
                <Button variant="secondary">Secondary (Teal)</Button>
                <Button variant="accent">Accent (Yellow)</Button>
                <Button variant="outline">Outline (White Ink)</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
            </div>

            <hr className="border-neutral-50" />

            <div className="space-y-4">
              <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                Sizes
              </Typography>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" size="sm">Small Act</Button>
                <Button variant="primary" size="md">Medium Classic</Button>
                <Button variant="primary" size="lg">Large Premium</Button>
              </div>
            </div>

            <hr className="border-neutral-50" />

            <div className="space-y-4">
              <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                States
              </Typography>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" disabled>Primary Disabled</Button>
                <Button variant="outline" disabled>Outline Disabled</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Media, Badges, and Likes */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-brand rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              4. Media, Status Badges & Interaction
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Swatches / Badges */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
              <div>
                <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs mb-3">
                  Status Badges (Pill shape neobrutalism)
                </Typography>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge variant="online" />
                  <StatusBadge variant="offline" />
                  <StatusBadge variant="available" />
                  <StatusBadge variant="booked" />
                  <StatusBadge variant="sale" />
                  <StatusBadge variant="adopt" />
                </div>
              </div>

              <hr className="border-neutral-50" />

              <div>
                <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs mb-3">
                  Like Buttons (Spring bounce active state)
                </Typography>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-neutral-400 block mb-1">Uncontrolled (Click me)</span>
                    <LikeButton isLiked={isLikedDemoUncontrolled} onToggle={setIsLikedDemoUncontrolled} />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 block mb-1">Controlled (Sync state)</span>
                    <div className="flex items-center gap-2">
                      <LikeButton isLiked={isLikedDemo} onToggle={setIsLikedDemo} />
                      <span className="text-xs font-mono text-neutral-500">
                        {isLikedDemo ? "LIKED" : "UNLIKED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-neutral-50" />

              <div>
                <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs mb-3">
                  Toast Notification Trigger
                </Typography>
                <Button variant="outline" onClick={handleShowToast}>
                  Show Interactive Toast
                </Button>
              </div>
            </div>

            {/* Media Slots (Checkerboards) */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
              <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                MediaSlot & Image Placeholders (Checkerboards)
              </Typography>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Pink Tint (Aspect 1/1)</span>
                  <MediaSlot tint="pink" placeholder="Drop companion photo 🌸" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Blue Tint (Aspect 4/3.4)</span>
                  <MediaSlot aspectRatio="4/3.4" tint="blue" placeholder="Ruka Profile 🌊" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Lime Tint</span>
                  <MediaSlot tint="lime" placeholder="Mami Photo ⭐" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Neutral Tint</span>
                  <MediaSlot tint="neutral" placeholder="Default Image 📷" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Sound Engine & Soundboard */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-secondary rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              5. Audio Engine & Soundboard (No overlap playing)
            </Typography>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
              <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                Voice Buttons (Pill buttons play URL audio with animated EQ wave)
              </Typography>
              <div className="flex flex-wrap gap-4 items-center">
                <VoiceButton 
                  soundUrl="https://assets.mixkit.co/active_storage/sfx/951/951-200.wav" 
                  label="Hear Meow (Pink)" 
                />
                <VoiceButton 
                  soundUrl="https://assets.mixkit.co/active_storage/sfx/2770/2770-200.wav" 
                  label="Hear Bark (Mini)" 
                  size="mini" 
                />
                <VoiceButton 
                  soundUrl="https://assets.mixkit.co/active_storage/sfx/2437/2437-200.wav" 
                  label="Hear Chirp" 
                />
              </div>
              <p className="text-xs text-neutral-400 italic">
                * Mẹo: Nhấn nút bất kì khi nút khác đang phát để thấy âm thanh chuyển đổi mượt mà không chồng chéo.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Booking Form Interactive Test */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-rose-500 rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              6. Demo Đặt Lịch Hẹn (Interactive Booking Form Test)
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8 items-start">
            {/* Form Demo */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
              <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs mb-4">
                Interactive Booking Form (Step 1 &rarr; Step 2)
              </Typography>
              
              <div className="max-w-md mx-auto p-8 rounded-2xl bg-[--color-cream] shadow-[0_6px_18px_rgba(74,54,30,0.12)] border border-neutral-100/50">
                <BookingForm
                  companionId="comp-demo"
                  companionName="Chizuru Ichinose"
                  scenarioId="sc-demo"
                  scenarioName="Hẹn hò công viên hoàng hôn 🌅"
                  priceInCoin={150}
                  durationMinutes={60}
                />
              </div>
            </div>

            {/* Wallet & Auth Control Panel */}
            <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 space-y-6">
              <Typography variant="body2" font="mono" className="text-neutral-700 font-bold uppercase tracking-wider text-xs">
                ⚙️ Bảng điều khiển Mock (Test Tool)
              </Typography>

              {/* Wallet Info */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                <h4 className="font-sans font-bold text-xs text-neutral-500">THÔNG TIN VÍ TIỀN</h4>
                <div className="flex justify-between text-sm">
                  <span>Số dư:</span>
                  <span className="font-bold text-brand">{balance} Coin</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs py-1" onClick={() => topup(100)}>
                    +100 Coin
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs py-1" onClick={() => topup(500)}>
                    +500 Coin
                  </Button>
                </div>
              </div>

              {/* Auth Info */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                <h4 className="font-sans font-bold text-xs text-neutral-500">THÔNG TIN TÀI KHOẢN</h4>
                <div className="text-sm">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>User:</span>
                        <span className="font-bold text-neutral-800">{user.displayName}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full text-xs text-rose-500" onClick={() => logout()}>
                        Đăng xuất (Logout)
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-neutral-400 italic text-xs">Chưa đăng nhập tài khoản</div>
                      <Button variant="primary" size="sm" className="w-full text-xs" onClick={() => window.location.href = '/login'}>
                        Đăng nhập (Google OAuth)
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 leading-relaxed bg-neutral-100/50 p-3 rounded-xl border border-dashed border-neutral-200">
                💡 <b>Mẹo test:</b> Hãy nạp thử Coin hoặc Đăng xuất để xem Booking Form tự động thay đổi giao diện ở bước 2 dựa theo trạng thái tài khoản của bạn.
              </div>
            </div>
          </div>
        </section>

        {/* 7. Scenes Selector Interactive Test */}
        <section className="space-y-6 pb-24">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-teal-500 rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              7. Demo Bộ Chọn Kịch Bản (ScenesSelectorClient Test)
            </Typography>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
            <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs mb-4">
              Interactive Scenes Selector (Click chọn kịch bản để thấy BookingBar ở dưới)
            </Typography>
            
            <div className="p-6 rounded-3xl bg-[--color-cream] border border-neutral-100/50">
              <ScenesSelectorClient
                companionId="comp-demo"
                companionName="Chizuru Ichinose"
                scenarios={mockScenariosForDemo}
              />
            </div>
          </div>
        </section>

        {/* 8. Hiệu ứng quét xuất hiện dần WipeReveal */}
        <section className="space-y-6 pb-24">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
            <span className="w-2.5 h-6 bg-rose-500 rounded-full"></span>
            <Typography variant="h3" className="text-neutral-900 font-bold">
              8. Hiệu ứng WipeReveal (Mép Mờ, Mép Sắc Nét, Vệt Sáng & Hoa Anh Đào Bay)
            </Typography>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
            <Typography variant="body2" className="text-neutral-500">
              Hiệu ứng WipeReveal tự động quét nội dung từ trái qua phải ngay khi load trang. Phiên bản nâng cấp hỗ trợ vệt sáng quét qua (Glow Shimmer Line) và **Hoa Anh Đào vẽ tay phong cách màu nước (watercolor)** trượt và xoay tròn bay theo chiều gió, tự động làm mờ (fade out) sau khi hoàn tất.
            </Typography>

            <div className="flex flex-col space-y-6">
              <div>
                <Button onClick={() => setReplayKey(prev => prev + 1)} variant="outline" size="sm">
                  Chạy lại hiệu ứng 🔄
                </Button>
              </div>

              <div key={replayKey} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-3xl bg-[--color-cream] border border-neutral-100/50">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                      Mép Mờ + Glow Hồng + Hoa Anh Đào Bay (showIcon)
                    </Typography>
                    
                    <WipeReveal variant="feathered" duration={1} delay={0.1} glowColor="var(--color-chizuru-500)" showIcon={true} iconSize={28}>
                      <div className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm space-y-2">
                        <Typography variant="h4" className="text-rose-600 font-bold">
                          Chizuru Ichinose
                        </Typography>
                        <Typography variant="body2" className="text-neutral-500">
                          &quot;Hẹn hò với tôi, bạn sẽ nhận được 100% sự lãng mạn thực sự.&quot;
                        </Typography>
                      </div>
                    </WipeReveal>
                  </div>

                  <div className="space-y-2">
                    <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                      Tiêu đề Lớn + Glow Hồng Đậm + Hoa Anh Đào Lớn (iconSize=36)
                    </Typography>
                    <WipeReveal variant="feathered" duration={1.5} delay={0.3} glowColor="var(--color-chizuru-600)" showIcon={true} iconSize={36}>
                      <Typography variant="h1" font="display" className="text-rose-500 text-stroke-black text-shadow-pop">
                        Kanojo, Okarishimasu!
                      </Typography>
                    </WipeReveal>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                      Mép Sắc Nét + Glow Xanh Ruka + Hoa Anh Đào Bay
                    </Typography>

                    <WipeReveal variant="sharp" duration={1} delay={0.1} glowColor="var(--color-ruka-500)" showIcon={true} iconSize={28}>
                      <div className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm space-y-2">
                        <Typography variant="h4" className="text-emerald-600 font-bold">
                          Ruka Sarashina
                        </Typography>
                        <Typography variant="body2" className="text-neutral-500">
                          &quot;Nhịp tim của em chỉ đập nhanh hơn khi ở bên cạnh anh thôi!&quot;
                        </Typography>
                      </div>
                    </WipeReveal>
                  </div>

                  <div className="space-y-2">
                    <Typography variant="body2" font="mono" className="text-neutral-400 uppercase tracking-wider text-xs">
                      Mép Mờ Không Có Vệt Sáng & Icon (enableGlow/showIcon = false)
                    </Typography>

                    <WipeReveal variant="feathered" duration={1} delay={0.3} enableGlow={false} showIcon={false}>
                      <div className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm space-y-2">
                        <Typography variant="h4" className="text-neutral-700 font-bold">
                          Sumi Sakurasawa
                        </Typography>
                        <Typography variant="body2" className="text-neutral-500">
                          (Dịu dàng cúi đầu và mỉm cười nhẹ nhàng...)
                        </Typography>
                      </div>
                    </WipeReveal>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

const mockScenariosForDemo = [
  {
    scenarioId: "sc-ds-1",
    title: "Cà phê buổi sáng yên tĩnh ☕",
    description: "Nhâm nhi tách cà phê thơm và cùng nhau trò chuyện về sở thích của cả hai.",
    durationMinutes: 60,
    price: 100,
    publicPlace: "Khu Thảo Điền, Quận 2",
  },
  {
    scenarioId: "sc-ds-2",
    title: "Dạo quanh Hồ Gươm chiều thu 🍂",
    description: "Cùng đi dạo dưới làn gió thu dịu mát, ngắm nhìn tháp Rùa và thưởng thức kem Tràng Tiền.",
    durationMinutes: 120,
    price: 250,
    publicPlace: "Hoàn Kiếm, Hà Nội",
  },
  {
    scenarioId: "sc-ds-3",
    title: "Hẹn hò rạp chiếu phim lãng mạn 🍿",
    description: "Cùng xem một bộ phim tình cảm hot nhất, chia sẻ hộp bắp rang bơ ngọt ngào.",
    durationMinutes: 150,
    price: 350,
    publicPlace: "CGV Vincom Landmark 81",
  }
];

export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  );
}

interface SwatchProps {
  name: string;
  sub: string;
  hex: string;
  className?: string;
}

function ColorSwatch({ name, sub, hex, className = "" }: SwatchProps) {
  return (
    <div className={`p-5 rounded-3xl shadow-sm h-32 flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-pointer ${className}`}>
      <div className="space-y-1">
        <div className="font-bold text-sm tracking-wide">{name}</div>
        <div className="text-[10px] opacity-75 leading-none">{sub}</div>
      </div>
      <div className="font-mono text-xs font-semibold opacity-90 text-right">{hex}</div>
    </div>
  );
}
