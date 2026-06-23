'use client';

import React, { useRef, useState } from 'react';
import { Button, type ButtonProps } from '@/shared/components/atoms/Button';
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
  variant?: ButtonProps['variant'];
  className?: string;
}

export async function probeAudioDuration(file: File): Promise<number | undefined> {
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

export const useMediaUpload = () => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const uploadFile = async (file: File, assetType: MediaAssetType): Promise<string | null> => {
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
        return null;
      }

      const presign = await requestUploadUrlAction({
        assetType,
        sizeBytes: file.size,
        durationSeconds,
        contentType: file.type,
      });
      if (presign.status !== 'success' || !presign.data) {
        toast({ message: presign.status === 'error' ? presign.message : 'Không lấy được upload URL.' });
        return null;
      }
      const { uploadUrl, fileUrl } = presign.data as PresignResult;

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: file.type ? { 'Content-Type': file.type } : undefined,
        body: file,
      });
      if (!putRes.ok && !uploadUrl.includes('mock-')) {
        toast({ message: `Tải lên thất bại (${putRes.status}).` });
        return null;
      }

      toast({ message: 'Tải lên thành công.' });
      return fileUrl;
    } catch (err) {
      console.error('[useMediaUpload]', err);
      toast({ message: 'Có lỗi khi tải lên. Vui lòng thử lại.' });
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { uploadFile, busy };
};

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  assetType,
  label,
  accept,
  onUploaded,
  disabled,
  variant = 'outline',
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, busy } = useMediaUpload();

  const handleFile = async (file: File) => {
    const fileUrl = await uploadFile(file, assetType);
    if (fileUrl) {
      onUploaded(fileUrl);
    }
    if (inputRef.current) inputRef.current.value = '';
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
        variant={variant}
        size="sm"
        disabled={busy || disabled}
        className={className}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? 'Đang tải...' : label}
      </Button>
    </>
  );
};
