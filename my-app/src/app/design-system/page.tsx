"use client";

import React from "react";
import { Button } from "@/shared/components/atoms/Button";
import { Typography } from "@/shared/components/atoms/Typography";
import { MediaSlot } from "@/shared/components/atoms/MediaSlot";
import { VoiceButton } from "@/shared/components/atoms/VoiceButton";
import { LikeButton } from "@/shared/components/atoms/LikeButton";
import { StatusBadge } from "@/shared/components/atoms/StatusBadge";
import { ToastProvider, useToast } from "@/shared/components/atoms/ToastNotification";

function DesignSystemContent() {
  const { toast } = useToast();
  const [isLikedDemo, setIsLikedDemo] = React.useState(false);
  const [isLikedDemoUncontrolled, setIsLikedDemoUncontrolled] = React.useState(false);

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

      </div>
    </div>
  );
}

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
