import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

// The real scene needs WebGL; a stand-in that reports ready is enough here.
jest.mock('./TreeJSComponents/Scene', () => {
  const React = require('react');
  return function FakeScene({ onReady }) {
    React.useEffect(() => { onReady(); }, [onReady]);
    return null;
  };
});

describe('App: leaving a mode returns the visitor to the same place', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    window.matchMedia = window.matchMedia || (() => ({ matches: true, addListener() {}, removeListener() {} }));
    Object.defineProperty(window, 'scrollY', { value: 1234, configurable: true });
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 0; });
  });

  afterEach(() => jest.restoreAllMocks());

  test('Explore from the tour, then exit: same project, same step, same scroll', async () => {
    render(<App />);
    await screen.findByText('Selected Projects');

    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /start explore mode/i }));
    expect(screen.queryByText('Selected Projects')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /exploring/i }));
    });

    expect(screen.getByText('Selected Projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fly through it' })).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1234 }));
  });
});
