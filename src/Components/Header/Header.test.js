import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { PortfolioModeProvider } from '../../state/PortfolioModeContext';
import { certificationData } from '../../assets/JSON/certificationsData';

describe('Header', () => {
  test('renders the name as the primary heading', () => {
    render(<Header />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Patryk Nowak/i })
    ).toBeInTheDocument();
  });

  test('renders the Software Engineer role eyebrow', () => {
    render(<Header />);
    expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
  });

  test('renders a tagline that nods to the Three.js scene', () => {
    render(<Header />);
    expect(
      screen.getByRole('heading', { level: 2, name: /solar system/i })
    ).toBeInTheDocument();
  });

  test('renders the certifications credibility chip', () => {
    render(<Header />);
    expect(screen.getByText(/certifications/i)).toBeInTheDocument();
  });

  test('states experience and certification counts that agree with the CV', () => {
    render(<Header />);
    expect(screen.getByText('5 yrs')).toBeInTheDocument();
    // The count comes from the data, so a new badge updates the stat too
    expect(screen.getByText(`${certificationData.length}×`)).toBeInTheDocument();
    expect(screen.getByText('11×')).toBeInTheDocument();
  });

  test('renders a CV download link', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /Download CV/i });
    expect(link).toHaveAttribute(
      'href',
      'https://drive.google.com/u/0/uc?id=1H_Ec-cBj9ushxDrxQiqIIOrtJrTwkFed&export=download'
    );
  });

  test('renders a Get in touch mailto link', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /Get in touch/i });
    expect(link.getAttribute('href')).toMatch(/^mailto:/);
  });

  test('renders GitHub and LinkedIn links', () => {
    render(<Header />);
    expect(
      screen.getByRole('link', { name: /GitHub/i }).getAttribute('href')
    ).toContain('github.com');
    expect(
      screen.getByRole('link', { name: /LinkedIn/i }).getAttribute('href')
    ).toContain('linkedin.com');
  });
});

describe('Header Explore tip', () => {
  test('inside the app, Explore in the tip is a button that starts Explore mode', () => {
    const mode = { startExplore: jest.fn() };
    render(
      <PortfolioModeProvider value={mode}>
        <Header />
      </PortfolioModeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /^explore$/i }));
    expect(mode.startExplore).toHaveBeenCalled();
  });

  test('on its own the tip stays plain text', () => {
    render(<Header />);
    expect(screen.queryByRole('button', { name: /^explore$/i })).not.toBeInTheDocument();
  });
});
