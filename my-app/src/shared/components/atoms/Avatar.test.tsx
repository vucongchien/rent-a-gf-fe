import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders fallback character when no src is provided', () => {
    render(<Avatar name="Chizuru Ichinose" />);
    
    const fallbackText = screen.getByText('C');
    expect(fallbackText).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar src="/images/avatar.jpg" name="Chizuru Ichinose" />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Chizuru Ichinose');
  });

  it('applies custom inline styles for size', () => {
    const { container } = render(<Avatar name="Chizuru Ichinose" size={40} />);
    const avatarDiv = container.firstChild as HTMLElement;
    
    expect(avatarDiv.style.width).toBe('40px');
    expect(avatarDiv.style.height).toBe('40px');
  });
});
