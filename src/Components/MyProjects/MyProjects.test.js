import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MyProjects from './MyProjects';
import { featuredProjects } from '../../assets/JSON/projectsDescription';

describe('MyProjects', () => {
  test('renders the Selected Projects heading', () => {
    render(<MyProjects />);
    expect(screen.getByText('Selected Projects')).toBeInTheDocument();
  });

  test('displays the first featured project title heading by default', () => {
    render(<MyProjects />);
    expect(
      screen.getByRole('heading', { name: featuredProjects[0].title })
    ).toBeInTheDocument();
  });

  test('renders a control button for every featured project only', () => {
    render(<MyProjects />);
    const buttons = screen.getAllByRole('tab');
    expect(buttons.length).toBe(featuredProjects.length);
  });

  test('switches displayed project heading when a control button is clicked', () => {
    render(<MyProjects />);
    const second = featuredProjects[1];
    const btn = screen.getByRole('tab', { name: second.title });
    fireEvent.click(btn);
    expect(screen.getByRole('heading', { name: second.title })).toBeInTheDocument();
    expect(screen.getByText(second.description)).toBeInTheDocument();
  });

  test('links to the full GitHub profile for earlier work', () => {
    render(<MyProjects />);
    const link = screen.getByRole('link', { name: /earlier work/i });
    expect(link.getAttribute('href')).toContain('github.com');
  });
});
