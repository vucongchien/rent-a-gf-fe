import { render, screen, fireEvent } from '@testing-library/react'
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

// Mock BookingModal để tránh crash do thiếu Providers trong component con
vi.mock('./BookingModal', () => ({
  BookingModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null
    return (
      <div data-testid="mock-booking-modal">
        Mock Booking Modal
        <button onClick={onClose}>Close</button>
      </div>
    )
  }
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

  it('renders booking buttons and opens/closes modal on click', () => {
    render(<ScenesSelectorClient {...defaultProps} />)

    // Tìm tất cả các button đặt hẹn
    const bookingButtons = screen.getAllByRole('button', { name: /Đặt hẹn với Mochi/i })
    expect(bookingButtons.length).toBe(2)

    // Đảm bảo ban đầu modal đóng (không tồn tại trong DOM)
    expect(screen.queryByTestId('mock-booking-modal')).not.toBeInTheDocument()

    // Click button đầu tiên để mở modal
    fireEvent.click(bookingButtons[0])

    // Đảm bảo modal đã được mở
    expect(screen.getByTestId('mock-booking-modal')).toBeInTheDocument()
    expect(screen.getByText('Mock Booking Modal')).toBeInTheDocument()

    // Click nút Close trong mock modal để đóng
    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)

    // Đảm bảo modal đã được đóng (biến mất khỏi DOM)
    expect(screen.queryByTestId('mock-booking-modal')).not.toBeInTheDocument()
  })
})
