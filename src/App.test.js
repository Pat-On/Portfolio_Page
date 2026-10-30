import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// The real scene needs WebGL; a stand-in that reports ready is enough here.
const mockPrepareGame = jest.fn(() => Promise.resolve());
jest.mock('./TreeJSComponents/Scene', () => {
  const React = require('react');
  return function FakeScene({ onReady, apiRef }) {
    React.useEffect(() => {
      // Every other engine call App makes is a no-op here
      if (apiRef) apiRef.current = new Proxy({ prepareGame: mockPrepareGame }, { get: (t, k) => (k in t ? t[k] : () => {}) });
      onReady();
    }, [onReady, apiRef]);
    return null;
  };
});

describe('App: the game is prepared while the briefing is read', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    window.matchMedia = window.matchMedia || (() => ({ matches: true, addListener() {}, removeListener() {} }));
    mockPrepareGame.mockClear();
  });

  test('opening the briefing compiles the game ahead of the start', async () => {
    render(<App />);
    await screen.findByText('Selected Projects');
    expect(mockPrepareGame).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    fireEvent.click(screen.getByText('⊕ GAME MODE'));
    expect(await screen.findByRole('dialog', { name: 'COMBAT BRIEFING' })).toBeInTheDocument();
    expect(mockPrepareGame).toHaveBeenCalledTimes(1);
  });
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

    fireEvent.click(screen.getByRole('button', { name: /exploring/i }));

    expect(await screen.findByText('Selected Projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fly through it' })).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1234 }));
  });
});
