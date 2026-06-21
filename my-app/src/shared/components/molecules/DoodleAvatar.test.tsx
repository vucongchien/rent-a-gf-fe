import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DoodleAvatar } from './DoodleAvatar';

describe('DoodleAvatar', () => {
  it('renders the first letter of name uppercase correctly', () => {
    render(<DoodleAvatar name="kazuya" index={0} />);
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders default character when name is empty', () => {
    render(<DoodleAvatar name="" index={0} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies bg-ruka-100 class for index 0 (Mint)', () => {
    const { container } = render(<DoodleAvatar name="Ruka" index={0} />);
    const divElement = container.firstChild as HTMLElement;
    expect(divElement.className).toContain('bg-ruka-100');
  });

  it('applies bg-mami-100 class for index 1 (Gold)', () => {
    const { container } = render(<DoodleAvatar name="Mami" index={1} />);
    const divElement = container.firstChild as HTMLElement;
    expect(divElement.className).toContain('bg-mami-100');
  });

  it('applies bg-chizuru-100 class for index 2 (Pink)', () => {
    const { container } = render(<DoodleAvatar name="Chizuru" index={2} />);
    const divElement = container.firstChild as HTMLElement;
    expect(divElement.className).toContain('bg-chizuru-100');
  });
});
