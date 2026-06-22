'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import {
  requestUploadUrlAction,
  type PresignResult,
} from '@/app/(companion)/dashboard/profile/actions';
import {
  validateMediaMeta,
  type MediaAssetType,
} from '@/app/(companion)/dashboard/profile/validation';

interface MediaUploaderProps {
  assetType: MediaAssetType;
  label: string;
  accept: string;
  onUploaded: (fileUrl: string) => void;
  disabled?: boolean;
}

async function probeAudioDuration(file: File): Promise<number | undefined> {
  if (typeof window === 'undefined') return undefined;
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const d = audio.duration;
      URL.revokeObjectURL(audio.src);
      resolve(Number.isFinite(d) ? d : undefined);
    };
    audio.onerror = () => resolve(undefined);
    audio.src = URL.createObjectURL(file);
  });
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  assetType,
  label,
  accept,
  onUploaded,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const durationSeconds = assetType === 'VOICE' ? await probeAudioDuration(file) : undefined;

      const localCheck = validateMediaMeta({
        assetType,
        sizeBytes: file.size,
        durationSeconds,
        contentType: file.type,
      });
      if (!localCheck.ok) {
        const first = Object.values(localCheck.fieldErrors)[0] ?? 'File không hợp lệ.';
        toast({ message: first });
        return;
      }

      const presign = await requestUploadUrlAction({
        assetType,
        sizeBytes: file.size,
        durationSeconds,
        contentType: file.type,
      });
      if (presign.status !== 'success' || !presign.data) {
        toast({ message: presign.status === 'error' ? presign.message : 'Không lấy được upload URL.' });
        return;
      }
      const { uploadUrl, fileUrl } = presign.data as PresignResult;

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: file.type ? { 'Content-Type': file.type } : undefined,
        body: file,
      });
      if (!putRes.ok && !uploadUrl.includes('mock-')) {
        toast({ message: `Tải lên thất bại (${putRes.status}).` });
        return;
      }

      onUploaded(fileUrl);
      toast({ message: 'Tải lên thành công.' });
    } catch (err) {
      console.error('[MediaUploader]', err);
      toast({ message: 'Có lỗi khi tải lên. Vui lòng thử lại.' });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy || disabled}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? 'Đang tải...' : label}
      </Button>
    </>
  );
};
