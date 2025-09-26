import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NewUserService } from '../NewUserService';
import { supabase } from '../../supabase';
import { AppError } from '../../utils/errorHandling';

// Mock Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    },
    rpc: vi.fn()
  }
}));

// Mock error handling
vi.mock('../../utils/errorHandling', () => ({
  ErrorCode: {
    DATABASE_ERROR: 'DATABASE_ERROR'
  },
  AppError: class MockAppError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'AppError';
    }
  }
}));

describe('NewUserService', () => {
  let userService: NewUserService;
  
  beforeEach(() => {
    userService = new NewUserService();
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      const mockData = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'customer',
        phone: '1234567890',
        date_of_birth: '1990-01-01',
        is_active: true,
        email_verified: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      const mockResponse = { data: mockData, error: null };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        single: mockSingle
      });
      
      mockSingle.mockResolvedValue(mockResponse);
      
      const result = await userService.getUserById('1');
      
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        phone: '1234567890',
        dateOfBirth: '1990-01-01',
        isActive: true,
        emailVerified: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      });
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database error');
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        single: mockSingle
      });
      
      mockSingle.mockResolvedValue({ data: null, error: mockError });
      
      await expect(userService.getUserById('1')).rejects.toThrow(AppError);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'customer' as const,
        phone: '0987654321',
        dateOfBirth: '1995-05-05',
        isActive: true
      };
      
      const mockProfileData = {
        id: 'new1',
        email: 'newuser@example.com',
        full_name: 'New User',
        role: 'customer',
        phone: '0987654321',
        date_of_birth: '1995-05-05',
        is_active: true,
        email_verified: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      // Mock checking if user already exists (return null to indicate user doesn't exist)
      const mockExistingUserSelect = vi.fn().mockReturnThis();
      const mockExistingUserEq = vi.fn().mockReturnThis();
      const mockExistingUserSingle = vi.fn().mockReturnThis();
      const mockExistingUserResponse = { data: null, error: { code: 'PGRST116' } };
      
      // Mock RPC call for creating user
      const mockRpc = vi.fn().mockResolvedValue({ data: 'new1', error: null });
      
      // Mock getting the created user profile
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      const mockProfileResponse = { data: mockProfileData, error: null };
      
      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockExistingUserSelect
          };
        }
        return {};
      });
      
      mockExistingUserSelect.mockReturnValue({
        eq: mockExistingUserEq
      });
      
      mockExistingUserEq.mockReturnValue({
        single: mockExistingUserSingle
      });
      
      mockExistingUserSingle.mockResolvedValue(mockExistingUserResponse);
      
      (supabase.rpc as Mock).mockImplementation(mockRpc);
      
      // Mock the second call to supabase.from for getting the created profile
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: mockSelect
      }) as any);
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        single: mockSingle
      });
      
      mockSingle.mockResolvedValue(mockProfileResponse);
      
      const result = await userService.createUser(userData);
      
      expect(result).toEqual({
        id: 'new1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'customer',
        phone: '0987654321',
        dateOfBirth: '1995-05-05',
        isActive: true,
        emailVerified: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      });
    });
  });
});