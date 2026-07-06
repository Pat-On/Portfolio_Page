import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from './Layout';

beforeAll(() => { jest.useFakeTimers(); });
afterAll(() => { jest.useRealTimers(); });

describe('Layout', () => {
  test('renders without crashing', () => {
    const { container } = render(<Layout />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders the name from Header', () => {
    render(<Layout />);
    expect(screen.getByText('Patryk Nowak')).toBeInTheDocument();
  });

  test('renders the About Me section', () => {
    render(<Layout />);
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  test('renders the Selected Work section', () => {
    render(<Layout />);
    expect(screen.getByText('Selected Work')).toBeInTheDocument();
  });

  test('renders the Selected Projects section', () => {
    render(<Layout />);
    expect(screen.getByText('Selected Projects')).toBeInTheDocument();
  });

  test('renders the Certifications section', () => {
    render(<Layout />);
    expect(screen.getByText(/Certifications/)).toBeInTheDocument();
  });

  test('renders the Get In Touch footer', () => {
    render(<Layout />);
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });
});
