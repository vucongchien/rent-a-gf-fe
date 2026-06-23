import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnimatedButton } from './AnimatedButton';

describe('AnimatedButton', () => {
  it('renders children correctly', () => {
    render(<AnimatedButton>Click Me</AnimatedButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies default classes and custom classes', () => {
    const { container } = render(<AnimatedButton className="custom-class">Click Me</AnimatedButton>);
    const button = container.firstChild as HTMLElement;
    
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('group');
    expect(button).toHaveClass('relative');
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<AnimatedButton onClick={handleClick}>Click Me</AnimatedButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<AnimatedButton onClick={handleClick} disabled>Click Me</AnimatedButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('renders as a custom element tag when "as" prop is provided', () => {
    const { container } = render(<AnimatedButton as="div">Click Me</AnimatedButton>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.tagName).toBe('DIV');
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
