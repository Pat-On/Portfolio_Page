import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameHUD from './GameHUD';

const defaultProps = {
  health: 1,
  score: 0,
  wave: 1,
  active: false,
  gameOverScreen: { active: false },
  hitFlash: false,
  killPopup: null,
  waveComplete: null,
  paused: false,
  highScore: 0,
  onRestart: jest.fn(),
};

beforeEach(() => { jest.clearAllMocks(); });

describe('GameHUD — null state', () => {
  test('renders nothing when inactive and no game-over screen', () => {
    const { container } = render(<GameHUD {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('GameHUD — active HUD', () => {
  const activeProps = { ...defaultProps, active: true };

  test('renders the crosshair', () => {
    const { container } = render(<GameHUD {...activeProps} />);
    expect(container.querySelector('.crosshair')).toBeInTheDocument();
  });

  test('renders score value', () => {
    render(<GameHUD {...activeProps} score={420} />);
    expect(screen.getByText('420')).toBeInTheDocument();
  });

  test('renders wave value', () => {
    render(<GameHUD {...activeProps} wave={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('renders health bar with correct width', () => {
    const { container } = render(<GameHUD {...activeProps} health={0.6} />);
    const fill = container.querySelector('.healthFill');
    expect(fill.style.width).toBe('60%');
  });

  test('health bar is gold when health > 0.5', () => {
    const { container } = render(<GameHUD {...activeProps} health={0.8} />);
    const fill = container.querySelector('.healthFill');
    expect(fill.style.background).toBe('rgb(255, 201, 71)'); // #ffc947
  });

  test('health bar is orange when health between 0.25 and 0.5', () => {
    const { container } = render(<GameHUD {...activeProps} health={0.4} />);
    const fill = container.querySelector('.healthFill');
    expect(fill.style.background).toBe('rgb(255, 136, 0)'); // #ff8800
  });

  test('health bar is red when health below 0.25', () => {
    const { container } = render(<GameHUD {...activeProps} health={0.1} />);
    const fill = container.querySelector('.healthFill');
    expect(fill.style.background).toBe('rgb(255, 34, 0)'); // #ff2200
  });

  test('shows hit vignette when hitFlash is true', () => {
    const { container } = render(<GameHUD {...activeProps} hitFlash={true} />);
    expect(container.querySelector('.hitVignette')).toBeInTheDocument();
  });

  test('no hit vignette when hitFlash is false', () => {
    const { container } = render(<GameHUD {...activeProps} hitFlash={false} />);
    expect(container.querySelector('.hitVignette')).not.toBeInTheDocument();
  });

  test('shows kill popup points', () => {
    const popup = { id: 1, points: 100, streak: 1 };
    render(<GameHUD {...activeProps} killPopup={popup} />);
    expect(screen.getByText('+100 PTS')).toBeInTheDocument();
  });

  test('does not show streak line when streak < 3', () => {
    const popup = { id: 1, points: 100, streak: 2 };
    render(<GameHUD {...activeProps} killPopup={popup} />);
    expect(screen.queryByText(/KILL STREAK/)).not.toBeInTheDocument();
  });

  test('shows streak line when streak >= 3', () => {
    const popup = { id: 1, points: 200, streak: 3 };
    render(<GameHUD {...activeProps} killPopup={popup} />);
    expect(screen.getByText('3× KILL STREAK!')).toBeInTheDocument();
  });

  test('shows wave banner when waveComplete.active is true', () => {
    const wc = { active: true, wave: 2 };
    render(<GameHUD {...activeProps} waveComplete={wc} />);
    expect(screen.getByText('WAVE 2 CLEARED')).toBeInTheDocument();
  });

  test('shows pause overlay when paused', () => {
    render(<GameHUD {...activeProps} paused={true} />);
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
    expect(screen.getByText('P — RESUME')).toBeInTheDocument();
  });

  test('no pause overlay when not paused', () => {
    render(<GameHUD {...activeProps} paused={false} />);
    expect(screen.queryByText('PAUSED')).not.toBeInTheDocument();
  });
});

describe('GameHUD — game over screen', () => {
  const gameOverBase = {
    ...defaultProps,
    active: false,
    gameOverScreen: { active: true, victory: false, score: 1234, isNew: false },
  };

  test('renders SYSTEM FAILURE on defeat', () => {
    render(<GameHUD {...gameOverBase} />);
    expect(screen.getByText('SYSTEM FAILURE')).toBeInTheDocument();
  });

  test('renders MISSION COMPLETE on victory', () => {
    render(<GameHUD {...gameOverBase} gameOverScreen={{ ...gameOverBase.gameOverScreen, victory: true }} />);
    expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();
  });

  test('renders final score', () => {
    render(<GameHUD {...gameOverBase} />);
    expect(screen.getByText(/FINAL SCORE: 1234/)).toBeInTheDocument();
  });

  test('shows NEW RECORD when isNew is true', () => {
    render(<GameHUD {...gameOverBase} gameOverScreen={{ ...gameOverBase.gameOverScreen, isNew: true }} />);
    expect(screen.getByText('NEW RECORD!')).toBeInTheDocument();
  });

  test('does not show NEW RECORD when isNew is false', () => {
    render(<GameHUD {...gameOverBase} />);
    expect(screen.queryByText('NEW RECORD!')).not.toBeInTheDocument();
  });

  test('clicking PLAY AGAIN calls onRestart', () => {
    const onRestart = jest.fn();
    render(<GameHUD {...gameOverBase} onRestart={onRestart} />);
    fireEvent.click(screen.getByRole('button', { name: 'PLAY AGAIN' }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
