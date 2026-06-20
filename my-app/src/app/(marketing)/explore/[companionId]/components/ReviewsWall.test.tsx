import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReviewsWall } from './ReviewsWall'
import type { CompanionReview } from '@/shared/types'

// Mock Avatar component
vi.mock('@/shared/components/atoms/Avatar', () => ({
  Avatar: ({ name, size }: { name: string; size: number }) => (
    <div data-testid="mock-avatar" data-size={size}>
      {name.charAt(0).toUpperCase()}
    </div>
  ),
}))

const mockReviews: CompanionReview[] = [
  {
    reviewId: 'rev-1',
    bookingId: 'bk-1',
    clientId: 'cli-1',
    companionId: 'comp-1',
    authorName: 'Khánh Huy',
    rating: 5,
    comment: 'Buổi hẹn hò rất vui vẻ, Mochi nói chuyện cực kỳ dễ thương và đúng giờ.',
    createdAt: '2026-06-10T00:00:00.000Z',
    updatedAt: '2026-06-10T00:00:00.000Z',
  },
  {
    reviewId: 'rev-2',
    bookingId: 'bk-2',
    clientId: 'cli-1',
    companionId: 'comp-1',
    authorName: 'Hoàng Long',
    rating: 4,
    comment: 'Trải nghiệm tốt, quán cà phê yên tĩnh đúng như mong muốn.',
    createdAt: '2026-06-08T00:00:00.000Z',
    updatedAt: '2026-06-08T00:00:00.000Z',
  },
]

describe('ReviewsWall', () => {
  const defaultProps = {
    reviews: mockReviews,
    ratingAvg: 4.5,
    reviewCount: 2,
    companionName: 'Mochi',
  }

  it('renders rating stats and header correctly', () => {
    render(<ReviewsWall {...defaultProps} />)

    // Header
    expect(screen.getByText('Cảm nhận cuộc hẹn')).toBeInTheDocument()

    // Summary stats
    expect(screen.getByText(/4.5\/5/)).toBeInTheDocument()
    expect(screen.getByText(/2 phản hồi lịch hẹn với Mochi/)).toBeInTheDocument()
  })

  it('renders all reviews correctly with details', () => {
    render(<ReviewsWall {...defaultProps} />)

    // Check first review
    expect(screen.getByText('Khánh Huy')).toBeInTheDocument()
    expect(screen.getByText('"Buổi hẹn hò rất vui vẻ, Mochi nói chuyện cực kỳ dễ thương và đúng giờ."')).toBeInTheDocument()
    expect(screen.getByText(/10\/6/)).toBeInTheDocument()

    // Check second review
    expect(screen.getByText('Hoàng Long')).toBeInTheDocument()
    expect(screen.getByText('"Trải nghiệm tốt, quán cà phê yên tĩnh đúng như mong muốn."')).toBeInTheDocument()
    expect(screen.getByText(/8\/6/)).toBeInTheDocument()

    // Check avatars are rendered
    const avatars = screen.getAllByTestId('mock-avatar')
    expect(avatars.length).toBe(2)
    expect(avatars[0]).toHaveTextContent('K')
    expect(avatars[1]).toHaveTextContent('H')
  })

  it('displays placeholder text when reviews array is empty', () => {
    render(
      <ReviewsWall
        reviews={[]}
        ratingAvg={0}
        reviewCount={0}
        companionName="Mochi"
      />
    )

    // Check empty text
    expect(
      screen.getByText(/Chưa có phản hồi nào từ cuộc hẹn với Mochi. Hãy là người đầu tiên đặt lịch hẹn và chia sẻ trải nghiệm nhé!/i)
    ).toBeInTheDocument()
    
    // Summary average should be 0
    expect(screen.getByText(/0\/5/)).toBeInTheDocument()
  })
})
