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

  test('arrow keys on the tour buttons move between steps and stop at the ends', () => {
    render(<ProjectTour steps={steps} />);
    const dot = screen.getByRole('button', { name: 'Step 1: First' });
    fireEvent.keyDown(dot, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    fireEvent.keyDown(dot, { key: 'ArrowRight' });
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

  test('a polite live region announces the current step', () => {
    render(<ProjectTour steps={steps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('Step 2 of 3: Second');
  });

  test('the navigation sits between the screenshot and the caption, so it never moves', () => {
    render(<ProjectTour steps={steps} />);
    const next = screen.getByRole('button', { name: /next/i });
    const heading = screen.getByRole('heading', { name: 'First' });
    const img = screen.getByRole('img', { name: 'First shot' });
    expect(img.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(next.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('every caption is rendered to hold the height, but only the current one is exposed', () => {
    render(<ProjectTour steps={steps} />);
    expect(screen.getByText('Body three')).toBeInTheDocument();
    expect(screen.getByText('Body three').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Body one').closest('[aria-hidden]')).toBeNull();
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });
});
