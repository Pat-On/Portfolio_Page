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

  test('shows the first step of the selected project\'s tour', () => {
    render(<MyProjects />);
    const first = featuredProjects[0].tour[0];
    expect(screen.getByRole('img', { name: first.alt })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: first.heading })).toBeInTheDocument();
  });

  test('switching project starts its tour from the first step', () => {
    render(<MyProjects />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('tab', { name: featuredProjects[1].title }));
    const first = featuredProjects[1].tour[0];
    expect(screen.getByRole('heading', { name: first.heading })).toBeInTheDocument();
    expect(screen.getByText(`1 / ${featuredProjects[1].tour.length}`)).toBeInTheDocument();
  });

  test('links to the full GitHub profile for earlier work', () => {
    render(<MyProjects />);
    const link = screen.getByRole('link', { name: /earlier work/i });
    expect(link.getAttribute('href')).toContain('github.com');
  });
});
