import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '@/components/layout/Header';

// Create a wrapper component for providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the logo and navigation items', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // Check if logo is present
    expect(screen.getByText(/casino/i)).toBeInTheDocument();

    // Check navigation items
    expect(screen.getByText(/casino/i)).toBeInTheDocument();
    expect(screen.getByText(/canlı casino/i)).toBeInTheDocument();
    expect(screen.getByText(/spor bahisleri/i)).toBeInTheDocument();
  });

  it('shows login and register buttons when user is not authenticated', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText(/giriş yap/i)).toBeInTheDocument();
    expect(screen.getByText(/kayıt ol/i)).toBeInTheDocument();
  });

  it('opens login modal when login button is clicked', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const loginButton = screen.getByText(/giriş yap/i);
    fireEvent.click(loginButton);

    // Modal should be opened (you might need to adjust this based on your modal implementation)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens register modal when register button is clicked', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const registerButton = screen.getByText(/kayıt ol/i);
    fireEvent.click(registerButton);

    // Modal should be opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is responsive and shows mobile menu on small screens', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // Check if mobile menu button is present (adjust selector based on your implementation)
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    expect(mobileMenuButton).toBeInTheDocument();

    // Click mobile menu button
    fireEvent.click(mobileMenuButton);

    // Check if mobile navigation is visible
    expect(screen.getByRole('navigation')).toHaveClass('mobile-nav'); // Adjust class name
  });

  it('displays user menu when authenticated', async () => {
    // Mock authenticated state
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: { first_name: 'Test', last_name: 'User' }
    };

    vi.mocked(require('@/integrations/supabase/client').supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // Wait for user data to load and check for user menu
    await screen.findByText(/test user/i);
    expect(screen.getByText(/profil/i)).toBeInTheDocument();
    expect(screen.getByText(/çıkış/i)).toBeInTheDocument();
  });
});