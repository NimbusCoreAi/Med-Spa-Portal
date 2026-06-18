import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the active label and classes', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
  });

  it('renders the inactive label and classes', () => {
    render(<StatusBadge status="inactive" />);
    const badge = screen.getByText('Inactive');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
  });

  it('renders the pending label and classes', () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('renders the cancelled label and classes', () => {
    render(<StatusBadge status="cancelled" />);
    const badge = screen.getByText('Cancelled');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
  });

  it('applies an additional className when provided', () => {
    render(<StatusBadge status="active" className="custom-class" />);
    expect(screen.getByText('Active')).toHaveClass('custom-class');
  });
});
