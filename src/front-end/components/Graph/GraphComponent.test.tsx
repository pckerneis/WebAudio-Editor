import React from 'react';
import { render, screen } from '@testing-library/react';
import Graph from './GraphComponent';

test('renders learn react link', () => {
  render(<Graph />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
