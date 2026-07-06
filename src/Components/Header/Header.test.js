import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  test('renders the name as the primary heading', () => {
    render(<Header />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Patryk Nowak/i })
    ).toBeInTheDocument();
  });

  test('renders the Software Engineer role eyebrow', () => {
    render(<Header />);
    expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
  });

  test('renders a tagline that nods to the Three.js scene', () => {
    render(<Header />);
    expect(
      screen.getByRole('heading', { level: 2, name: /solar system/i })
    ).toBeInTheDocument();
  });

  test('renders the certifications credibility chip', () => {
    render(<Header />);
    expect(screen.getByText(/certifications/i)).toBeInTheDocument();
  });

  test('renders a CV download link', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /Download CV/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('drive.google.com'));
  });

  test('renders a Get in touch mailto link', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /Get in touch/i });
    expect(link.getAttribute('href')).toMatch(/^mailto:/);
  });

  test('renders GitHub and LinkedIn links', () => {
    render(<Header />);
    expect(
      screen.getByRole('link', { name: /GitHub/i }).getAttribute('href')
    ).toContain('github.com');
    expect(
      screen.getByRole('link', { name: /LinkedIn/i }).getAttribute('href')
    ).toContain('linkedin.com');
  });
});
