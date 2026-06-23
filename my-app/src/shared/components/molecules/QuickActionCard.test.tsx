import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuickActionCard } from './QuickActionCard';

describe('QuickActionCard', () => {
  it('renders anchor tag when href starts with #', () => {
    render(
      <QuickActionCard
        href="#test-anchor"
        bgClass="bg-cream"
        bgHoverClass="hover:bg-neutral-50"
        textClass="text-neutral-800"
        title="Test Action"
        countText="(5)"
        icon={<span>Icon</span>}
      />
    );

    const linkEl = screen.getByRole('link');
    expect(linkEl).toBeInTheDocument();
    expect(linkEl.tagName).toBe('A');
    expect(linkEl).toHaveAttribute('href', '#test-anchor');
    expect(screen.getByText('Test Action')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

