import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBriefing from './GameBriefing';

const baseProps = {
  active: true,
  isMobile: false,
  onStart: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => { jest.clearAllMocks(); });

describe('GameBriefing', () => {
  test('renders nothing when inactive', () => {
    const { container } = render(<GameBriefing {...baseProps} active={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('shows desktop controls on desktop', () => {
    render(<GameBriefing {...baseProps} />);
    expect(screen.getByText('COMBAT BRIEFING')).toBeInTheDocument();
    expect(screen.getByText('HOLD CLICK')).toBeInTheDocument();
    expect(screen.getByText('SHIFT')).toBeInTheDocument();
    expect(screen.queryByText('LEFT THUMB')).not.toBeInTheDocument();
  });

  test('shows touch controls on mobile', () => {
    render(<GameBriefing {...baseProps} isMobile={true} />);
    expect(screen.getByText('LEFT THUMB')).toBeInTheDocument();
    expect(screen.getByText('FIRE')).toBeInTheDocument();
    expect(screen.queryByText('WASD')).not.toBeInTheDocument();
  });

  test('start button label matches the platform', () => {
    const { rerender } = render(<GameBriefing {...baseProps} />);
    expect(screen.getByText('CLICK TO START')).toBeInTheDocument();
    rerender(<GameBriefing {...baseProps} isMobile={true} />);
    expect(screen.getByText('TAP TO START')).toBeInTheDocument();
  });

  test('START calls onStart', () => {
    render(<GameBriefing {...baseProps} />);
    fireEvent.click(screen.getByText('CLICK TO START'));
    expect(baseProps.onStart).toHaveBeenCalledTimes(1);
  });

  test('BACK calls onCancel', () => {
    render(<GameBriefing {...baseProps} />);
    fireEvent.click(screen.getByText('BACK'));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
