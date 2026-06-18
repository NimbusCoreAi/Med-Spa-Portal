import { render, screen } from '@testing-library/react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { KPICard } from '../KPICard';

describe('KPICard', () => {
  it('renders title and value', () => {
    render(
      <KPICard
        title="Revenue"
        value="$1,000"
        icon={DollarSign}
      />
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('renders trend indicator when provided', () => {
    render(
      <KPICard
        title="Revenue"
        value="$1,000"
        trend={{ value: 12, direction: 'up' }}
        icon={DollarSign}
      />
    );
    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });

  it('applies color class based on color prop', () => {
    const { container } = render(
      <KPICard
        title="Revenue"
        value="$1,000"
        icon={DollarSign}
        color="success"
      />
    );
    const iconDiv = container.querySelector('[class*="green"]');
    expect(iconDiv).toBeInTheDocument();
  });
});
