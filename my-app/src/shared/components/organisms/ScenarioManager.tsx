'use client';

import React, { useOptimistic, useState, useTransition } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import { ScenarioItem } from '@/shared/components/molecules/ScenarioItem';
import { ScenarioFormModal } from '@/shared/components/molecules/ScenarioFormModal';
import {
  createScenarioAction,
  updateScenarioAction,
  deleteScenarioAction,
} from '@/app/(companion)/dashboard/profile/actions';
import { MAX_SCENARIOS, type ScenarioInput } from '@/app/(companion)/dashboard/profile/validation';
import type { CompanionScenario } from '@/shared/types/companion';

interface ScenarioManagerProps {
  initial: CompanionScenario[];
}

type Optimistic =
  | { kind: 'add'; tempId: string; scenario: CompanionScenario }
  | { kind: 'update'; scenario: CompanionScenario }
  | { kind: 'delete'; scenarioId: string };

function reducer(state: CompanionScenario[], action: Optimistic): CompanionScenario[] {
  switch (action.kind) {
    case 'add':
      return [action.scenario, ...state];
    case 'update':
      return state.map((s) => (s.scenarioId === action.scenario.scenarioId ? action.scenario : s));
    case 'delete':
      return state.filter((s) => s.scenarioId !== action.scenarioId);
  }
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({ initial }) => {
  const { toast } = useToast();
  const [scenarios, optimisticDispatch] = useOptimistic(initial, reducer);
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<CompanionScenario | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const buildFormData = (input: ScenarioInput) => {
    const fd = new FormData();
    fd.set('title', input.title);
    fd.set('description', input.description);
    fd.set('price', String(input.price));
    fd.set('durationMinutes', String(input.durationMinutes));
    fd.set('publicPlace', input.publicPlace);
    return fd;
  };

  const handleCreate = async (input: ScenarioInput) => {
    if (scenarios.length >= MAX_SCENARIOS) {
      toast({ message: `Tối đa ${MAX_SCENARIOS} kịch bản.` });
      return;
    }
    setSubmitting(true);
    const tempId = `tmp-${Date.now()}`;
    const optimistic: CompanionScenario = { scenarioId: tempId, ...input };

    startTransition(async () => {
      optimisticDispatch({ kind: 'add', tempId, scenario: optimistic });
      const res = await createScenarioAction({ status: 'idle' }, buildFormData(input));
      setSubmitting(false);
      if (res.status === 'success') {
        toast({ message: res.message ?? 'Đã tạo kịch bản.' });
        setCreating(false);
      } else if (res.status === 'error') {
        toast({ message: res.message });
        // revalidatePath will reset state
      }
    });
  };

  const handleUpdate = async (scenarioId: string, input: ScenarioInput) => {
    setSubmitting(true);
    setPendingId(scenarioId);
    const optimistic: CompanionScenario = { scenarioId, ...input };
    startTransition(async () => {
      optimisticDispatch({ kind: 'update', scenario: optimistic });
      const res = await updateScenarioAction(scenarioId, { status: 'idle' }, buildFormData(input));
      setSubmitting(false);
      setPendingId(null);
      if (res.status === 'success') {
        toast({ message: res.message ?? 'Đã cập nhật.' });
        setEditing(null);
      } else if (res.status === 'error') {
        toast({ message: res.message });
      }
    });
  };

  const handleDelete = (scenarioId: string) => {
    if (!confirm('Xóa kịch bản này?')) return;
    setPendingId(scenarioId);
    startTransition(async () => {
      optimisticDispatch({ kind: 'delete', scenarioId });
      const res = await deleteScenarioAction(scenarioId);
      setPendingId(null);
      if (res.status === 'success') {
        toast({ message: res.message ?? 'Đã xóa.' });
      } else if (res.status === 'error') {
        toast({ message: res.message });
      }
    });
  };

  const reached = scenarios.length >= MAX_SCENARIOS;

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-[14px] text-neutral-900">
          Dịch vụ ({scenarios.length}/{MAX_SCENARIOS})
        </h2>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={reached}
          title={reached ? `Tối đa ${MAX_SCENARIOS} kịch bản (INV-P03)` : undefined}
        >
          + Thêm dịch vụ
        </Button>
      </header>

      {scenarios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
          <p className="font-sans text-[13px] text-neutral-500">
            Chưa có kịch bản nào. Thêm dịch vụ đầu tiên để Client tìm thấy bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scenarios.map((s) => (
            <ScenarioItem
              key={s.scenarioId}
              scenario={s}
              pending={pendingId === s.scenarioId || s.scenarioId.startsWith('tmp-')}
              onEdit={() => setEditing(s)}
              onDelete={() => handleDelete(s.scenarioId)}
            />
          ))}
        </div>
      )}

      {creating && (
        <ScenarioFormModal
          onSubmit={handleCreate}
          onClose={() => setCreating(false)}
          submitting={submitting}
        />
      )}
      {editing && (
        <ScenarioFormModal
          initial={editing}
          onSubmit={(input) => handleUpdate(editing.scenarioId, input)}
          onClose={() => setEditing(null)}
          submitting={submitting}
        />
      )}
    </div>
  );
};
