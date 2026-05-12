import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  test('renders the name', () => {
    render(<Header />);
    expect(screen.getByText('Patryk Nowak')).toBeInTheDocument();
  });

  test('renders the greeting line', () => {
    render(<Header />);
    expect(screen.getByText(/Hi, my name is/)).toBeInTheDocument();
  });

  test('renders a CV download link', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /Find My CV/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('drive.google.com'));
  });
});
