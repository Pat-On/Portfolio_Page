import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoldButton from './GoldButton';

describe('GoldButton', () => {
  test('renders the company label', () => {
    render(<GoldButton company="Acme Corp" val="0" chosenJob="1" />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  test('button has the correct value attribute', () => {
    render(<GoldButton company="Test" val="2" chosenJob="0" />);
    expect(screen.getByRole('button')).toHaveAttribute('value', '2');
  });

  test('calls action prop when clicked', () => {
    const action = jest.fn();
    render(<GoldButton company="Click" val="0" chosenJob="1" action={action} />);
    fireEvent.click(screen.getByRole('button'));
    expect(action).toHaveBeenCalledTimes(1);
  });

  test('button without action prop does not throw on click', () => {
    render(<GoldButton company="Static" val="0" chosenJob="1" />);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });
});
