import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSetup, SetupStep } from '../index';

const steps: SetupStep[] = [
  { id: 'clinic', title: 'Clinic Details', description: 'Tell us about your clinic' },
  { id: 'team', title: 'Invite Your Team' },
  { id: 'done', title: 'All Set' }
];

describe('AdminSetup', () => {
  it('renders the first step title and description', () => {
    render(
      <AdminSetup steps={steps} onComplete={jest.fn()}>
        {(step) => <p>Content for {step.title}</p>}
      </AdminSetup>
    );

    expect(screen.getByText('Clinic Details')).toBeInTheDocument();
    expect(screen.getByText('Tell us about your clinic')).toBeInTheDocument();
    expect(screen.getByText('Content for Clinic Details')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('disables Back on the first step', () => {
    render(
      <AdminSetup steps={steps} onComplete={jest.fn()}>
        {(step) => <p>{step.title}</p>}
      </AdminSetup>
    );

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });

  it('advances through steps and enables Back', () => {
    render(
      <AdminSetup steps={steps} onComplete={jest.fn()}>
        {(step) => <p>{step.title}</p>}
      </AdminSetup>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('calls onComplete when Complete is clicked on the last step', () => {
    const onComplete = jest.fn();
    render(
      <AdminSetup steps={steps} onComplete={onComplete}>
        {(step) => <p>{step.title}</p>}
      </AdminSetup>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
