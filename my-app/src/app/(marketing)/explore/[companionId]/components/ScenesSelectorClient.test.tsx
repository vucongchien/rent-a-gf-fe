import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ScenesSelectorClient } from './ScenesSelectorClient'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockScenarios = [
  {
    id: 'sc-1',
    name: 'Cà phê & trò chuyện',
    description: 'Gặp gỡ tại quán cà phê yên tĩnh, cùng chia sẻ câu chuyện thú vị.',
    durationMinutes: 60,
    priceInCoin: 150,
    location: 'Quận 1, TP.HCM',
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'sc-2',
    name: 'Dạo phố Sài Gòn',
    description: 'Khám phá các con phố đẹp cùng nhau.',
    durationMinutes: 120,
    priceInCoin: 300,
    location: 'Bến Nhà Rồng, TP.HCM',
    isActive: true,
    isFeatured: false,
  },
]

describe('ScenesSelectorClient', () => {
  const defaultProps = {
    companionId: 'comp-1',
    companionName: 'Mochi',
    scenarios: mockScenarios,
  }

  it('renders all active scenarios correctly', () => {
    render(<ScenesSelectorClient {...defaultProps} />)

    // Kiểm tra tên các kịch bản
    expect(screen.getByText('Cà phê & trò chuyện')).toBeInTheDocument()
    expect(screen.getByText('Dạo phố Sài Gòn')).toBeInTheDocument()

    // Kiểm tra mô tả
    expect(screen.getByText('Gặp gỡ tại quán cà phê yên tĩnh, cùng chia sẻ câu chuyện thú vị.')).toBeInTheDocument()
    expect(screen.getByText('Khám phá các con phố đẹp cùng nhau.')).toBeInTheDocument()

    // Kiểm tra thời lượng & chi phí
    expect(screen.getByText(/60 phút/i)).toBeInTheDocument()
    expect(screen.getByText(/150 Coin/i)).toBeInTheDocument()
    expect(screen.getByText(/120 phút/i)).toBeInTheDocument()
    expect(screen.getByText(/300 Coin/i)).toBeInTheDocument()
  })

  it('renders booking buttons with correct URLs inside cards', () => {
    render(<ScenesSelectorClient {...defaultProps} />)

    // Tìm tất cả các link
    const bookingLinks = screen.getAllByRole('link', { name: /Đặt hẹn với Mochi/i })
    expect(bookingLinks.length).toBe(2)

    // Kiểm tra URL tương ứng của từng nút
    expect(bookingLinks[0]).toHaveAttribute('href', '/explore/comp-1/booking?scenarioId=sc-1')
    expect(bookingLinks[1]).toHaveAttribute('href', '/explore/comp-1/booking?scenarioId=sc-2')
  })
})
