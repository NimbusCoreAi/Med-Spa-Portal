import { render, screen } from '@testing-library/react';
import { Input } from '../input';

describe('Input', () => {
  it('renders without a label', () => {
    render(<Input name="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('renders a label associated with the input via name', () => {
    render(<Input name="email" label="Email address" />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('uses an explicit id over name for the label association', () => {
    render(<Input id="custom-id" name="email" label="Email address" />);
    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('shows an error message and applies error styling', () => {
    render(<Input name="email" label="Email" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveClass('border-red-500');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input name="email" label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<Input name="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  it('gives the error span role="alert"', () => {
    render(<Input name="email" label="Email" error="Required" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
