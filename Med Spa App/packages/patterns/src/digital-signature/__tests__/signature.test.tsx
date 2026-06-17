import { render, screen, fireEvent } from '@testing-library/react';
import { SignatureCapture } from '../index';

describe('SignatureCapture', () => {
  it('renders consent text', () => {
    render(<SignatureCapture consentText="I consent to treatment." onSign={jest.fn()} />);
    expect(screen.getByText('I consent to treatment.')).toBeInTheDocument();
  });

  it('disables confirm until name is typed and consent is checked', () => {
    render(<SignatureCapture consentText="Consent" onSign={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Confirm Signature' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Type your full name to sign'), {
      target: { value: 'Jane Doe' }
    });
    expect(screen.getByRole('button', { name: 'Confirm Signature' })).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Confirm Signature' })).toBeEnabled();
  });

  it('calls onSign with typed name, agreement, and timestamp', () => {
    const onSign = jest.fn();
    render(<SignatureCapture consentText="Consent" onSign={onSign} />);

    fireEvent.change(screen.getByLabelText('Type your full name to sign'), {
      target: { value: 'Jane Doe' }
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Signature' }));

    expect(onSign).toHaveBeenCalledWith(
      expect.objectContaining({ typedName: 'Jane Doe', agreed: true, signedAt: expect.any(String) })
    );
  });

  it('does not call onSign when disabled', () => {
    const onSign = jest.fn();
    render(<SignatureCapture consentText="Consent" onSign={onSign} disabled />);

    fireEvent.change(screen.getByLabelText('Type your full name to sign'), {
      target: { value: 'Jane Doe' }
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Signature' }));

    expect(onSign).not.toHaveBeenCalled();
  });
});
