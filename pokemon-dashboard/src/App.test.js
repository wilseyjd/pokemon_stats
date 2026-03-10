import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./components/PokemonDashboard', () => () => <div>Dashboard</div>);
jest.mock('./components/PokemonComparison', () => () => <div>Comparison</div>);

test('renders navigation links', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/single/i)).toBeInTheDocument();
  expect(screen.getByText(/compare/i)).toBeInTheDocument();
});
