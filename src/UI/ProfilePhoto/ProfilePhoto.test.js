import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfilePhoto from './ProfilePhoto';

describe('ProfilePhoto', () => {
  test('renders an img element', () => {
    render(<ProfilePhoto />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('img has alt text', () => {
    render(<ProfilePhoto />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Profile');
  });

  test('renders the figcaption text', () => {
    render(<ProfilePhoto />);
    expect(screen.getByText(/Sky is/)).toBeInTheDocument();
  });
});
