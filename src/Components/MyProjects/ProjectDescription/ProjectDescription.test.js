import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectDescription from './ProjectDescription';

const project = {
  title: 'Demo',
  description: 'A demo project.',
  technologies: ['React.js', 'SASS'],
  linkGithub: 'https://github.com/x/demo',
  linkLive: 'https://demo.example',
};

describe('ProjectDescription', () => {
  test('lists each technology as its own item', () => {
    render(<ProjectDescription chosenProject={project} />);
    const list = screen.getByRole('list', { name: 'Technologies' });
    expect(list.querySelectorAll('li')).toHaveLength(2);
  });

  test('shows labelled links to the code and the live site', () => {
    render(<ProjectDescription chosenProject={project} />);
    expect(screen.getByRole('link', { name: /code/i })).toHaveAttribute('href', project.linkGithub);
    expect(screen.getByRole('link', { name: /live site/i })).toHaveAttribute('href', project.linkLive);
  });

  test('leaves out the live-site link when there is no live site', () => {
    render(<ProjectDescription chosenProject={{ ...project, linkLive: '' }} />);
    expect(screen.queryByRole('link', { name: /live site/i })).not.toBeInTheDocument();
  });
});
