import React from 'react';
import { render, screen } from '@testing-library/react';
import ButtonLink from './ButtonLink';

describe('ButtonLink', () => {
  test('renders the button text', () => {
    render(<ButtonLink text="Click Me" link="https://example.com" />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('renders an anchor with the correct href', () => {
    render(<ButtonLink text="Visit" link="https://example.com" />);
    const anchor = screen.getByRole('link', { name: 'Visit' });
    expect(anchor).toHaveAttribute('href', 'https://example.com');
  });
});
