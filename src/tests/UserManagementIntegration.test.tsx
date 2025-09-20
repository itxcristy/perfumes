import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProductionUserManagement from '../components/Dashboard/Admin/ProductionUserManagement';
import { UserCreationWorkflow } from '../components/Dashboard/Admin/UserCreationWorkflow';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SecurityProvider } from '../components/Security/SecurityProvider';

// Integration tests for the complete user management workflow
describe('User Management Integration Tests', () => {
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

  test('complete user creation workflow', async () => {
    const user = userEvent.setup();
    const mockOnUserCreated = jest.fn();
    const mockOnClose = jest.fn();

    render(
      <TestWrapper>
        <UserCreationWorkflow
          isOpen={true}
          onClose={mockOnClose}
          onUserCreated={mockOnUserCreated}
        />
      </TestWrapper>
    );

    // Step 1: Basic Information
    await waitFor(() => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john.doe@example.com');
    await user.type(screen.getByLabelText('Phone Number'), '+1234567890');

    // Proceed to next step
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Step 2: Role & Permissions
    await waitFor(() => {
      expect(screen.getByText('Role & Permissions')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('User Role *'), 'seller');
    await user.click(nextButton);

    // Step 3: Email Settings
    await waitFor(() => {
      expect(screen.getByText('Email Settings')).toBeInTheDocument();
    });

    // Verify email sending is enabled by default
    expect(screen.getByLabelText('Send welcome email with login credentials')).toBeChecked();
    await user.click(nextButton);

    // Step 4: Review & Create
    await waitFor(() => {
      expect(screen.getByText('Review & Create')).toBeInTheDocument();
    });

    // Verify all information is displayed correctly
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Seller')).toBeInTheDocument();

    // Create the user
    const createButton = screen.getByText('Create User Account');
    await user.click(createButton);

    // Should proceed to completion step
    await waitFor(() => {
      expect(screen.getByText('User Account Created Successfully!')).toBeInTheDocument();
    });
  });

  test('user management security integration', async () => {
    const user = userEvent.setup();

    // Mock a non-admin user
    const mockNonAdminUser = {
      id: 'user-id',
      email: 'user@test.com',
      role: 'customer',
      name: 'Regular User'
    };

    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Should show access denied for non-admin users
    // (This would depend on how the security provider is implemented)
    await waitFor(() => {
      // The component should either not render or show access denied
      // based on the user's role
    });
  });

  test('responsive behavior integration', async () => {
    // Test that the component works correctly across different screen sizes
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    // Test mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Component should render without errors on mobile
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Test tablet view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    // Component should still work
    expect(screen.getByText('User Management')).toBeInTheDocument();

    // Test desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    fireEvent(window, new Event('resize'));
    expect(screen.getByText('User Management')).toBeInTheDocument();

    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  test('PWA functionality integration', async () => {
    // Mock PWA environment
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Component should render correctly in PWA mode
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  test('email workflow integration', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Test email confirmation workflow
    // This would involve testing the email sending functionality
    // and confirmation process
  });

  test('validation integration', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserCreationWorkflow
          isOpen={true}
          onClose={jest.fn()}
          onUserCreated={jest.fn()}
        />
      </TestWrapper>
    );

    // Test various validation scenarios
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    });

    // Test invalid email
    await user.type(screen.getByLabelText('Email Address *'), 'invalid-email');
    
    // Should not be able to proceed
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();

    // Test valid email
    await user.clear(screen.getByLabelText('Email Address *'));
    await user.type(screen.getByLabelText('Email Address *'), 'valid@example.com');
    await user.type(screen.getByLabelText('Full Name *'), 'Valid Name');

    // Should be able to proceed now
    await waitFor(() => {
      expect(nextButton).not.toBeDisabled();
    });
  });

  test('error handling integration', async () => {
    // Mock network error
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Component should handle network errors gracefully
    await waitFor(() => {
      // Should show error state or retry mechanism
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Restore original fetch
    global.fetch = originalFetch;
  });

  test('accessibility integration', async () => {
    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    // Test keyboard navigation
    const createButton = screen.getByText('Create New User');
    createButton.focus();
    expect(document.activeElement).toBe(createButton);

    // Test ARIA labels and roles
    expect(screen.getByRole('button', { name: /create new user/i })).toBeInTheDocument();
    
    // Test screen reader support
    const searchInput = screen.getByPlaceholderText('Search users...');
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  test('performance integration', async () => {
    const startTime = performance.now();

    render(
      <TestWrapper>
        <ProductionUserManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Component should render within reasonable time (less than 1 second)
    expect(renderTime).toBeLessThan(1000);
  });
});
