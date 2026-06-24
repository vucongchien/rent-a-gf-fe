/**
 * validation.ts — Pure validators dùng chung cho Server Actions và Client preview.
 * Bám sát SSOT (docs/api-draft.md):
 *   INV-P01 price > 0 (integer)
 *   INV-P02 durationMinutes ∈ {60, 120, 180}
 *   INV-P03 max 5 scenarios
 *   INV-P04 voice ≤ 5MB, ≤ 30s
 *   INV-P05 image ≤ 2MB
 */
import { isValidCityCode } from '@/shared/constants/cities'

export const MIN_NAME_LEN = 2
export const MAX_NAME_LEN = 40
export const MAX_BIO_LEN = 500
export const MAX_SCENARIO_TITLE_LEN = 80
export const MIN_SCENARIO_TITLE_LEN = 3
export const MAX_SCENARIO_DESC_LEN = 300
export const MIN_PUBLIC_PLACE_LEN = 3
export const MAX_PUBLIC_PLACE_LEN = 120

export const DURATION_OPTIONS = [60, 120, 180] as const
export type DurationOption = (typeof DURATION_OPTIONS)[number]

export const MAX_SCENARIOS = 5
export const MAX_IMAGE_BYTES = 2_000_000
export const MAX_VOICE_BYTES = 5_000_000
export const MAX_VOICE_SECONDS = 30

export type FieldErrors = Record<string, string>

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; fieldErrors: FieldErrors }

export interface ProfileInput {
  displayName: string
  introText: string
  availableCities: string[]
}

export function validateProfile(input: ProfileInput): ValidationResult<ProfileInput> {
  const fieldErrors: FieldErrors = {}

  const name = input.displayName?.trim() ?? ''
  if (name.length < MIN_NAME_LEN || name.length > MAX_NAME_LEN) {
    fieldErrors.displayName = `Tên hiển thị từ ${MIN_NAME_LEN}–${MAX_NAME_LEN} ký tự.`
  }

  const bio = input.introText ?? ''
  if (bio.length > MAX_BIO_LEN) {
    fieldErrors.introText = `Tiểu sử tối đa ${MAX_BIO_LEN} ký tự.`
  }

  const cities = Array.isArray(input.availableCities) ? input.availableCities : []
  if (cities.length === 0) {
    fieldErrors.availableCities = 'Chọn ít nhất 1 thành phố.'
  } else if (cities.some((c) => !isValidCityCode(c))) {
    fieldErrors.availableCities = 'Có thành phố không hợp lệ.'
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors }
  return { ok: true, value: { displayName: name, introText: bio, availableCities: cities } }
}

export interface ScenarioInput {
  title: string
  description: string
  price: number
  durationMinutes: number
  publicPlace: string
}

export function validateScenario(input: ScenarioInput): ValidationResult<ScenarioInput> {
  const fieldErrors: FieldErrors = {}

  const title = input.title?.trim() ?? ''
  if (title.length < MIN_SCENARIO_TITLE_LEN || title.length > MAX_SCENARIO_TITLE_LEN) {
    fieldErrors.title = `Tiêu đề từ ${MIN_SCENARIO_TITLE_LEN}–${MAX_SCENARIO_TITLE_LEN} ký tự.`
  }

  const description = input.description ?? ''
  if (description.length > MAX_SCENARIO_DESC_LEN) {
    fieldErrors.description = `Mô tả tối đa ${MAX_SCENARIO_DESC_LEN} ký tự.`
  }

  if (!Number.isInteger(input.price) || input.price <= 0) {
    fieldErrors.price = 'Giá phải là số nguyên dương (Kano-Coin).'
  }

  if (!DURATION_OPTIONS.includes(input.durationMinutes as DurationOption)) {
    fieldErrors.durationMinutes = `Thời lượng chỉ chấp nhận ${DURATION_OPTIONS.join(' / ')} phút.`
  }

  const place = input.publicPlace?.trim() ?? ''
  if (place.length < MIN_PUBLIC_PLACE_LEN || place.length > MAX_PUBLIC_PLACE_LEN) {
    fieldErrors.publicPlace = `Địa điểm từ ${MIN_PUBLIC_PLACE_LEN}–${MAX_PUBLIC_PLACE_LEN} ký tự.`
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors }
  return {
    ok: true,
    value: {
      title,
      description,
      price: input.price,
      durationMinutes: input.durationMinutes,
      publicPlace: place,
    },
  }
}

export type MediaAssetType = 'IMAGE' | 'VOICE'

export interface MediaMetaInput {
  assetType: MediaAssetType
  sizeBytes: number
  durationSeconds?: number
  contentType?: string
}

export function validateMediaMeta(input: MediaMetaInput): ValidationResult<MediaMetaInput> {
  const fieldErrors: FieldErrors = {}

  if (input.assetType === 'IMAGE') {
    if (input.sizeBytes <= 0 || input.sizeBytes > MAX_IMAGE_BYTES) {
      fieldErrors.file = `Ảnh tối đa ${Math.round(MAX_IMAGE_BYTES / 1_000_000)}MB.`
    }
  } else if (input.assetType === 'VOICE') {
    if (input.sizeBytes <= 0 || input.sizeBytes > MAX_VOICE_BYTES) {
      fieldErrors.file = `Voice tối đa ${Math.round(MAX_VOICE_BYTES / 1_000_000)}MB.`
    }
    if (input.durationSeconds == null || input.durationSeconds <= 0) {
      fieldErrors.durationSeconds = 'Không xác định được thời lượng voice.'
    } else if (input.durationSeconds > MAX_VOICE_SECONDS) {
      fieldErrors.durationSeconds = `Voice tối đa ${MAX_VOICE_SECONDS} giây.`
    }
  } else {
    fieldErrors.assetType = 'Loại media không hợp lệ.'
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors }
  return { ok: true, value: input }
}
