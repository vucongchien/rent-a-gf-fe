import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScenesSelectorClient } from './ScenesSelectorClient'

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

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
    scenarioId: 'sc-1',
    title: 'Cà phê & trò chuyện',
    description: 'Gặp gỡ tại quán cà phê yên tĩnh, cùng chia sẻ câu chuyện thú vị.',
    durationMinutes: 60,
    price: 150,
    publicPlace: 'Quận 1, TP.HCM',
  },
  {
    scenarioId: 'sc-2',
    title: 'Dạo phố Sài Gòn',
    description: 'Khám phá các con phố đẹp cùng nhau.',
    durationMinutes: 120,
    price: 300,
    publicPlace: 'Bến Nhà Rồng, TP.HCM',
  },
]

describe('ScenesSelectorClient', () => {
  const defaultProps = {
    companionId: 'comp-1',
    companionName: 'Mochi',
    scenarios: mockScenarios,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

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

  it('tự động mở modal với kịch bản được lưu trong sessionStorage khi mount', () => {
    const draft = {
      companionId: 'comp-1',
      scenarioId: 'sc-2',
    }
    sessionStorage.setItem('rentagf.booking.draft', JSON.stringify(draft))

    render(<ScenesSelectorClient {...defaultProps} />)

    // Đảm bảo modal đã tự động mở với kịch bản sc-2
    expect(screen.getByTestId('mock-booking-modal')).toBeInTheDocument()
  })

  it('không tự động mở modal nếu companionId của draft khác biệt', () => {
    const draft = {
      companionId: 'comp-other',
      scenarioId: 'sc-2',
    }
    sessionStorage.setItem('rentagf.booking.draft', JSON.stringify(draft))

    render(<ScenesSelectorClient {...defaultProps} />)

    expect(screen.queryByTestId('mock-booking-modal')).not.toBeInTheDocument()
  })

  it('xóa draft khỏi sessionStorage khi click close modal', () => {
    const draft = {
      companionId: 'comp-1',
      scenarioId: 'sc-2',
    }
    sessionStorage.setItem('rentagf.booking.draft', JSON.stringify(draft))

    render(<ScenesSelectorClient {...defaultProps} />)

    expect(screen.getByTestId('mock-booking-modal')).toBeInTheDocument()

    // Click nút Close để đóng
    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)

    // Đảm bảo modal đóng và draft bị xóa
    expect(screen.queryByTestId('mock-booking-modal')).not.toBeInTheDocument()
    expect(sessionStorage.getItem('rentagf.booking.draft')).toBeNull()
  })
})
