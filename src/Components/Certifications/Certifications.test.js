import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Certifications from './Certifications';
import {
  certificationData,
  certificationGroups,
} from '../../assets/JSON/certificationsData';

describe('Certifications', () => {
  test('renders the Certifications heading', () => {
    render(<Certifications />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Certifications' })
    ).toBeInTheDocument();
  });

  test('renders a heading for every group', () => {
    render(<Certifications />);
    certificationGroups.forEach((group) => {
      expect(
        screen.getByRole('heading', { level: 3, name: group })
      ).toBeInTheDocument();
    });
  });

  test('lists every certification under its own group', () => {
    render(<Certifications />);
    certificationGroups.forEach((group) => {
      const list = screen.getByRole('list', { name: group });
      const expected = certificationData.filter((c) => c.group === group);
      expect(within(list).getAllByRole('listitem')).toHaveLength(
        expected.length
      );
      expected.forEach((cert) => {
        expect(within(list).getByText(cert.title)).toBeInTheDocument();
        expect(within(list).getByText(cert.name)).toBeInTheDocument();
      });
    });
  });

  test('shows every certification at once, with no carousel controls', () => {
    render(<Certifications />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('links to the badges on Credly for verification', () => {
    render(<Certifications />);
    expect(
      screen.getByRole('link', { name: /verify on credly/i })
    ).toHaveAttribute(
      'href',
      'https://www.credly.com/users/patryknowak1990/badges'
    );
  });
});
