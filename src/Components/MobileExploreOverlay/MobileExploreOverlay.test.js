import React from 'react';
import { render, screen } from '@testing-library/react';
import MobileExploreOverlay from './MobileExploreOverlay';

describe('MobileExploreOverlay', () => {
  test('renders without crashing', () => {
    const { container } = render(<MobileExploreOverlay />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('shows MOVE zone label', () => {
    render(<MobileExploreOverlay />);
    expect(screen.getByText('MOVE')).toBeInTheDocument();
  });

  test('shows LOOK zone label', () => {
    render(<MobileExploreOverlay />);
    expect(screen.getByText('LOOK')).toBeInTheDocument();
  });
});
