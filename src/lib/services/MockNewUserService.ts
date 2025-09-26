import { MockBaseService } from './MockBaseService';
import { User } from '../../types';
import { Cache, CacheInvalidation } from '../newCaching';

// Mock user data
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'user-2',
    email: 'customer@example.com',
    name: 'Customer User',
    role: 'customer',
    phone: '+1234567891',
    dateOfBirth: '1995-05-15',
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01')
  },
  {
    id: 'user-3',
    email: 'seller@example.com',
    name: 'Seller User',
    role: 'seller',
    phone: '+1234567892',
    dateOfBirth: '1985-10-20',
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01')
  }
];

/**
 * Mock user service handling all user-related operations
 * Used when Supabase is not available
 */
export class MockNewUserService extends MockBaseService {
  /**
   * Get a user profile by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      // Try to get from cache first
      const cacheKey = `users:${id}`;
      const cached = Cache.get<User>(cacheKey);
      if (cached) {
        return cached;
      }

      // Find user in mock data
      const user = mockUsers.find(u => u.id === id) || null;

      if (user) {
        // Cache the result
        Cache.set(cacheKey, user, 10 * 60 * 1000); // 10 minutes
      }

      return user;
    } catch (error) {
      return this.handleError(error, 'Get User By ID');
    }
  }

  /**
   * Update a user profile
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      if (!userId) throw new Error('User ID is required');

      // Validate email if provided
      if (updates.email) {
        this.validateEmail(updates.email);
      }

      // Find the user
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create updated user by explicitly setting all required properties
      const updatedUser: User = {
        id: user.id,
        email: updates.email !== undefined ? updates.email : user.email,
        name: updates.name !== undefined ? updates.name : user.name,
        role: updates.role !== undefined ? updates.role : user.role,
        createdAt: user.createdAt,
        updatedAt: new Date()
      };

      // Set optional properties if they exist in updates or existing user
      if (updates.avatar !== undefined) {
        updatedUser.avatar = updates.avatar;
      } else if (user.avatar !== undefined) {
        updatedUser.avatar = user.avatar;
      }

      if (updates.phone !== undefined) {
        updatedUser.phone = updates.phone;
      } else if (user.phone !== undefined) {
        updatedUser.phone = user.phone;
      }

      if (updates.dateOfBirth !== undefined) {
        updatedUser.dateOfBirth = updates.dateOfBirth;
      } else if (user.dateOfBirth !== undefined) {
        updatedUser.dateOfBirth = user.dateOfBirth;
      }

      if (updates.isActive !== undefined) {
        updatedUser.isActive = updates.isActive;
      } else if (user.isActive !== undefined) {
        updatedUser.isActive = user.isActive;
      }

      if (updates.emailVerified !== undefined) {
        updatedUser.emailVerified = updates.emailVerified;
      } else if (user.emailVerified !== undefined) {
        updatedUser.emailVerified = user.emailVerified;
      }

      if (updates.password !== undefined) {
        updatedUser.password = updates.password;
      } else if (user.password !== undefined) {
        updatedUser.password = user.password;
      }

      // Update in the array
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
      }

      // Invalidate cache
      CacheInvalidation.invalidateUser(userId);

      return updatedUser;
    } catch (error) {
      return this.handleError(error, 'Update User');
    }
  }

  /**
   * Delete a user (with data cleanup)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!userId) throw new Error('User ID is required');

      // Find the user
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Remove the user
      mockUsers.splice(userIndex, 1);

      // Invalidate cache
      CacheInvalidation.invalidateUser(userId);

      return true;
    } catch (error) {
      this.handleError(error, 'Delete User');
      return false;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    email: string;
    name: string;
    role: 'admin' | 'seller' | 'customer';
    phone?: string;
    dateOfBirth?: string;
    isActive?: boolean;
  }): Promise<User> {
    try {
      // Validate required fields
      this.validateRequired(userData, ['email', 'name', 'role']);
      this.validateEmail(userData.email);

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUsers.push(newUser);

      // Invalidate cache
      CacheInvalidation.invalidateUsers();

      return newUser;
    } catch (error) {
      return this.handleError(error, 'Create User');
    }
  }

  /**
   * Get all users (for admin purposes)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return [...mockUsers];
    } catch (error) {
      return this.handleError(error, 'Get All Users');
    }
  }
}