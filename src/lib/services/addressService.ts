import { DataService, supabase } from '../dataService';
import { Address } from '../../types';

export class AddressService extends DataService {
  // Get user addresses
  async getUserAddresses(userId?: string) {
    try {
      // Get user ID if not provided
      if (!userId) {
        const user = await this.getCurrentUser();
        if (!user) {
          console.warn('No authenticated user found for addresses');
          return [];
        }
        userId = user.id;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        id: item.id,
        fullName: item.full_name,
        streetAddress: item.street_address,
        city: item.city,
        state: item.state,
        postalCode: item.postal_code,
        country: item.country,
        phone: item.phone,
        type: item.type,
        isDefault: item.is_default,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      return this.handleError(error, 'Get User Addresses');
    }
  }

  // Add address
  async addAddress(addressData: any): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: addressData.fullName,
          street_address: addressData.streetAddress,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postalCode,
          country: addressData.country,
          phone: addressData.phone,
          type: addressData.type,
          is_default: addressData.isDefault,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Add Address');
      return false;
    }
  }

  // Update address
  async updateAddress(addressData: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('addresses')
        .update({
          full_name: addressData.fullName,
          street_address: addressData.streetAddress,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postalCode,
          country: addressData.country,
          phone: addressData.phone,
          type: addressData.type,
          is_default: addressData.isDefault,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressData.id);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Update Address');
      return false;
    }
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Delete Address');
      return false;
    }
  }
}