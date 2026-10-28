import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Experience from './Experience';
import work from '../../assets/JSON/workExperience.json';

describe('Experience', () => {
  test('renders the Selected Work heading', () => {
    render(<Experience />);
    expect(screen.getByRole('heading', { level: 2, name: 'Selected Work' })).toBeInTheDocument();
  });

  test('shows the current company with every role and bullet, no clicks needed', () => {
    render(<Experience />);
    const now = screen.getByRole('article', { name: new RegExp(work.current.company) });
    work.current.roles.forEach((role) => {
      expect(within(now).getByRole('heading', { level: 4, name: role.title })).toBeInTheDocument();
      expect(within(now).getByText(role.time)).toBeInTheDocument();
      role.description.forEach((line) => {
        expect(within(now).getByText(line)).toBeInTheDocument();
      });
    });
  });

  test('shows the current skills as chips', () => {
    render(<Experience />);
    const now = screen.getByRole('article', { name: new RegExp(work.current.company) });
    work.current.skills.forEach((skill) => {
      expect(within(now).getByText(skill)).toBeInTheDocument();
    });
  });

  test('labels the current role as such', () => {
    render(<Experience />);
    expect(screen.getByText('Current role')).toBeInTheDocument();
  });

  test.each([
    ['Previous role', work.previous],
    ['Mentoring & volunteering', work.volunteering],
  ])('lists every %s entry with its dates and summary', (label, roles) => {
    render(<Experience />);
    expect(screen.getByRole('heading', { level: 3, name: label })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: label });
    expect(within(list).getAllByRole('listitem')).toHaveLength(roles.length);
    roles.forEach((role) => {
      expect(within(list).getByText(role.title)).toBeInTheDocument();
      expect(within(list).getByText(role.time)).toBeInTheDocument();
      expect(within(list).getByText(role.summary)).toBeInTheDocument();
    });
  });

  // The old tab switcher changed the section's height on every click
  test('has no tabs to switch between', () => {
    render(<Experience />);
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
