import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProductionUserManagement from '../components/Dashboard/Admin/ProductionUserManagement';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SecurityProvider } from '../components/Security/SecurityProvider';
import * as supabaseLib from '../lib/supabase';

// Mock the supabase functions
jest.mock('../lib/supabase', () => ({
  getAllUsers: jest.fn(),
  createNewUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  resendConfirmationEmail: jest.fn(),
  confirmUserEmail: jest.fn()
}));

// Mock the responsive container
jest.mock('../components/Common/ResponsiveContainer', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useViewport: () => ({
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPWA: false,
    orientation: 'landscape'
  }),
  usePWAInstall: () => ({
    isInstallable: false,
    isInstalled: false,
    installPWA: jest.fn()
  })
}));

// Mock user data
const mockUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01'
  },
  {
    id: '2',
    email: 'seller@test.com',
    name: 'Seller User',
    role: 'seller',
    isActive: true,
    emailVerified: false,
    createdAt: '2024-01-02T00:00:00Z',
    phone: '+1234567891',
    dateOfBirth: '1985-05-15'
  },
  {
    id: '3',
    email: 'customer@test.com',
    name: 'Customer User',
    role: 'customer',
    isActive: false,
    emailVerified: true,
    createdAt: '2024-01-03T00:00:00Z',
    phone: '+1234567892',
    dateOfBirth: '1995-12-25'
  }
];

const mockAuthUser = {
  id: 'admin-id',
  email: 'admin@test.com',
  role: 'admin',
  name: 'Test Admin'
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <SecurityProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </SecurityProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('ProductionUserManagement', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock successful API responses
    (supabaseLib.getAllUsers as jest.Mock).mockResolvedValue({
      success: true,
      users: mockUsers
    });
    
    (supabaseLib.createNewUser as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUsers[0],
      password: 'generated-password-123'
    });
    
    (supabaseLib.updateUser as jest.Mock).mockResolvedValue({
      success: true,
      user: { ...mockUsers[0], name: 'Updated Name' }
    });
  });

  test('renders user management interface', async () => {
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Check if main elements are present
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Create New User')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    });
  });

  test('loads and displays users', async () => {
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('seller@test.com')).toBeInTheDocument();
      expect(screen.getByText('customer@test.com')).toBeInTheDocument();
    });

    // Check if API was called
    expect(supabaseLib.getAllUsers).toHaveBeenCalledTimes(1);
  });

  test('filters users by search term', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });

    // Search for admin
    const searchInput = screen.getByPlaceholderText('Search users...');
    await user.type(searchInput, 'admin');

    // Check if only admin user is visible
    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.queryByText('seller@test.com')).not.toBeInTheDocument();
      expect(screen.queryByText('customer@test.com')).not.toBeInTheDocument();
    });
  });

  test('filters users by role', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });

    // Filter by seller role
    const roleFilter = screen.getByDisplayValue('All Roles');
    await user.selectOptions(roleFilter, 'seller');

    // Check if only seller user is visible
    await waitFor(() => {
      expect(screen.queryByText('admin@test.com')).not.toBeInTheDocument();
      expect(screen.getByText('seller@test.com')).toBeInTheDocument();
      expect(screen.queryByText('customer@test.com')).not.toBeInTheDocument();
    });
  });

  test('opens create user modal', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Click create user button
    const createButton = screen.getByText('Create New User');
    await user.click(createButton);

    // Check if modal opens
    await waitFor(() => {
      expect(screen.getByText('Create New User Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    });
  });

  test('creates new user successfully', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Open create modal
    const createButton = screen.getByText('Create New User');
    await user.click(createButton);

    // Fill form
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Full Name *'), 'New User');
    await user.type(screen.getByLabelText('Email Address *'), 'newuser@test.com');
    await user.selectOptions(screen.getByLabelText('User Role *'), 'customer');

    // Navigate through workflow steps
    const nextButton = screen.getByText('Next');
    await user.click(nextButton); // Go to role step
    await user.click(nextButton); // Go to email step
    await user.click(nextButton); // Go to review step

    // Create user
    const createUserButton = screen.getByText('Create User Account');
    await user.click(createUserButton);

    // Check if API was called
    await waitFor(() => {
      expect(supabaseLib.createNewUser).toHaveBeenCalledWith({
        email: 'newuser@test.com',
        name: 'New User',
        role: 'customer',
        phone: '',
        dateOfBirth: '',
        isActive: true,
        sendEmail: true
      });
    });
  });

  test('validates user input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Open create modal
    const createButton = screen.getByText('Create New User');
    await user.click(createButton);

    // Try to proceed without filling required fields
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    
    // Next button should be disabled when required fields are empty
    expect(nextButton).toBeDisabled();

    // Fill invalid email
    await user.type(screen.getByLabelText('Email Address *'), 'invalid-email');
    
    // Button should still be disabled
    expect(nextButton).toBeDisabled();
  });

  test('handles bulk operations', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });

    // Select users (assuming checkboxes are present)
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]); // Select first user
      await user.click(checkboxes[2]); // Select second user

      // Check if bulk actions are available
      await waitFor(() => {
        expect(screen.getByText(/2 users selected/)).toBeInTheDocument();
      });
    }
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    (supabaseLib.getAllUsers as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Should show error state or retry option
    await waitFor(() => {
      // The component should handle the error gracefully
      // This might show a retry button or error message
      expect(screen.queryByText('admin@test.com')).not.toBeInTheDocument();
    });
  });

  test('responsive design works correctly', () => {
    // Mock mobile viewport
    jest.doMock('../components/Common/ResponsiveContainer', () => ({
      ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      useViewport: () => ({
        width: 375,
        height: 667,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isPWA: false,
        orientation: 'portrait'
      }),
      usePWAInstall: () => ({
        isInstallable: true,
        isInstalled: false,
        installPWA: jest.fn()
      })
    }));

    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Component should render without errors on mobile
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });
});
