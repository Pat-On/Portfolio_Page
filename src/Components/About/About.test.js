import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './About';

describe('About', () => {
  test('renders the About Me heading', () => {
    render(<About />);
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  test('renders skill keywords in the list', () => {
    render(<About />);
    expect(screen.getByText('PHP')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  test('renders the profile photo', () => {
    render(<About />);
    expect(screen.getByRole('img', { name: /Profile/ })).toBeInTheDocument();
  });
});
