import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProfileNote } from './ProfileNote'
import type { CompanionDetail } from '@/shared/types'

// Mock VoiceButton to avoid Web Audio API issues
vi.mock('@/shared/components/atoms/VoiceButton', () => ({
  VoiceButton: ({ soundUrl, label }: { soundUrl: string; label: string }) => (
    <button data-testid="voice-button" data-soundurl={soundUrl}>
      {label}
    </button>
  ),
}))

const mockCompanion: CompanionDetail = {
  id: 'comp-1',
  displayName: 'Mochi',
  city: 'TP.HCM',
  ratingAvg: 4.8,
  reviewCount: 12,
  avatarUrl: '/avatar.jpg',
  voiceIntroUrl: '/audio.mp3',
  featuredScenario: null,
  metadata: ['Nữ', 'Vui vẻ', 'Dịu dàng'],
  albumUrls: ['/photo-1.jpg'],
  bio: 'Mình là Mochi, thích cà phê và trò chuyện cùng mọi người.',
  scenarios: [],
}

describe('ProfileNote', () => {
  it('renders companion profile info correctly', () => {
    render(<ProfileNote companion={mockCompanion} />)

    // Name
    expect(screen.getByText('Mochi')).toBeInTheDocument()
    
    // City
    expect(screen.getByText('TP.HCM')).toBeInTheDocument()

    // Rating & Review count
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('(12 phản hồi)')).toBeInTheDocument()

    // Bio
    expect(screen.getByText(/Mình là Mochi, thích cà phê và trò chuyện cùng mọi người./i)).toBeInTheDocument()

    // Metadata tags
    expect(screen.getByText('Nữ')).toBeInTheDocument()
    expect(screen.getByText('Vui vẻ')).toBeInTheDocument()
    expect(screen.getByText('Dịu dàng')).toBeInTheDocument()

    // VoiceButton exists and has correct url
    const voiceBtn = screen.getByTestId('voice-button')
    expect(voiceBtn).toBeInTheDocument()
    expect(voiceBtn).toHaveAttribute('data-soundurl', '/audio.mp3')
    expect(voiceBtn).toHaveTextContent('Nghe giới thiệu')

    // CTA Button to scenes selector
    const ctaBtn = screen.getByRole('button', { name: /Chọn kịch bản hẹn →/i })
    expect(ctaBtn).toBeInTheDocument()
  })

  it('renders New for ratingAvg = 0 and hides VoiceButton when voiceIntroUrl is null', () => {
    const companionNoVoice: CompanionDetail = {
      ...mockCompanion,
      ratingAvg: 0,
      reviewCount: 0,
      voiceIntroUrl: null,
    }

    render(<ProfileNote companion={companionNoVoice} />)

    // Should display New
    expect(screen.getByText('New')).toBeInTheDocument()

    // VoiceButton should not be rendered
    expect(screen.queryByTestId('voice-button')).not.toBeInTheDocument()
  })
})
