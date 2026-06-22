'use server';

import { revalidatePath } from 'next/cache';
import { companionService } from '@/shared/services/companionService';
import { ApiError } from '@/shared/lib/apiError';
import type { ActionState } from '@/shared/types';
import type { CompanionProfileMe, CompanionScenario } from '@/shared/types/companion';
import {
  validateProfile,
  validateScenario,
  validateMediaMeta,
  type MediaAssetType,
} from './validation';

/** Map ApiError theo SSOT { code, message, details } về ActionState error. */
function apiErrorToState(err: unknown): ActionState {
  if (err instanceof ApiError) {
    const fieldErrors: Record<string, string> = {};
    for (const raw of err.details ?? []) {
      const d = raw as { field?: string; description?: string };
      if (d?.field) fieldErrors[d.field] = d.description ?? '';
    }
    return {
      status: 'error',
      message: err.message,
      ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    };
  }
  return { status: 'error', message: 'Lỗi hệ thống. Vui lòng thử lại.' };
}

function parseCities(formData: FormData): string[] {
  return formData.getAll('availableCities').filter((v): v is string => typeof v === 'string');
}

export async function updateProfileAction(
  _prev: ActionState<CompanionProfileMe>,
  formData: FormData,
): Promise<ActionState<CompanionProfileMe>> {
  const parsed = {
    displayName: String(formData.get('displayName') ?? ''),
    biography: String(formData.get('biography') ?? ''),
    availableCities: parseCities(formData),
  };
  const v = validateProfile(parsed);
  if (!v.ok) {
    return { status: 'error', message: 'Vui lòng kiểm tra lại thông tin.', fieldErrors: v.fieldErrors };
  }

  // Media fields optional — đẩy nguyên giá trị cũ qua hidden inputs nếu có.
  const avatarUrl = String(formData.get('avatarUrl') ?? '');
  const voiceIntroUrl = formData.get('voiceIntroUrl');
  const albumUrls = formData.getAll('albumUrls').filter((u): u is string => typeof u === 'string');

  const body: Partial<CompanionProfileMe> = {
    ...v.value,
    ...(avatarUrl ? { avatarUrl } : {}),
    albumUrls,
    voiceIntroUrl:
      voiceIntroUrl === null || voiceIntroUrl === '' ? null : String(voiceIntroUrl),
  };

  try {
    const data = (await companionService.updateMyProfile(body)) as CompanionProfileMe;
    revalidatePath('/dashboard/profile');
    return { status: 'success', data, message: 'Cập nhật hồ sơ thành công.' };
  } catch (err) {
    console.error('[updateProfileAction]', err);
    return apiErrorToState(err) as ActionState<CompanionProfileMe>;
  }
}

function parseScenarioFromForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    price: Number(formData.get('price') ?? 0),
    durationMinutes: Number(formData.get('durationMinutes') ?? 0),
    publicPlace: String(formData.get('publicPlace') ?? ''),
  };
}

export async function createScenarioAction(
  _prev: ActionState<CompanionScenario>,
  formData: FormData,
): Promise<ActionState<CompanionScenario>> {
  const parsed = parseScenarioFromForm(formData);
  const v = validateScenario(parsed);
  if (!v.ok) {
    return { status: 'error', message: 'Vui lòng kiểm tra lại thông tin.', fieldErrors: v.fieldErrors };
  }
  try {
    const data = (await companionService.createMyScenario(v.value)) as CompanionScenario;
    revalidatePath('/dashboard/profile/scenarios');
    return { status: 'success', data, message: 'Đã tạo kịch bản mới.' };
  } catch (err) {
    console.error('[createScenarioAction]', err);
    return apiErrorToState(err) as ActionState<CompanionScenario>;
  }
}

export async function updateScenarioAction(
  scenarioId: string,
  _prev: ActionState<CompanionScenario>,
  formData: FormData,
): Promise<ActionState<CompanionScenario>> {
  const parsed = parseScenarioFromForm(formData);
  const v = validateScenario(parsed);
  if (!v.ok) {
    return { status: 'error', message: 'Vui lòng kiểm tra lại thông tin.', fieldErrors: v.fieldErrors };
  }
  try {
    const data = (await companionService.updateMyScenario(scenarioId, v.value)) as CompanionScenario;
    revalidatePath('/dashboard/profile/scenarios');
    return { status: 'success', data, message: 'Đã cập nhật kịch bản.' };
  } catch (err) {
    console.error('[updateScenarioAction]', err);
    return apiErrorToState(err) as ActionState<CompanionScenario>;
  }
}

export async function deleteScenarioAction(scenarioId: string): Promise<ActionState> {
  try {
    await companionService.deleteMyScenario(scenarioId);
    revalidatePath('/dashboard/profile/scenarios');
    return { status: 'success', message: 'Đã xóa kịch bản.' };
  } catch (err) {
    console.error('[deleteScenarioAction]', err);
    return apiErrorToState(err);
  }
}

export interface PresignResult {
  uploadUrl: string;
  fileUrl: string;
}

export async function requestUploadUrlAction(input: {
  assetType: MediaAssetType;
  sizeBytes: number;
  durationSeconds?: number;
  contentType?: string;
}): Promise<ActionState<PresignResult>> {
  const v = validateMediaMeta(input);
  if (!v.ok) {
    return { status: 'error', message: 'File không hợp lệ.', fieldErrors: v.fieldErrors };
  }
  try {
    const data = (await companionService.requestUploadUrl(v.value)) as PresignResult;
    return { status: 'success', data };
  } catch (err) {
    console.error('[requestUploadUrlAction]', err);
    return apiErrorToState(err) as ActionState<PresignResult>;
  }
}
