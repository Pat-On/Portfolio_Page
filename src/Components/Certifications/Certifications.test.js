import React from 'react';
import { render, screen } from '@testing-library/react';
import Certifications from './Certifications';
import { certificationData } from '../../assets/JSON/certificationsData';

beforeAll(() => { jest.useFakeTimers(); });
afterAll(() => { jest.useRealTimers(); });

describe('Certifications', () => {
  test('renders the Selected Certifications heading', () => {
    render(<Certifications />);
    expect(screen.getByText(/Selected Certifications/)).toBeInTheDocument();
  });

  test('renders the first certification title', () => {
    render(<Certifications />);
    expect(screen.getByText(certificationData[0].title)).toBeInTheDocument();
  });

  test('renders navigation buttons for the carousel', () => {
    render(<Certifications />);
    expect(screen.getByRole('button', { name: '<' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '>' })).toBeInTheDocument();
  });
});
