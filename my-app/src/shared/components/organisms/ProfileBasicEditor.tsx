'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { CityChipsInput } from '@/shared/components/molecules/CityChipsInput';
import { updateProfileAction } from '@/app/(companion)/dashboard/profile/actions';
import type { CompanionProfileMe } from '@/shared/types/companion';
import type { ActionState } from '@/shared/types';
import { MAX_BIO_LEN, MAX_NAME_LEN } from '@/app/(companion)/dashboard/profile/validation';

interface ProfileBasicEditorProps {
  initial: CompanionProfileMe;
}

const initialState: ActionState<CompanionProfileMe> = { status: 'idle' };

export const ProfileBasicEditor: React.FC<ProfileBasicEditorProps> = ({ initial }) => {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  // Form-controlled state (so we can mark dirty + render city chips inline)
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [biography, setBiography] = useState(initial.biography ?? '');
  const [cities, setCities] = useState<string[]>(initial.availableCities ?? []);

  const dirty =
    displayName !== initial.displayName ||
    biography !== (initial.biography ?? '') ||
    JSON.stringify(cities) !== JSON.stringify(initial.availableCities ?? []);

  const fieldErrors = state.status === 'error' ? state.fieldErrors ?? {} : {};

  useEffect(() => {
    if (state.status === 'success') {
      toast({ message: state.message ?? 'Đã lưu thay đổi.' });
    } else if (state.status === 'error' && !state.fieldErrors) {
      toast({ message: state.message });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <section className="rounded-2xl border border-neutral-200 bg-surface p-4 space-y-4">
        <h2 className="font-sans font-bold text-[14px] text-neutral-900">Thông tin cơ bản</h2>

        <Field label="Tên hiển thị" error={fieldErrors.displayName} hint={`${displayName.length}/${MAX_NAME_LEN}`}>
          <input
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={MAX_NAME_LEN}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none font-sans text-[14px]"
            data-invalid={!!fieldErrors.displayName}
          />
        </Field>

        <Field label="Tiểu sử" error={fieldErrors.biography} hint={`${biography.length}/${MAX_BIO_LEN}`}>
          <textarea
            name="biography"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            maxLength={MAX_BIO_LEN}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none font-sans text-[13.5px] resize-y"
          />
        </Field>

        <Field label="Thành phố hoạt động" error={fieldErrors.availableCities}>
          <CityChipsInput name="availableCities" value={cities} onChange={setCities} />
        </Field>
      </section>

      {/* Pass through media fields unchanged for now (Step 4 sẽ replace bằng MediaSection thật) */}
      <input type="hidden" name="avatarUrl" value={initial.avatarUrl ?? ''} />
      {(initial.albumUrls ?? []).map((url) => (
        <input key={url} type="hidden" name="albumUrls" value={url} />
      ))}
      {initial.voiceIntroUrl && (
        <input type="hidden" name="voiceIntroUrl" value={initial.voiceIntroUrl} />
      )}

      <div className="sticky bottom-0 bg-surface/95 backdrop-blur py-3 -mx-4 px-4 border-t border-neutral-200">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!dirty || isPending}
          className="w-full"
        >
          {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
};

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-sans font-medium text-[12.5px] text-neutral-700">{label}</span>
        {hint && <span className="font-sans text-[11px] text-neutral-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1 font-sans text-[11.5px] text-rose-600" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
