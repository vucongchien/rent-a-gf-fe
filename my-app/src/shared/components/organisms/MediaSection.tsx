'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { MediaUploader, useMediaUpload } from '@/shared/components/molecules/MediaUploader';
import { VoiceRecorder } from '@/shared/components/molecules/VoiceRecorder';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { updateProfileAction } from '@/app/(companion)/dashboard/profile/actions';
import type { CompanionProfileMe } from '@/shared/types/companion';

interface MediaSectionProps {
  initial: CompanionProfileMe;
}

const MAX_ALBUM = 10;

export const MediaSection: React.FC<MediaSectionProps> = ({ initial }) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? '');
  const [album, setAlbum] = useState<string[]>(initial.albumUrls ?? []);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(initial.voiceIntroUrl ?? null);
  const [isPending, startTransition] = useTransition();

  const [isDragging, setIsDragging] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const { uploadFile, busy: isUploading } = useMediaUpload();

  const persist = (next: { avatarUrl?: string; album?: string[]; voiceUrl?: string | null }) => {
    const fd = new FormData();
    fd.set('displayName', initial.displayName);
    fd.set('biography', initial.biography ?? '');
    for (const c of initial.availableCities ?? []) fd.append('availableCities', c);
    fd.set('avatarUrl', next.avatarUrl ?? avatarUrl);
    for (const u of next.album ?? album) fd.append('albumUrls', u);
    const v = next.voiceUrl === undefined ? voiceUrl : next.voiceUrl;
    if (v) fd.set('voiceIntroUrl', v);
    else fd.set('voiceIntroUrl', '');

    startTransition(async () => {
      const res = await updateProfileAction({ status: 'idle' }, fd);
      if (res.status === 'error') {
        toast({ message: res.message });
      }
    });
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-4 space-y-4">
      <h2 className="font-sans font-bold text-[14px] text-neutral-900">Hình ảnh & Âm thanh</h2>

      {/* Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-200">
          {avatarUrl && (
            <Image src={avatarUrl} alt="Avatar" fill sizes="64px" className="object-cover" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-sans font-medium text-[12.5px] text-neutral-700 mb-1">Ảnh đại diện</p>
          <p className="font-sans text-[11px] text-neutral-400 mb-2">≤ 2MB (INV-P05)</p>
          <MediaUploader
            assetType="IMAGE"
            label="Đổi ảnh"
            accept="image/*"
            disabled={isPending}
            variant="accent-flat"
            className="h-8 px-3.5 text-xs font-bold rounded-lg"
            onUploaded={(url) => {
              setAvatarUrl(url);
              persist({ avatarUrl: url });
            }}
          />
        </div>
      </div>

      {/* Album */}
      <div
        className={`relative rounded-xl border transition-all ${
          isDragging
            ? 'border-dashed border-mami-400 bg-mami-50/20'
            : 'border-transparent'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          if (album.length < MAX_ALBUM && !isPending && !isUploading) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          if (album.length >= MAX_ALBUM || isPending || isUploading) return;

          const files = Array.from(e.dataTransfer.files);
          const imageFiles = files.filter((f) => f.type.startsWith('image/'));

          if (imageFiles.length === 0) return;

          const file = imageFiles[0];
          const fileUrl = await uploadFile(file, 'IMAGE');
          if (fileUrl) {
            const next = [...album, fileUrl];
            setAlbum(next);
            persist({ album: next });
          }
        }}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 rounded-xl border-2 border-dashed border-mami-400 backdrop-blur-xs">
            <span className="text-[24px] mb-1">📸</span>
            <p className="font-sans font-bold text-[13px] text-mami-600">Thả ảnh vào đây để tải lên</p>
            <p className="font-sans text-[11px] text-neutral-400">Tối đa 10 ảnh · ≤ 2MB</p>
          </div>
        )}

        <div className="py-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-sans font-medium text-[12.5px] text-neutral-700">
              Album ({album.length}/{MAX_ALBUM})
            </p>
            <div className="flex items-center gap-2">
              {isUploading && (
                <span className="font-sans text-[11px] text-neutral-400 animate-pulse">
                  Đang tải lên...
                </span>
              )}
              <MediaUploader
                assetType="IMAGE"
                label="+ Thêm ảnh"
                accept="image/*"
                disabled={isPending || isUploading || album.length >= MAX_ALBUM}
                variant="accent-flat"
                className="h-9 px-4 text-[12.5px] font-bold rounded-xl"
                onUploaded={(url) => {
                  const next = [...album, url];
                  setAlbum(next);
                  persist({ album: next });
                }}
              />
            </div>
          </div>
          {album.length === 0 ? (
            <p className="font-sans text-[12px] text-neutral-400 italic py-2">
              Chưa có ảnh nào. Kéo thả hình ảnh vào đây để thêm.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {album.map((url) => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-200 group">
                  <Image src={url} alt="Album" fill sizes="100px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const next = album.filter((u) => u !== url);
                      setAlbum(next);
                      persist({ album: next });
                    }}
                    className="absolute top-1.5 right-1.5 w-8 h-8 rounded-[9px] border border-neutral-200 bg-white text-neutral-500 hover:border-rose-500 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 shadow-sm"
                    title="Xóa ảnh"
                  >
                    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-2 fill-none">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice intro */}
      <div className="space-y-2 pt-2 border-t border-neutral-100">
        <div>
          <p className="font-sans font-medium text-[12.5px] text-neutral-700 mb-0.5">Voice intro</p>
          <p className="font-sans text-[11px] text-neutral-400">≤ 5MB và ≤ 30 giây (INV-P04)</p>
        </div>
        {voiceUrl ? (
          <div className="flex items-center gap-2">
            <audio controls src={voiceUrl} className="flex-1 h-8" />
            <Button
              type="button"
              variant="unstyled"
              disabled={isPending}
              className="h-8 px-3 text-xs font-semibold text-neutral-400 hover:text-neutral-600 active:scale-95 transition-all cursor-pointer"
              onClick={() => {
                setVoiceUrl(null);
                persist({ voiceUrl: null });
              }}
            >
              Xóa
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <VoiceRecorder
              onRecordingStateChange={setIsRecordingVoice}
              onRecorded={(url) => {
                setVoiceUrl(url);
                persist({ voiceUrl: url });
              }}
              disabled={isPending}
            />
            {!isRecordingVoice && (
              <>
                <span className="font-sans text-xs text-neutral-400 text-center sm:text-left">hoặc</span>
                <MediaUploader
                  assetType="VOICE"
                  label="Tải file lên"
                  accept="audio/*"
                  disabled={isPending}
                  variant="accent-flat"
                  className="h-9 px-4 text-[12.5px] font-bold rounded-xl w-full sm:w-auto"
                  onUploaded={(url) => {
                    setVoiceUrl(url);
                    persist({ voiceUrl: url });
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
