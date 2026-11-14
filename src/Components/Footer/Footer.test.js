import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  test('renders the Get In Touch heading', () => {
    render(<Footer />);
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });

  test('renders the email link', () => {
    render(<Footer />);
    const emailLink = screen.getByRole('link', { name: /email/i });
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto'));
  });

  test('renders the LinkedIn link', () => {
    render(<Footer />);
    const linkedInLink = screen.getByRole('link', { name: /LinkedIn/i });
    expect(linkedInLink).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
  });

  test('renders the GitHub link', () => {
    render(<Footer />);
    const ghLink = screen.getByRole('link', { name: /Github/i });
    expect(ghLink).toHaveAttribute('href', expect.stringContaining('github.com'));
  });

  test('renders the LeetCode link', () => {
    render(<Footer />);
    const leetLink = screen.getByRole('link', { name: /LeetCode/i });
    expect(leetLink).toHaveAttribute('href', expect.stringContaining('leetcode.com'));
  });

  test('renders the CV download link', () => {
    render(<Footer />);
    const cvLink = screen.getByRole('link', { name: /Find My CV/i });
    expect(cvLink).toHaveAttribute('href', expect.stringContaining('drive.google.com'));
  });

  test('renders the current year (not a hardcoded one) in the copyright', () => {
    // Pin the clock to a year different from any hardcoded value so the test
    // genuinely fails until the component derives the year dynamically.
    jest.useFakeTimers().setSystemTime(new Date('2030-01-01T00:00:00Z'));

    try {
      render(<Footer />);
      expect(screen.getByText(/2030 Made by Patryk Nowak/)).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  test('credits the source of the planet textures, as its licence asks', () => {
    render(<Footer />);
    // The maps are resized, repacked and altered, and the licence asks that this be said
    expect(screen.getByText(/Planet textures adapted from/i)).toBeInTheDocument();
    const credit = screen.getByRole('link', { name: /Solar System Scope/i });
    expect(credit).toHaveAttribute('href', 'https://www.solarsystemscope.com/textures/');
    expect(screen.getByRole('link', { name: /CC BY 4\.0/i })).toHaveAttribute(
      'href', 'https://creativecommons.org/licenses/by/4.0/');
  });
});
