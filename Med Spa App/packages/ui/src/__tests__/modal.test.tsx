import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={jest.fn()}>
        Content
      </Modal>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders children and title when open', () => {
    render(
      <Modal open title="My Modal" onClose={jest.fn()}>
        Content
      </Modal>
    );
    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders without a title', () => {
    render(
      <Modal open onClose={jest.fn()}>
        Content
      </Modal>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal open title="My Modal" onClose={onClose}>
        Content
      </Modal>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(
      <Modal open title="My Modal" onClose={onClose}>
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has role="dialog"', () => {
    render(
      <Modal open title="My Modal" onClose={jest.fn()}>
        Content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(
      <Modal open title="My Modal" onClose={jest.fn()}>
        Content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('cycles focus to the first element when Tab is pressed on the last element', () => {
    render(
      <Modal open title="My Modal" onClose={jest.fn()}>
        <button>Content Button</button>
      </Modal>
    );
    const contentButton = screen.getByText('Content Button');
    contentButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('cycles focus to the last element when Shift+Tab is pressed on the first element', () => {
    render(
      <Modal open title="My Modal" onClose={jest.fn()}>
        <button>Content Button</button>
      </Modal>
    );
    const closeButton = screen.getByRole('button', { name: 'Close' });
    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByText('Content Button')).toHaveFocus();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        Content
      </Modal>
    );
    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
