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

  test('renders the Work Experience section', () => {
    render(<Layout />);
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
  });

  test('renders the My Projects section', () => {
    render(<Layout />);
    expect(screen.getByText('My Projects')).toBeInTheDocument();
  });

  test('renders the Certifications section', () => {
    render(<Layout />);
    expect(screen.getByText(/Selected Certifications/)).toBeInTheDocument();
  });

  test('renders the Get In Touch footer', () => {
    render(<Layout />);
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });
});
