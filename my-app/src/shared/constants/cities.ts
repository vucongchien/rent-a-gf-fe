/**
 * cities.ts — Danh sách city dùng chung cho filter (Client) và quản lý hồ sơ (Companion).
 *
 * SSOT API dùng city code `HCM` / `Hanoi` / `Danang`.
 * UI chỉ dùng `label` để hiển thị, mọi request/filter/form submit dùng `code`.
 */
export interface CityOption {
  code: string
  label: string
}

export const CITIES: readonly CityOption[] = [
  { code: 'HCM', label: 'TP. Hồ Chí Minh' },
  { code: 'Hanoi', label: 'Hà Nội' },
  { code: 'Danang', label: 'Đà Nẵng' },
] as const

export const CITY_CODES = CITIES.map((c) => c.code)

const LEGACY_CITY_CODE_MAP: Record<string, string> = {
  'TP.HCM': 'HCM',
  'TP. Hồ Chí Minh': 'HCM',
  'Hà Nội': 'Hanoi',
  'Đà Nẵng': 'Danang',
}

export function isValidCityCode(code: string): boolean {
  return CITY_CODES.includes(code)
}

export function normalizeCityCode(value: string): string {
  return CITIES.find((c) => c.code === value || c.label === value)?.code
    ?? LEGACY_CITY_CODE_MAP[value]
    ?? value
}

export function cityLabel(code: string): string {
  const normalized = normalizeCityCode(code)
  return CITIES.find((c) => c.code === normalized)?.label ?? code
}
