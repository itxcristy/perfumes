import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Address, AddressContextType } from '../types';
import { apiClient } from '../lib/apiClient';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (!context) throw new Error('useAddresses must be used within an AddressProvider');
  return context;
};

export const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.getAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch addresses'
      });
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      showNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to add an address'
      });
      return;
    }

    try {
      await apiClient.createAddress(address);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Address Added',
        message: 'Your address has been added successfully'
      });
    } catch (error) {
      console.error('Error adding address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add address'
      });
    }
  };

  const updateAddress = async (address: Address) => {
    try {
      await apiClient.updateAddress(address.id, address);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Address Updated',
        message: 'Your address has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update address'
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await apiClient.deleteAddress(addressId);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Address Deleted',
        message: 'Your address has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete address'
      });
    }
  };

  const setDefaultAddress = async (addressId: string, type: 'shipping' | 'billing') => {
    try {
      await apiClient.setDefaultAddress(addressId);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Default Address Set',
        message: `Default ${type} address has been updated`
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to set default address'
      });
    }
  };

  const value: AddressContextType = {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    fetchAddresses,
    loading
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
};
