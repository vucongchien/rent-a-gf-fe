/**
 * cities.ts — Danh sách city dùng chung cho filter (Client) và quản lý hồ sơ (Companion).
 *
 * NOTE (OQ-2): SSOT (`docs/api-draft.md`) dùng code `HCM` / `Hanoi` / `Danang`. Mock và UI
 * hiện tại đang dùng nhãn tiếng Việt làm value. Cho đến khi BE/PO thống nhất chuyển sang code,
 * giữ value tiếng Việt để không vỡ mock + filter. Khi đổi sang SSOT code, chỉ cần sửa `code`
 * và bổ sung adapter ở service boundary.
 */
export interface CityOption {
  code: string
  label: string
}

export const CITIES: readonly CityOption[] = [
  { code: 'TP.HCM', label: 'TP. Hồ Chí Minh' },
  { code: 'Hà Nội', label: 'Hà Nội' },
  { code: 'Đà Nẵng', label: 'Đà Nẵng' },
] as const

export const CITY_CODES = CITIES.map((c) => c.code)

export function isValidCityCode(code: string): boolean {
  return CITY_CODES.includes(code)
}

export function cityLabel(code: string): string {
  return CITIES.find((c) => c.code === code)?.label ?? code
}
