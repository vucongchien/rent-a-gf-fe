import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CompanionCard } from './CompanionCard';
import { CompanionTrait } from '../atoms/CompanionBadge';

describe('CompanionCard', () => {
  const mockProps = {
    id: 'test-1',
    name: 'Mochi',
    location: 'Hà Nội',
    price: '4.500.000₫',
    metadata: ['Sinh viên', '20 tuổi', 'Nữ'],
    traits: ['new', 'hot'] as CompanionTrait[],
    voiceUrl: '/test-audio.mp3',
    onLike: vi.fn(),
  };

  it('renders correctly with given props', () => {
    render(<CompanionCard {...mockProps} />);

    // Check basic text info
    expect(screen.getByText('Mochi')).toBeInTheDocument();
    expect(screen.getByText('Hà Nội')).toBeInTheDocument();
    expect(screen.getByText('4.500.000₫')).toBeInTheDocument();

    // Check metadata
    expect(screen.getByText('Sinh viên')).toBeInTheDocument();
    expect(screen.getByText('20 tuổi')).toBeInTheDocument();
    expect(screen.getByText('Nữ ♀')).toBeInTheDocument();

    // Check badges
    expect(screen.getByText('Mới · Hot')).toBeInTheDocument();

    // Check action buttons exist (Voice) and Meet me link
    expect(screen.getByRole('button', { name: /hi/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /meet me/i })).toBeInTheDocument();
  });

  it('renders Meet me as a link pointing to the companion detail page', () => {
    render(<CompanionCard {...mockProps} />);

    const meetLink = screen.getByRole('link', { name: /meet me/i });
    expect(meetLink).toBeInTheDocument();
    expect(meetLink).toHaveAttribute('href', '/explore/test-1');
  });
});
