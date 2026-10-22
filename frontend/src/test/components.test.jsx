import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Marketplace from '../pages/Marketplace';
import MyIssues from '../pages/MyIssues';
import NotFound from '../pages/NotFound';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  setAuthHeader: vi.fn(),
  clearAuthHeader: vi.fn(),
}));

import api from '../api/client';

const renderWithProviders = (ui, { route = '/' } = {}) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.put.mockReset();
  api.delete.mockReset();
});

describe('App routing', () => {
  it('renders the home page at /', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderWithProviders(<App />, { route: '/' });
    expect(
      await screen.findByText(/Report damaged roads/i)
    ).toBeInTheDocument();
  });

  it('renders the 404 page for unknown routes', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderWithProviders(<App />, { route: '/does-not-exist' });
    expect(await screen.findByText(/Page not found/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users away from protected routes', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderWithProviders(<App />, { route: '/my-issues' });
    expect(await screen.findByText(/Sign in to CivicFix/i)).toBeInTheDocument();
  });
});

describe('Login page', () => {
  it('submits credentials and authenticates', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '1', email: 'citizen@example.com', full_name: 'Ravi Kumar', role: 'citizen' },
      },
    });
    api.get.mockResolvedValue({ data: { id: '1', email: 'citizen@example.com' } });

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByLabelText(/Email address/i), 'citizen@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Admin@123');
    await userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'citizen@example.com',
        password: 'Admin@123',
      });
    });
  });

  it('shows an error message when login fails', async () => {
    api.post.mockRejectedValue(new Error('Invalid credentials'));
    renderWithProviders(<Login />);
    await userEvent.type(screen.getByLabelText(/Email address/i), 'citizen@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });
});

describe('Register page', () => {
  it('rejects mismatched passwords before calling the API', async () => {
    renderWithProviders(<Register />);
    await userEvent.type(screen.getByLabelText(/Full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password1');
    await userEvent.type(screen.getByLabelText(/Confirm password/i), 'Password2');
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('rejects short passwords', async () => {
    renderWithProviders(<Register />);
    await userEvent.type(screen.getByLabelText(/Full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'abc');
    await userEvent.type(screen.getByLabelText(/Confirm password/i), 'abc');
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('registers a citizen successfully', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '2', email: 'test@example.com', full_name: 'Test User', role: 'citizen' },
      },
    });
    api.get.mockResolvedValue({ data: { id: '2', email: 'test@example.com' } });

    renderWithProviders(<Register />);
    await userEvent.type(screen.getByLabelText(/Full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password1');
    await userEvent.type(screen.getByLabelText(/Confirm password/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '',
        password: 'Password1',
        role: 'citizen',
      });
    });
  });
});
