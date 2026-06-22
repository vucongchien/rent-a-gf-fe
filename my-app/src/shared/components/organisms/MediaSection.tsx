'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { MediaUploader } from '@/shared/components/molecules/MediaUploader';
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
            onUploaded={(url) => {
              setAvatarUrl(url);
              persist({ avatarUrl: url });
            }}
          />
        </div>
      </div>

      {/* Album */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-sans font-medium text-[12.5px] text-neutral-700">
            Album ({album.length}/{MAX_ALBUM})
          </p>
          <MediaUploader
            assetType="IMAGE"
            label="+ Thêm ảnh"
            accept="image/*"
            disabled={isPending || album.length >= MAX_ALBUM}
            onUploaded={(url) => {
              const next = [...album, url];
              setAlbum(next);
              persist({ album: next });
            }}
          />
        </div>
        {album.length === 0 ? (
          <p className="font-sans text-[12px] text-neutral-400 italic">Chưa có ảnh nào.</p>
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
                  className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice intro */}
      <div>
        <p className="font-sans font-medium text-[12.5px] text-neutral-700 mb-1">Voice intro</p>
        <p className="font-sans text-[11px] text-neutral-400 mb-2">≤ 5MB và ≤ 30 giây (INV-P04)</p>
        {voiceUrl ? (
          <div className="flex items-center gap-2">
            <audio controls src={voiceUrl} className="flex-1 h-8" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => {
                setVoiceUrl(null);
                persist({ voiceUrl: null });
              }}
            >
              Xóa
            </Button>
          </div>
        ) : (
          <MediaUploader
            assetType="VOICE"
            label="Tải voice"
            accept="audio/*"
            disabled={isPending}
            onUploaded={(url) => {
              setVoiceUrl(url);
              persist({ voiceUrl: url });
            }}
          />
        )}
      </div>
    </section>
  );
};
