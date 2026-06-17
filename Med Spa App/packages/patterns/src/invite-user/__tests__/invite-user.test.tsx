import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InviteUser } from '../index';

describe('InviteUser', () => {
  it('renders default role options', () => {
    render(<InviteUser onInvite={jest.fn()} />);
    expect(screen.getByRole('option', { name: 'staff' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'admin' })).toBeInTheDocument();
  });

  it('renders custom role options', () => {
    render(<InviteUser onInvite={jest.fn()} roles={['owner', 'viewer']} />);
    expect(screen.getByRole('option', { name: 'owner' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'viewer' })).toBeInTheDocument();
  });

  it('does not call onInvite when email is empty', () => {
    const onInvite = jest.fn();
    render(<InviteUser onInvite={onInvite} />);
    fireEvent.click(screen.getByRole('button', { name: 'Send Invitation' }));
    expect(onInvite).not.toHaveBeenCalled();
  });

  it('submits email and role, then shows success', async () => {
    const onInvite = jest.fn().mockResolvedValue(undefined);
    render(<InviteUser onInvite={onInvite} />);

    fireEvent.change(screen.getByPlaceholderText('colleague@clinic.com'), {
      target: { value: 'colleague@clinic.com' }
    });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invitation' }));

    await waitFor(() =>
      expect(onInvite).toHaveBeenCalledWith({ email: 'colleague@clinic.com', role: 'admin' })
    );
    expect(await screen.findByText('Invitation sent successfully.')).toBeInTheDocument();
  });

  it('shows an error message when onInvite rejects', async () => {
    const onInvite = jest.fn().mockRejectedValue(new Error('Email already invited'));
    render(<InviteUser onInvite={onInvite} />);

    fireEvent.change(screen.getByPlaceholderText('colleague@clinic.com'), {
      target: { value: 'colleague@clinic.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invitation' }));

    expect(await screen.findByText('Email already invited')).toBeInTheDocument();
  });
});
