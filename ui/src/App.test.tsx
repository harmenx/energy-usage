import { render, screen } from '@testing-library/react';
import App from './App';

test('renders all components', () => {
  render(<App />);
  const paginationElement = screen.getByTestId('pagination');
  const uploadForm = screen.getByTestId('upload-form');
  const uploadHistory = screen.getByTestId('upload-history');

  expect(paginationElement).toBeInTheDocument();
  expect(uploadForm).toBeInTheDocument();
  expect(uploadHistory).toBeInTheDocument();
});
