import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExploreButton from './ExploreButton';

const baseProps = {
  exploring: false,
  gameMode: false,
  onToggle: jest.fn(),
  onGameModeToggle: jest.fn(),
  isMobile: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ExploreButton — idle state', () => {
  test('renders the hamburger menu button', () => {
    render(<ExploreButton {...baseProps} />);
    expect(screen.getByText('☰ MENU')).toBeInTheDocument();
  });

  test('clicking hamburger shows CLOSE label and dropdown', () => {
    render(<ExploreButton {...baseProps} />);
    fireEvent.click(screen.getByText('☰ MENU'));
    expect(screen.getByText('✕ CLOSE')).toBeInTheDocument();
    expect(screen.getByText('⬡ EXPLORE')).toBeInTheDocument();
    expect(screen.getByText('⊕ GAME MODE')).toBeInTheDocument();
  });

  test('clicking EXPLORE calls onToggle', () => {
    render(<ExploreButton {...baseProps} />);
    fireEvent.click(screen.getByText('☰ MENU'));
    fireEvent.click(screen.getByText('⬡ EXPLORE'));
    expect(baseProps.onToggle).toHaveBeenCalledTimes(1);
  });

  test('clicking GAME MODE calls onGameModeToggle', () => {
    render(<ExploreButton {...baseProps} />);
    fireEvent.click(screen.getByText('☰ MENU'));
    fireEvent.click(screen.getByText('⊕ GAME MODE'));
    expect(baseProps.onGameModeToggle).toHaveBeenCalledTimes(1);
  });
});

describe('ExploreButton — explore mode', () => {
  const exploreProps = { ...baseProps, exploring: true, gameMode: false };

  test('renders the EXPLORING active button', () => {
    render(<ExploreButton {...exploreProps} />);
    expect(screen.getByText('⬡ EXPLORING')).toBeInTheDocument();
  });

  test('clicking EXPLORING calls onToggle', () => {
    render(<ExploreButton {...exploreProps} />);
    fireEvent.click(screen.getByText('⬡ EXPLORING'));
    expect(baseProps.onToggle).toHaveBeenCalledTimes(1);
  });

  test('shows desktop control hint when isMobile is false', () => {
    render(<ExploreButton {...exploreProps} isMobile={false} />);
    expect(screen.getByText(/SPACE \/ E — up \/ down/)).toBeInTheDocument();
  });

  test('shows mobile control hint when isMobile is true', () => {
    render(<ExploreButton {...exploreProps} isMobile={true} />);
    expect(screen.getByText(/LEFT — move/)).toBeInTheDocument();
  });
});

describe('ExploreButton — game mode', () => {
  const gameModeProps = { ...baseProps, gameMode: true, exploring: false };

  test('renders the IN COMBAT active button', () => {
    render(<ExploreButton {...gameModeProps} />);
    expect(screen.getByText('⊕ IN COMBAT')).toBeInTheDocument();
  });

  test('clicking IN COMBAT calls onGameModeToggle', () => {
    render(<ExploreButton {...gameModeProps} />);
    fireEvent.click(screen.getByText('⊕ IN COMBAT'));
    expect(baseProps.onGameModeToggle).toHaveBeenCalledTimes(1);
  });

  test('shows manual-fire hint on desktop', () => {
    render(<ExploreButton {...gameModeProps} />);
    expect(screen.getByText(/HOLD CLICK — fire/)).toBeInTheDocument();
  });

  test('shows touch-button hint on mobile', () => {
    render(<ExploreButton {...gameModeProps} isMobile={true} />);
    expect(screen.getByText(/FIRE \/ BOOST — buttons/)).toBeInTheDocument();
  });

  test('does not show the desktop explore hint', () => {
    render(<ExploreButton {...gameModeProps} />);
    expect(screen.queryByText(/SPACE \/ E — up \/ down/)).not.toBeInTheDocument();
  });
});
