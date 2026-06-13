import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MyProjects from './MyProjects';
import { projectsData } from '../../assets/JSON/projectsDescription';

describe('MyProjects', () => {
  test('renders the My Projects heading', () => {
    render(<MyProjects />);
    expect(screen.getByText('My Projects')).toBeInTheDocument();
  });

  test('displays the first project title heading by default', () => {
    render(<MyProjects />);
    expect(screen.getByRole('heading', { name: projectsData[0].title })).toBeInTheDocument();
  });

  test('renders a control button for every project', () => {
    render(<MyProjects />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(projectsData.length);
  });

  test('switches displayed project heading when a control button is clicked', () => {
    render(<MyProjects />);
    const thirdProject = projectsData[2];
    const btn = screen.getByRole('button', { name: thirdProject.title });
    fireEvent.click(btn);
    expect(screen.getByRole('heading', { name: thirdProject.title })).toBeInTheDocument();
    expect(screen.getByText(thirdProject.description)).toBeInTheDocument();
  });
});
