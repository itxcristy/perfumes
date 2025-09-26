import { DataService, supabase } from '../dataService';
import { User } from '../../types';

export class UserService extends DataService {
  // Get profile for user
  async getProfileForUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      return data ? {
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
      } : null;
    } catch (error) {
      return this.handleError(error, 'Get Profile For User');
    }
  }
}