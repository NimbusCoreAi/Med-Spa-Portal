import { render, screen } from '@testing-library/react';
import { RiskBadge } from '../RiskBadge';

describe('RiskBadge', () => {
  it('renders the high risk label and classes', () => {
    render(<RiskBadge level="high" />);
    const badge = screen.getByText('High Risk');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
  });

  it('renders the medium risk label and classes', () => {
    render(<RiskBadge level="medium" />);
    const badge = screen.getByText('Medium Risk');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('renders the low risk label and classes', () => {
    render(<RiskBadge level="low" />);
    const badge = screen.getByText('Low Risk');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
  });

  it('applies an additional className when provided', () => {
    render(<RiskBadge level="low" className="custom-class" />);
    expect(screen.getByText('Low Risk')).toHaveClass('custom-class');
  });
});
