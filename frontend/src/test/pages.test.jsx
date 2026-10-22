import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Marketplace from '../pages/Marketplace';
import MyIssues from '../pages/MyIssues';
import AdminProfiles from '../pages/AdminProfiles';
import Guidance from '../pages/Guidance';

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

const signIn = (role = 'citizen') => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem(
    'user',
    JSON.stringify({ id: '1', email: 'a@b.com', full_name: 'Test User', role })
  );
};

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.put.mockReset();
  api.delete.mockReset();
});

describe('Marketplace', () => {
  it('lists services returned by the API', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/services')) {
        return Promise.resolve({
          data: [
            {
              id: 's1',
              title: 'Veg Thali',
              description: 'Home cooked meals',
              price: 150,
              category: 'Tiffin / Home Food Service',
              availability: 'Morning',
              city: 'Chennai',
              business_name: 'Priya Home Tiffin',
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<Marketplace />);

    expect(await screen.findByText('Veg Thali')).toBeInTheDocument();
    expect(screen.getByText('Priya Home Tiffin')).toBeInTheDocument();
    expect(screen.getByText(/\u20B9150/)).toBeInTheDocument();
  });

  it('shows an empty state when no services match', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderWithProviders(<Marketplace />);

    expect(await screen.findByText(/No services match your search/i)).toBeInTheDocument();
  });

  it('sends the search term as a query parameter', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderWithProviders(<Marketplace />);

    await userEvent.type(screen.getByLabelText(/Search services/i), 'thali');

    await waitFor(() => {
      const calls = api.get.mock.calls.filter(([url]) => url.startsWith('/services?'));
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[calls.length - 1][0]).toContain('search=thali');
    });
  });
});

describe('MyIssues', () => {
  it('renders the citizen issues with status badges', async () => {
    signIn('citizen');
    api.get.mockResolvedValue({
      data: [
        {
          id: 'i1',
          category: 'Pothole',
          description: 'Large pothole near the bus stop',
          status: 'resolved',
          priority: 'high',
          created_at: '2026-10-01T10:00:00Z',
          address: 'Bridge Road',
          image_url: null,
        },
      ],
    });

    renderWithProviders(<MyIssues />);

    expect(await screen.findByText(/Large pothole near the bus stop/i)).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Pothole')).toBeInTheDocument();
  });

  it('shows an empty state when the citizen has no reports', async () => {
    signIn('citizen');
    api.get.mockResolvedValue({ data: [] });

    renderWithProviders(<MyIssues />);

    expect(await screen.findByText(/No reports yet/i)).toBeInTheDocument();
  });
});

describe('AdminProfiles', () => {
  it('approves a pending business profile', async () => {
    signIn('admin');
    api.get.mockResolvedValue({
      data: [
        {
          id: 'p1',
          business_name: 'Meera Tailoring',
          full_name: 'Meera Nair',
          email: 'meera@example.com',
          category_name: 'Tailoring & Stitching',
          city: 'Chennai',
          status: 'pending',
          created_at: '2026-10-01T10:00:00Z',
          description: 'Custom tailoring',
        },
      ],
    });
    api.put.mockResolvedValue({ data: { id: 'p1', status: 'approved' } });

    renderWithProviders(<AdminProfiles />);

    expect(await screen.findByText('Meera Tailoring')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^Approve$/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/admin/profiles/p1/status', { status: 'approved' });
    });
  });
});

describe('Guidance', () => {
  it('expands an article to reveal its body', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 'c1',
          title: 'Pricing strategies',
          content: 'Price at raw cost plus a margin.',
          category: 'Pricing',
          created_at: '2026-10-01T10:00:00Z',
        },
      ],
    });

    renderWithProviders(<Guidance />);

    expect(await screen.findByText('Pricing strategies')).toBeInTheDocument();
    expect(screen.getByText(/Price at raw cost plus a margin/i)).toBeInTheDocument();
  });
});
