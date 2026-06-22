'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { useMediaUpload } from './MediaUploader';
import { MicIcon } from '../atoms/Icons';

interface VoiceRecorderProps {
  onRecorded: (fileUrl: string) => void;
  disabled?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecorded,
  disabled,
  onRecordingStateChange,
}) => {
  const { toast } = useToast();
  const { uploadFile, busy: isUploading } = useMediaUpload();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const shouldSaveRef = useRef<boolean>(true);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    chunksRef.current = [];
    shouldSaveRef.current = true;
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Dọn dẹp stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (!shouldSaveRef.current) {
          return;
        }

        // Tạo file từ chunks
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        if (blob.size === 0) {
          toast({ message: 'Ghi âm trống, vui lòng thử lại.' });
          return;
        }

        const file = new File([blob], 'voice-intro.mp3', { type: 'audio/mp3' });
        const fileUrl = await uploadFile(file, 'VOICE');
        if (fileUrl) {
          onRecorded(fileUrl);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      onRecordingStateChange?.(true);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => {
          if (prev >= 29) {
            // Đạt tối đa 30 giây -> dừng ghi âm
            stopRecording(true);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('[VoiceRecorder] Lỗi truy cập mic:', err);
      toast({ message: 'Không thể truy cập micro. Vui lòng kiểm tra quyền thiết bị.' });
    }
  };

  const stopRecording = (save = true) => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    shouldSaveRef.current = save;
    setIsRecording(false);
    onRecordingStateChange?.(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    stopRecording(false);
    toast({ message: 'Đã hủy bản ghi âm.' });
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 bg-mami-50/50 border border-mami-600 rounded-xl p-3 font-sans w-full sm:max-w-sm shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mami-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mami-500"></span>
          </span>
          <span className="font-mono text-[13px] font-bold text-neutral-900">
            {formatTime(duration)} / 00:30
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            type="button"
            variant="accent-flat"
            className="h-8 px-3 rounded-lg text-xs font-bold"
            onClick={() => stopRecording(true)}
            disabled={isUploading}
          >
            Dừng & Lưu
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 rounded-lg text-xs text-neutral-900 hover:text-mami-600"
            onClick={cancelRecording}
            disabled={isUploading}
          >
            Hủy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="accent-flat"
      disabled={disabled || isUploading}
      onClick={startRecording}
      className="h-9 px-4 text-[12.5px] rounded-xl flex items-center gap-1.5 w-full sm:w-auto"
    >
      <MicIcon/>
      {isUploading ? 'Đang tải bản ghi...' : 'Ghi âm trực tiếp'}
    </Button>
  );
};
