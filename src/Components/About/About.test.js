import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './About';

describe('About', () => {
  test('renders the About Me heading', () => {
    render(<About />);
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  test('renders skill keywords in the list', () => {
    render(<About />);
    expect(screen.getByText('PHP / Laravel')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Docker / Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('Terraform')).toBeInTheDocument();
    expect(screen.getByText('Elastic / Kibana')).toBeInTheDocument();
    expect(screen.getByText('AWS Bedrock AgentCore')).toBeInTheDocument();
    expect(screen.getByText('Strands Agents')).toBeInTheDocument();
  });

  test('states the experience and certification counts that agree with the CV', () => {
    render(<About />);
    expect(screen.getByText(/five years/)).toBeInTheDocument();
    expect(screen.getByText(/eleven Azure, AWS and HashiCorp certifications/)).toBeInTheDocument();
  });

  test('renders the profile photo', () => {
    render(<About />);
    expect(screen.getByRole('img', { name: /Profile/ })).toBeInTheDocument();
  });
});
