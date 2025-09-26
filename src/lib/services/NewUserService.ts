import { BaseService } from './BaseService';
import { User } from '../../types';
import { Cache, CacheInvalidation } from '../newCaching';

// Mock user data for direct login mode
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
 * User service handling all user-related operations
 */
export class NewUserService extends BaseService {
  /**
   * Get a user profile by ID
   */
  async getUserById(id: string): Promise<User | null> {
    // If direct login is enabled, use mock data
    if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
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

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      const result = {
        id: data.id,
        email: data.email,
        name: data.full_name,
        role: data.role,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        isActive: data.is_active,
        emailVerified: data.email_verified || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Cache the result
      Cache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get User By ID');
    }
  }

  /**
   * Update a user profile
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    // If direct login is enabled, use mock data
    if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
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

    try {
      if (!userId) throw new Error('User ID is required');

      // Validate email if provided
      if (updates.email) {
        this.validateEmail(updates.email);
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.full_name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      const result = {
        id: data.id,
        email: data.email,
        name: data.full_name,
        role: data.role,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        isActive: data.is_active,
        emailVerified: data.email_verified || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Invalidate cache
      CacheInvalidation.invalidateUser(userId);

      return result;
    } catch (error) {
      return this.handleError(error, 'Update User');
    }
  }

  /**
   * Delete a user (with data cleanup)
   */
  async deleteUser(userId: string): Promise<boolean> {
    // If direct login is enabled, use mock data
    if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
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

    try {
      if (!userId) throw new Error('User ID is required');

      // First, check if user exists
      const { data: user, error: userError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!user) {
        throw new Error('User not found');
      }

      // Delete related data first (to maintain referential integrity)
      const relatedTables = ['addresses', 'cart_items', 'wishlist_items', 'reviews'];
      
      for (const table of relatedTables) {
        const { error } = await this.supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
        
        if (error) {
          console.warn(`Failed to delete data from ${table} for user ${userId}:`, error);
        }
      }

      // Delete the user profile
      const { error } = await this.supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Invalidate cache
      CacheInvalidation.invalidateUser(userId);

      return true;
    } catch (error) {
      this.handleError(error, 'Delete User');
      return false; // This line will never be reached due to handleError throwing, but TypeScript needs it
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
    // If direct login is enabled, use mock data
    if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
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

    try {
      // Validate required fields
      this.validateRequired(userData, ['email', 'name', 'role']);
      this.validateEmail(userData.email);

      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        throw existingUserError;
      }

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Use the database function to create user profile
      const { data: userId, error: createError } = await this.supabase.rpc('create_user_profile', {
        p_email: userData.email,
        p_full_name: userData.name,
        p_role: userData.role,
        p_phone: userData.phone || null,
        p_date_of_birth: userData.dateOfBirth || null,
        p_is_active: userData.isActive !== undefined ? userData.isActive : true
      });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      // Get the created user profile
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const result = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.full_name,
        role: profileData.role,
        phone: profileData.phone,
        dateOfBirth: profileData.date_of_birth,
        isActive: profileData.is_active,
        emailVerified: profileData.email_verified || true,
        createdAt: new Date(profileData.created_at),
        updatedAt: new Date(profileData.updated_at)
      };

      // Invalidate cache
      CacheInvalidation.invalidateUsers();

      return result;
    } catch (error) {
      return this.handleError(error, 'Create User');
    }
  }
}