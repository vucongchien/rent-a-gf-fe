'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { CloseButton } from '@/shared/components/atoms/CloseButton';
import {
  DURATION_OPTIONS,
  MAX_SCENARIO_DESC_LEN,
  MAX_SCENARIO_TITLE_LEN,
  validateScenario,
  type ScenarioInput,
} from '@/app/(companion)/dashboard/profile/validation';
import type { CompanionScenario } from '@/shared/types/companion';

interface ScenarioFormModalProps {
  initial?: CompanionScenario;
  onSubmit: (input: ScenarioInput) => Promise<void> | void;
  onClose: () => void;
  submitting?: boolean;
}

const DEFAULTS: ScenarioInput = {
  title: '',
  description: '',
  price: 100,
  durationMinutes: 60,
};

export const ScenarioFormModal: React.FC<ScenarioFormModalProps> = ({
  initial,
  onSubmit,
  onClose,
  submitting,
}) => {
  const [form, setForm] = useState<ScenarioInput>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          price: initial.price,
          durationMinutes: initial.durationMinutes,
        }
      : DEFAULTS,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateScenario(form);
    if (!v.ok) {
      setErrors(v.fieldErrors);
      return;
    }
    setErrors({});
    await onSubmit(v.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-[15px] text-neutral-900">
            {initial ? 'Sửa kịch bản' : 'Tạo kịch bản mới'}
          </h2>
          <CloseButton onClose={onClose} aria-label="Đóng" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Tiêu đề" error={errors.title} hint={`${form.title.length}/${MAX_SCENARIO_TITLE_LEN}`}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={MAX_SCENARIO_TITLE_LEN}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none font-sans text-[14px]"
            />
          </Field>

          <Field label="Mô tả" error={errors.description} hint={`${form.description.length}/${MAX_SCENARIO_DESC_LEN}`}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={MAX_SCENARIO_DESC_LEN}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none font-sans text-[13.5px] resize-y"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá (Kano-Coin)" error={errors.price}>
              <input
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none font-sans text-[14px]"
              />
            </Field>

            <Field label="Thời lượng" error={errors.durationMinutes}>
              <select
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none font-sans text-[14px] bg-white"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} phút
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" size="md" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1" disabled={submitting}>
              {submitting ? 'Đang lưu...' : initial ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
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
