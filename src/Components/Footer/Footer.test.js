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
});
