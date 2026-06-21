import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EarningsCard } from './EarningsCard';

describe('EarningsCard', () => {
  it('renders correct balance with format', () => {
    render(<EarningsCard balance={1250} />);
    expect(screen.getByText('1.250')).toBeInTheDocument();
    expect(screen.getByText('Coin')).toBeInTheDocument();
    expect(screen.getByText('Thu nhập khả dụng')).toBeInTheDocument();
  });
});

