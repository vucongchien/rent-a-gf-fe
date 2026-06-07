import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CompanionBadge } from './CompanionBadge';

describe('CompanionBadge', () => {
  it('does not render if traits array is empty', () => {
    const { container } = render(<CompanionBadge traits={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single trait with solid background', () => {
    render(<CompanionBadge traits={['new']} />);
    
    const badge = screen.getByText('Mới');
    expect(badge).toBeInTheDocument();
    
    // Check solid background class from our dictionary
    expect(badge.className).toContain('bg-[var(--color-chizuru-500)]');
    // Ensure gradient is not applied
    expect(badge.className).not.toContain('bg-gradient-to-r');
  });

  it('renders multiple traits with joined text and gradient background', () => {
    render(<CompanionBadge traits={['new', 'hot']} />);
    
    const badge = screen.getByText('Mới · Hot');
    expect(badge).toBeInTheDocument();
    
    // Gradient class should be applied
    expect(badge.className).toContain('bg-gradient-to-r');
  });

  it('filters out invalid or unknown traits', () => {
    // @ts-expect-error: Intentionally passing an invalid trait
    render(<CompanionBadge traits={['hot', 'unknown']} />);
    
    // 'unknown' is ignored, only 'Hot' is rendered.
    // Length is technically 2 before filter, but dictionary check is safe.
    // It should render 'Hot' (and gradient since traits.length > 1)
    expect(screen.getByText('Hot')).toBeInTheDocument();
  });
});
