import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBriefing from './GameBriefing';

const baseProps = {
  active: true,
  isMobile: false,
  autoFire: true,
  onAutoFireToggle: jest.fn(),
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

  test('auto-fire toggle reflects state and calls onAutoFireToggle', () => {
    const onAutoFireToggle = jest.fn();
    const { rerender } = render(
      <GameBriefing {...baseProps} autoFire={true} onAutoFireToggle={onAutoFireToggle} />
    );
    const toggle = screen.getByText(/AUTO-FIRE: ON/);
    fireEvent.click(toggle);
    expect(onAutoFireToggle).toHaveBeenCalledTimes(1);
    rerender(<GameBriefing {...baseProps} autoFire={false} onAutoFireToggle={onAutoFireToggle} />);
    expect(screen.getByText(/AUTO-FIRE: OFF/)).toBeInTheDocument();
  });
});

describe('GameBriefing — as a dialog', () => {
  test('is a modal dialog named by its title', () => {
    render(<GameBriefing {...baseProps} />);
    const dialog = screen.getByRole('dialog', { name: 'COMBAT BRIEFING' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('moves focus to the start button when it opens', () => {
    render(<GameBriefing {...baseProps} />);
    expect(screen.getByText('CLICK TO START')).toHaveFocus();
  });

  test('Tab from the last button wraps to the first, and Shift+Tab back', () => {
    render(<GameBriefing {...baseProps} />);
    const first = screen.getByText(/AUTO-FIRE/);
    const last = screen.getByText('BACK');
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  test('Escape cancels', () => {
    render(<GameBriefing {...baseProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('Escape does nothing while inactive', () => {
    render(<GameBriefing {...baseProps} active={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(baseProps.onCancel).not.toHaveBeenCalled();
  });

  test('returns focus to where it was when it closes', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = render(<GameBriefing {...baseProps} />);
    rerender(<GameBriefing {...baseProps} active={false} />);
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
