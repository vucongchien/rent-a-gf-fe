import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BookingForm } from './BookingForm'

// Mock router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock WalletContext
const mockFetchWallet = vi.fn()
const mockOpenWallet = vi.fn()
let mockBalance = 500
vi.mock('@/shared/contexts/WalletContext', () => ({
  useWallet: () => ({
    balance: mockBalance,
    open: mockOpenWallet,
    fetchWallet: mockFetchWallet,
  }),
}))

// Mock AuthContext
const mockLogin = vi.fn()
let mockUser: { name: string } | null = { name: 'Test User' }
vi.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    login: mockLogin,
  }),
}))

// Mock Server Action
let mockActionStatus: 'idle' | 'success' | 'error' = 'idle'
let mockActionMessage = ''
vi.mock('@/app/(marketing)/explore/[companionId]/booking/actions', () => ({
  createBookingAction: vi.fn(async (prevState: any, formData: FormData) => {
    if (mockActionStatus === 'success') {
      return { status: 'success' }
    }
    if (mockActionStatus === 'error') {
      return { status: 'error', message: mockActionMessage || 'Có lỗi xảy ra' }
    }
    return { status: 'idle' }
  }),
}))

describe('BookingForm Integration', () => {
  const defaultProps = {
    companionId: 'comp-1',
    companionName: 'Mochi',
    scenarioId: 'sc-1',
    scenarioName: 'Cà phê',
    priceInCoin: 200,
    durationMinutes: 60,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockBalance = 500
    mockUser = { name: 'Test User' }
    mockActionStatus = 'idle'
    mockActionMessage = ''
  })

  it('renders Step 1 correctly and handles validation errors', () => {
    render(<BookingForm {...defaultProps} />)

    // Kiểm tra render đúng các thông tin cơ bản
    expect(screen.getByText('Cà phê')).toBeInTheDocument()
    expect(screen.getByText('60 phút')).toBeInTheDocument()
    expect(screen.getByText('200 Coin')).toBeInTheDocument()

    // Nhấn "Tiếp tục đặt lịch" mà chưa chọn ngày giờ
    const nextBtn = screen.getByRole('button', { name: /tiếp tục đặt lịch/i })
    fireEvent.click(nextBtn)

    // Phải hiển thị lỗi validation
    expect(screen.getByText('Vui lòng chọn ngày giờ hẹn.')).toBeInTheDocument()
  })

  it('moves to Step 2 when input is valid and handles Wallet/Auth cases', async () => {
    render(<BookingForm {...defaultProps} />)

    const datetimeInput = screen.getByLabelText(/ngày giờ hẹn/i)
    
    // Set thời gian hợp lệ (hiện tại + 2 tiếng)
    const validTime = new Date(Date.now() + 7200 * 1000)
    const year = validTime.getFullYear()
    const month = String(validTime.getMonth() + 1).padStart(2, '0')
    const day = String(validTime.getDate()).padStart(2, '0')
    const hours = String(validTime.getHours()).padStart(2, '0')
    const minutes = String(validTime.getMinutes()).padStart(2, '0')
    const validTimeString = `${year}-${month}-${day}T${hours}:${minutes}`

    fireEvent.change(datetimeInput, { target: { value: validTimeString } })

    const nextBtn = screen.getByRole('button', { name: /tiếp tục đặt lịch/i })
    fireEvent.click(nextBtn)

    // Đã chuyển sang Step 2
    expect(screen.getByText('Tóm tắt lịch hẹn')).toBeInTheDocument()
    expect(screen.getByText('Bạn đồng hành:')).toBeInTheDocument()
    expect(screen.getByText('Mochi')).toBeInTheDocument()
    
    // Số dư ví đủ (500 > 200) và đã đăng nhập -> Nút xác nhận & thanh toán hiện diện
    expect(screen.getByRole('button', { name: /xác nhận & thanh toán/i })).toBeInTheDocument()
  })

  it('shows Google Login warning and button when user is not logged in', () => {
    mockUser = null // Chưa đăng nhập
    render(<BookingForm {...defaultProps} />)

    const datetimeInput = screen.getByLabelText(/ngày giờ hẹn/i)
    const validTime = new Date(Date.now() + 7200 * 1000)
    const year = validTime.getFullYear()
    const month = String(validTime.getMonth() + 1).padStart(2, '0')
    const day = String(validTime.getDate()).padStart(2, '0')
    const hours = String(validTime.getHours()).padStart(2, '0')
    const minutes = String(validTime.getMinutes()).padStart(2, '0')
    const validTimeString = `${year}-${month}-${day}T${hours}:${minutes}`

    fireEvent.change(datetimeInput, { target: { value: validTimeString } })
    fireEvent.click(screen.getByRole('button', { name: /tiếp tục đặt lịch/i }))

    // Step 2
    expect(screen.getByText(/bạn chưa đăng nhập/i)).toBeInTheDocument()
    const loginBtn = screen.getByRole('button', { name: /đăng nhập bằng google/i })
    expect(loginBtn).toBeInTheDocument()

    fireEvent.click(loginBtn)
    expect(mockLogin).toHaveBeenCalledWith('client')
  })

  it('shows Wallet recharge warning and button when balance is insufficient', () => {
    mockBalance = 100 // Thiếu tiền (200 cần thiết)
    render(<BookingForm {...defaultProps} />)

    const datetimeInput = screen.getByLabelText(/ngày giờ hẹn/i)
    const validTime = new Date(Date.now() + 7200 * 1000)
    const year = validTime.getFullYear()
    const month = String(validTime.getMonth() + 1).padStart(2, '0')
    const day = String(validTime.getDate()).padStart(2, '0')
    const hours = String(validTime.getHours()).padStart(2, '0')
    const minutes = String(validTime.getMinutes()).padStart(2, '0')
    const validTimeString = `${year}-${month}-${day}T${hours}:${minutes}`

    fireEvent.change(datetimeInput, { target: { value: validTimeString } })
    fireEvent.click(screen.getByRole('button', { name: /tiếp tục đặt lịch/i }))

    // Step 2
    expect(screen.getByText(/số dư ví không đủ/i)).toBeInTheDocument()
    const rechargeBtn = screen.getByRole('button', { name: /nạp thêm kano-coin/i })
    expect(rechargeBtn).toBeInTheDocument()

    fireEvent.click(rechargeBtn)
    expect(mockOpenWallet).toHaveBeenCalled()
  })
})
