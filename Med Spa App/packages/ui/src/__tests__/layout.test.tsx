import { render, screen } from '@testing-library/react';
import { PageLayout, Card } from '../layout';

describe('PageLayout', () => {
  it('renders children with default classes', () => {
    render(<PageLayout>Content</PageLayout>);
    const el = screen.getByText('Content');
    expect(el).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  it('merges a custom className', () => {
    render(<PageLayout className="custom-class">Content</PageLayout>);
    expect(screen.getByText('Content')).toHaveClass('min-h-screen', 'custom-class');
  });
});

describe('Card', () => {
  it('renders children with default classes', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toHaveClass('rounded-lg', 'bg-white');
  });

  it('merges a custom className', () => {
    render(<Card className="extra">Card content</Card>);
    expect(screen.getByText('Card content')).toHaveClass('rounded-lg', 'extra');
  });
});
