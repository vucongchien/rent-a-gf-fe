import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CloseButton } from './CloseButton';

describe('CloseButton', () => {
  it('renders correctly', () => {
    const handleClose = vi.fn();
    render(<CloseButton onClose={handleClose} aria-label="Close" />);
    
    const button = screen.getByRole('button', { name: /close/i });
    expect(button).toBeInTheDocument();
  });

  it('triggers onClose when clicked', async () => {
    const handleClose = vi.fn();
    render(<CloseButton onClose={handleClose} aria-label="Close" />);
    
    const button = screen.getByRole('button', { name: /close/i });
    await userEvent.click(button);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies classes based on variant', () => {
    const handleClose = vi.fn();
    
    // Ghost variant
    const { rerender } = render(<CloseButton onClose={handleClose} variant="ghost" />);
    let button = screen.getByRole('button');
    expect(button.className).toContain('rounded-md');
    
    // Outline variant
    rerender(<CloseButton onClose={handleClose} variant="outline" />);
    button = screen.getByRole('button');
    expect(button.className).toContain('rounded-full');
    expect(button.className).toContain('border');
  });
});
