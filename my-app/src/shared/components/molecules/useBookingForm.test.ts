import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBookingForm } from './useBookingForm'

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

describe('useBookingForm', () => {
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

  it('khởi tạo state mặc định chính xác', () => {
    const { result } = renderHook(() => useBookingForm(defaultProps))

    expect(result.current.step).toBe(1)
    expect(result.current.scheduledAt).toBe('')
    expect(result.current.note).toBe('')
    expect(result.current.validationError).toBe('')
    expect(result.current.isPending).toBe(false)
    expect(result.current.errorMessage).toBe('')
  })

  it('báo lỗi khi chuyển sang Step 2 mà chưa chọn ngày giờ', () => {
    const { result } = renderHook(() => useBookingForm(defaultProps))

    act(() => {
      result.current.handleNextStep()
    })

    expect(result.current.validationError).toBe('Vui lòng chọn ngày giờ hẹn.')
    expect(result.current.step).toBe(1)
  })

  it('báo lỗi khi chọn ngày giờ nhỏ hơn hiện tại + 1 tiếng', () => {
    const { result } = renderHook(() => useBookingForm(defaultProps))

    // Set thời gian trong quá khứ (lấy local time)
    const pastTime = new Date(Date.now() - 3600 * 1000)
    // Format đơn giản YYYY-MM-DDThh:mm
    const year = pastTime.getFullYear()
    const month = String(pastTime.getMonth() + 1).padStart(2, '0')
    const day = String(pastTime.getDate()).padStart(2, '0')
    const hours = String(pastTime.getHours()).padStart(2, '0')
    const minutes = String(pastTime.getMinutes()).padStart(2, '0')
    const pastTimeString = `${year}-${month}-${day}T${hours}:${minutes}`

    act(() => {
      result.current.setScheduledAt(pastTimeString)
    })

    act(() => {
      result.current.handleNextStep()
    })

    expect(result.current.validationError).toBe('Thời gian đặt lịch phải sau thời điểm hiện tại ít nhất 1 giờ.')
    expect(result.current.step).toBe(1)
  })

  it('chuyển step 2 thành công nếu ngày giờ hợp lệ', () => {
    const { result } = renderHook(() => useBookingForm(defaultProps))

    // Set thời gian hợp lệ (hiện tại + 2 tiếng)
    const validTime = new Date(Date.now() + 7200 * 1000)
    const year = validTime.getFullYear()
    const month = String(validTime.getMonth() + 1).padStart(2, '0')
    const day = String(validTime.getDate()).padStart(2, '0')
    const hours = String(validTime.getHours()).padStart(2, '0')
    const minutes = String(validTime.getMinutes()).padStart(2, '0')
    const validTimeString = `${year}-${month}-${day}T${hours}:${minutes}`

    act(() => {
      result.current.setScheduledAt(validTimeString)
    })

    act(() => {
      result.current.handleNextStep()
    })

    expect(result.current.validationError).toBe('')
    expect(result.current.step).toBe(2)
  })
})
