'use client';

import React, { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/atoms/Button';
import { SpinnerIcon, XIcon } from '@/shared/components/atoms/Icons';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { useMediaUpload } from '@/shared/components/molecules/MediaUploader';
import { createDisputeAction } from '@/app/actions/dispute';
import type { DisputeEvidence } from '@/shared/types';

interface DisputeFormProps {
  bookingId: string;
  accusedId: string;
}

interface ReasonOption {
  value: string;
  label: string;
}

/**
 * Reason enum tạm dùng cho UI — SSOT §2.6 mô tả `reason` là string tự do,
 * FE chuẩn hoá thành 5 mã để dễ filter ở admin.
 */
const REASON_OPTIONS: ReasonOption[] = [
  { value: 'NO_SHOW', label: 'Không xuất hiện (no-show)' },
  { value: 'LATE_ARRIVAL', label: 'Đến muộn' },
  { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Hành vi không phù hợp' },
  { value: 'SERVICE_QUALITY', label: 'Chất lượng dịch vụ kém' },
  { value: 'OTHER', label: 'Lý do khác' },
];

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_EVIDENCES = 5;

interface UploadedEvidence extends DisputeEvidence {
  /** Local preview URL (nếu có), revoke khi unmount. */
  previewUrl?: string;
}

export const DisputeForm: React.FC<DisputeFormProps> = ({ bookingId, accusedId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { uploadFile, busy: uploading } = useMediaUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const [reason, setReason] = useState<string>(REASON_OPTIONS[0].value);
  const [description, setDescription] = useState('');
  const [evidences, setEvidences] = useState<UploadedEvidence[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  const handlePickFile = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (evidences.length >= MAX_EVIDENCES) {
      toast({ message: `Tối đa ${MAX_EVIDENCES} ảnh.` });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    const fileUrl = await uploadFile(file, 'IMAGE');
    if (!fileUrl) {
      URL.revokeObjectURL(previewUrl);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setEvidences((prev) => [
      ...prev,
      { evidenceType: 'IMAGE', content: fileUrl, previewUrl },
    ]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeEvidence = (idx: number) => {
    setEvidences((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleSubmit = () => {
    setErrorMsg(null);

    if (!reason) {
      setErrorMsg('Vui lòng chọn lý do.');
      return;
    }

    // Gộp description vào evidences dưới dạng TEXT — type CreateDisputeBody chưa có
    // field `description`, SSOT cho phép evidence type TEXT (§2.6).
    const payloadEvidences: DisputeEvidence[] = [];
    const trimmed = description.trim();
    if (trimmed) {
      payloadEvidences.push({ evidenceType: 'TEXT', content: trimmed });
    }
    for (const ev of evidences) {
      payloadEvidences.push({ evidenceType: ev.evidenceType, content: ev.content });
    }

    startSubmit(async () => {
      const result = await createDisputeAction({
        bookingId,
        accusedId,
        reason,
        evidences: payloadEvidences,
      });
      if (result.status === 'error') {
        setErrorMsg(result.message);
        return;
      }
      toast({ message: 'Đã gửi khiếu nại. Admin sẽ xem xét sớm.' });
      router.push(`/bookings/${bookingId}`);
      router.refresh();
    });
  };

  const canSubmit = !!reason && !uploading && !isSubmitting;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <label
          htmlFor="dispute-reason"
          className="block font-sans font-semibold text-[13.5px] text-neutral-800 mb-2"
        >
          Lý do khiếu nại <span className="text-rose-500">*</span>
        </label>
        <select
          id="dispute-reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 font-sans text-[13.5px] text-neutral-800 focus:outline-none focus:border-chizuru-400 focus:bg-white transition-colors disabled:opacity-60"
        >
          {REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <label
          htmlFor="dispute-description"
          className="block font-sans font-semibold text-[13.5px] text-neutral-800 mb-1"
        >
          Mô tả chi tiết <span className="text-neutral-400 font-normal">(tùy chọn)</span>
        </label>
        <p className="font-sans text-[12px] text-neutral-500 mb-3">
          Mô tả sự việc một cách trung thực để admin có thể đánh giá.
        </p>
        <textarea
          id="dispute-description"
          name="description"
          rows={5}
          maxLength={MAX_DESCRIPTION_LENGTH}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          placeholder="Ví dụ: Đối tác đến muộn 30 phút và rời đi sớm..."
          className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 font-sans text-[13.5px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-chizuru-400 focus:bg-white transition-colors disabled:opacity-60"
        />
        <p className="mt-1.5 text-right font-mono text-[11px] text-neutral-400">
          {description.length}/{MAX_DESCRIPTION_LENGTH}
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-1">
          <label className="font-sans font-semibold text-[13.5px] text-neutral-800">
            Bằng chứng <span className="text-neutral-400 font-normal">(ảnh, tùy chọn)</span>
          </label>
          <span className="font-mono text-[11px] text-neutral-400">
            {evidences.length}/{MAX_EVIDENCES}
          </span>
        </div>
        <p className="font-sans text-[12px] text-neutral-500 mb-3">
          Tối đa {MAX_EVIDENCES} ảnh, mỗi ảnh không quá 2MB.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {evidences.length > 0 && (
          <ul className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {evidences.map((ev, idx) => (
              <li
                key={`${ev.content}-${idx}`}
                className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ev.previewUrl ?? ev.content}
                  alt={`Bằng chứng ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeEvidence(idx)}
                  disabled={isSubmitting}
                  aria-label={`Xoá bằng chứng ${idx + 1}`}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-neutral-900/80 text-white grid place-items-center hover:bg-neutral-900 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <XIcon size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || isSubmitting || evidences.length >= MAX_EVIDENCES}
          onClick={handlePickFile}
        >
          {uploading ? 'Đang tải ảnh...' : 'Thêm ảnh'}
        </Button>
      </section>

      {errorMsg && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 font-sans text-[13px] text-rose-700"
        >
          {errorMsg}
        </p>
      )}

      <div className="flex items-center justify-end gap-2.5">
        <Link
          href={`/bookings/${bookingId}`}
          className="inline-flex items-center h-11 px-5 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[13.5px] border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          Huỷ
        </Link>
        <Button
          variant="unstyled"
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-sans font-semibold text-[13.5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting && <SpinnerIcon size={14} className="animate-spin" />}
          Gửi khiếu nại
        </Button>
      </div>
    </div>
  );
};
