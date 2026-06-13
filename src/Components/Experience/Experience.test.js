import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Experience from './Experience';
import jobs from '../../assets/JSON/workExperience.json';

describe('Experience', () => {
  test('renders the Work Experience heading', () => {
    render(<Experience />);
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
  });

  test('displays the first job title and company by default', () => {
    render(<Experience />);
    // Title is unique (only in the job heading, not in control buttons)
    expect(screen.getByText(new RegExp(jobs['0'].title))).toBeInTheDocument();
    // Company appears in the heading link and control buttons — at least one must exist
    expect(screen.getAllByText(jobs['0'].company).length).toBeGreaterThan(0);
  });

  test('renders a controller button for every job entry', () => {
    render(<Experience />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(Object.keys(jobs).length);
  });

  test('switches displayed job when a different company button is clicked', () => {
    render(<Experience />);
    const secondJob = jobs['2'];
    const btn = screen.getByRole('button', { name: secondJob.company });
    fireEvent.click(btn);
    expect(screen.getByText(new RegExp(secondJob.title))).toBeInTheDocument();
  });
});
