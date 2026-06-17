import { render, screen, fireEvent } from '@testing-library/react';
import { Form, FormField } from '../form';

const fields: FormField[] = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true, placeholder: 'Jane' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Tell us more' },
  { name: 'agree', label: 'I agree', type: 'checkbox' },
  { name: 'plan', label: 'Plan', type: 'select', options: ['Basic', 'Pro'] }
];

describe('Form', () => {
  it('renders all field types', () => {
    render(<Form fields={fields} values={{}} onChange={jest.fn()} onSubmit={jest.fn()} />);

    expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us more')).toBeInTheDocument();
    expect(screen.getByText('I agree')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Basic' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pro' })).toBeInTheDocument();
  });

  it('calls onChange for text, textarea, checkbox, and select fields', () => {
    const onChange = jest.fn();
    render(<Form fields={fields} values={{}} onChange={onChange} onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Jane'), { target: { value: 'Jane' } });
    expect(onChange).toHaveBeenCalledWith('first_name', 'Jane');

    fireEvent.change(screen.getByPlaceholderText('Tell us more'), { target: { value: 'Hello' } });
    expect(onChange).toHaveBeenCalledWith('notes', 'Hello');

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith('agree', true);

    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'Pro' } });
    expect(onChange).toHaveBeenCalledWith('plan', 'Pro');
  });

  it('reflects provided values', () => {
    render(
      <Form
        fields={fields}
        values={{ first_name: 'Jane', notes: 'Hello', agree: true, plan: 'Pro' }}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByPlaceholderText('Jane')).toHaveValue('Jane');
    expect(screen.getByPlaceholderText('Tell us more')).toHaveValue('Hello');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByLabelText('Plan')).toHaveValue('Pro');
  });

  it('shows an error message and a custom submit label', () => {
    render(
      <Form fields={fields} values={{}} onChange={jest.fn()} onSubmit={jest.fn()} error="Something went wrong" submitLabel="Save" />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows a loading state and calls onSubmit', () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(<Form fields={fields} values={{}} onChange={jest.fn()} onSubmit={onSubmit} loading />);

    const button = screen.getByRole('button', { name: 'Submitting...' });
    expect(button).toBeDisabled();

    fireEvent.submit(screen.getByRole('button').closest('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalled();
  });
});
