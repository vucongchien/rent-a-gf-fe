/**
 * Mock mode: bật khi `NEXT_PUBLIC_MOCK_ENABLED=true` HOẶC `API_URL` chưa set.
 *
 * Service đọc cờ này để branch sang fixture `@/mocks/fixtures/data` thay vì gọi
 * `serverFetch`. Tách helper duy nhất để fix policy ở 1 chỗ.
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL
}
