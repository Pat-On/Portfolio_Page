import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectTour from './ProjectTour';

const steps = [
  { img: 'one.png', alt: 'First shot', heading: 'First', body: 'Body one' },
  { img: 'two.png', alt: 'Second shot', heading: 'Second', body: 'Body two', tryIt: true },
  { img: 'three.png', alt: 'Third shot', heading: 'Third', body: 'Body three' },
];

describe('ProjectTour', () => {
  test('starts on the first step with its image, heading, caption and counter', () => {
    render(<ProjectTour steps={steps} />);
    expect(screen.getByRole('img', { name: 'First shot' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByText('Body one')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  test('Previous is disabled on the first step and Next on the last', () => {
    render(<ProjectTour steps={steps} />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  test('Next and Previous move between steps', () => {
    render(<ProjectTour steps={steps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument();
  });

  test('a dot jumps to its step and marks it current', () => {
    render(<ProjectTour steps={steps} />);
    const dot = screen.getByRole('button', { name: 'Step 3: Third' });
    fireEvent.click(dot);
    expect(screen.getByRole('heading', { name: 'Third' })).toBeInTheDocument();
    expect(dot).toHaveAttribute('aria-current', 'step');
  });

  test('arrow keys move between steps and stop at the ends', () => {
    render(<ProjectTour steps={steps} />);
    const tour = screen.getByRole('group', { name: /tour/i });
    fireEvent.keyDown(tour, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    fireEvent.keyDown(tour, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  test('a step marked tryIt offers a button that scrolls to the page header', () => {
    const header = document.createElement('header');
    header.scrollIntoView = jest.fn();
    document.body.appendChild(header);
    render(<ProjectTour steps={steps} />);
    expect(screen.queryByRole('button', { name: /try it now/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /try it now/i }));
    expect(header.scrollIntoView).toHaveBeenCalled();
    header.remove();
  });

  test('the caption is announced politely when the step changes', () => {
    render(<ProjectTour steps={steps} />);
    expect(screen.getByText('Body one').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });
});
