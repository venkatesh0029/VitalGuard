import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard component by default', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Active Patients/i);
  expect(titleElements.length).toBeGreaterThan(0);
});
